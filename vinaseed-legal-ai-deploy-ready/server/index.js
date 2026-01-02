import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

/**
 * CORS:
 * - For local dev: allow http://localhost:5173 by default.
 * - For production: set ALLOWED_ORIGIN to your frontend URL (e.g., https://your-app.vercel.app)
 */
const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin }));

app.use(express.json({ limit: "10mb" }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set. The API will fail until you set it.");
}

const ai = new GoogleGenAI({ apiKey });

const MODEL = process.env.GEMINI_MODEL || "gemini-3-pro-preview";

function getDepartmentPrompt(type) {
  const prompts = {
    HR: "Bạn là chuyên gia Nhân sự cấp cao. Tập trung vào quy chế, chính sách phúc lợi, lương thưởng, kỷ luật và văn hóa doanh nghiệp.",
    FINANCE: "Bạn là chuyên gia Tài chính/Kế toán. Tập trung vào quy trình thanh toán, tạm ứng, định mức chi tiêu, chứng từ và hạch toán.",
    IT: "Bạn là Giám đốc CNTT. Tập trung vào quy trình bảo mật, sử dụng thiết bị, hỗ trợ kỹ thuật, tài khoản và phần mềm.",
    LEGAL: "Bạn là Trợ lý Pháp lý doanh nghiệp. Tập trung vào tính pháp lý, hợp đồng, tuân thủ và rủi ro.",
    GENERAL: "Bạn là Trợ lý điều hành chuyên nghiệp, am hiểu quy trình vận hành chung.",
  };
  return prompts[type] || prompts.GENERAL;
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/ask", async (req, res) => {
  try {
    const { documents = [], question = "", history = [], deptType = "GENERAL" } = req.body || {};

    if (!apiKey) return res.status(500).json({ error: "Server missing GEMINI_API_KEY." });
    if (!question?.trim()) return res.status(400).json({ error: "Missing question." });

    const combinedContext = (documents || [])
      .map((doc) => `--- NỘI DUNG TỆP: ${doc.title || "Untitled"} ---\n${doc.content || ""}`)
      .join("\n\n");

    // Keep context bounded to avoid overly large prompts
    const MAX_CONTEXT_CHARS = Number(process.env.MAX_CONTEXT_CHARS || 30000);
    const boundedContext = combinedContext.slice(0, MAX_CONTEXT_CHARS);

    const systemInstruction = `
${getDepartmentPrompt(deptType)}

QUY TẮC BẮT BUỘC:
- Chỉ trả lời dựa trên văn bản (context) được cung cấp bên dưới.
- Nếu không tìm thấy thông tin trong context, trả lời: "Mình chưa thấy thông tin này trong tài liệu bạn đã tải lên." và gợi ý người dùng cung cấp thêm tài liệu/đoạn liên quan.
- Trả lời ngắn gọn, rõ ràng, theo bullet nếu phù hợp.
- Không bịa/đoán. Không đưa thông tin pháp lý/nhân sự/tài chính vượt quá nội dung tài liệu.

CONTEXT TÀI LIỆU:
${boundedContext}
`.trim();

    const contents = [
      ...(Array.isArray(history) ? history : [])
        .filter((h) => h && (h.role === "user" || h.role === "model") && typeof h.text === "string")
        .map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: "user", parts: [{ text: question }] },
    ];

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    res.json({ text: response?.text || "" });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
