import { DepartmentType, AgentDocument } from "../types";

export class GeminiService {
  /**
   * Ask a question against the currently uploaded documents.
   * NOTE: This calls a backend API (/api/ask) so your Gemini API key is never exposed in the browser.
   */
  async askQuestion(
    documents: AgentDocument[],
    question: string,
    history: { role: "user" | "model"; text: string }[],
    deptType: DepartmentType
  ): Promise<string> {
    const apiBase: string = (import.meta as any).env?.VITE_API_BASE || "";
    const resp = await fetch(`${apiBase}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documents, question, history, deptType }),
    });

    if (!resp.ok) {
      const msg = await resp.text().catch(() => "");
      throw new Error(`API error (${resp.status}): ${msg || "Unknown error"}`);
    }

    const data = (await resp.json()) as { text?: string; error?: string };
    if (data?.error) throw new Error(data.error);
    return data?.text || "";
  }
}

export const geminiService = new GeminiService();
