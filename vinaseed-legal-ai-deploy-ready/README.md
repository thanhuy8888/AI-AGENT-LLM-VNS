# Vinaseed Legal AI — Trợ lý quy chế thông minh (Deploy-ready)

Dự án này là **Vite + React (frontend)** và **Node/Express (backend)**.

✅ Backend giữ `GEMINI_API_KEY` để **không bao giờ lộ API key trên trình duyệt**.  
✅ Frontend gọi API của backend tại `/api/ask`.

---

## 1) Chạy local (khuyến nghị để test trước khi deploy)

### Yêu cầu
- Node.js 18+ (khuyến nghị 20+)

### Bước 1 — Cài dependencies
```bash
npm install
```

### Bước 2 — Cấu hình frontend
File `.env.local` (đã có sẵn):
```env
VITE_API_BASE=http://localhost:3001
```

### Bước 3 — Cấu hình backend
Tạo file `.env` ở thư mục **root** (hoặc set env vars theo cách bạn muốn):
```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
ALLOWED_ORIGIN=http://localhost:5173
```

### Bước 4 — Chạy backend
```bash
npm run server
```
Backend chạy ở: `http://localhost:3001` (healthcheck: `/health`)

### Bước 5 — Chạy frontend
Mở terminal khác:
```bash
npm run dev
```
Frontend chạy ở: `http://localhost:5173`

---

## 2) Deploy chuẩn (Vercel frontend + Render backend)

### A. Deploy Backend lên Render (Node Web Service)

1) Tạo repo GitHub từ project này (upload toàn bộ).
2) Vào Render → New → **Web Service** → chọn repo.
3) Thiết lập:
- **Build Command:** `npm install`
- **Start Command:** `node server/index.js`
- **Environment Variables:**
  - `GEMINI_API_KEY` = (Gemini API key của bạn)
  - `ALLOWED_ORIGIN` = `https://<your-vercel-app>.vercel.app`  (sau khi deploy frontend)
  - (Tuỳ chọn) `GEMINI_MODEL` = `gemini-3-pro-preview`
  - (Tuỳ chọn) `MAX_CONTEXT_CHARS` = `30000`

4) Deploy xong, bạn sẽ có backend URL dạng:
`https://<your-service>.onrender.com`

Kiểm tra nhanh:
- `https://<your-service>.onrender.com/health` phải trả `{ ok: true }`

---

### B. Deploy Frontend lên Vercel (Vite)

1) Vào Vercel → New Project → chọn repo.
2) Thiết lập:
- **Framework preset:** Vite
- **Environment Variables:**
  - `VITE_API_BASE` = `https://<your-service>.onrender.com`

3) Deploy.

---

## 3) Lưu ý quan trọng (an toàn)
- ❌ KHÔNG để `GEMINI_API_KEY` trong frontend (`.env.local` của Vite) khi deploy.
- ✅ API key chỉ đặt ở backend env vars (Render).

---

## 4) Troubleshooting nhanh
- 401/403 hoặc fail model: kiểm tra `GEMINI_API_KEY` & model name (`GEMINI_MODEL`).
- CORS error: đảm bảo `ALLOWED_ORIGIN` trùng đúng domain Vercel.
- 500 do prompt quá dài: giảm `MAX_CONTEXT_CHARS`.

---

## Files chính
- Frontend: `App.tsx`, `components/*`, `services/geminiService.ts`
- Backend: `server/index.js`
