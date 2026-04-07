import { defineConfig } from "vite";

// 简历 API 与本仓库 backend 默认端口一致（见 README / uvicorn --port）
const BACKEND = "http://127.0.0.1:18080";

export default defineConfig({
  server: {
    proxy: {
      "/api": BACKEND,
      "/health": BACKEND,
    },
  },
  // npm run preview 默认不带 dev 的 proxy，需同样转发 /api
  preview: {
    proxy: {
      "/api": BACKEND,
      "/health": BACKEND,
    },
  },
});
