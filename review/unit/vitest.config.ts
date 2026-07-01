import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// 리뷰 전용 단위테스트 설정(교육생 테스트와 별개).
// 본인 프로젝트 루트에 둘 때는 APP을 "." 로, alias "@"를 프로젝트 설정에 맞춰 바꾸면 됩니다.
const APP = resolve(__dirname, "../..");

export default defineConfig({
  plugins: [react()],
  resolve: {
    // 이 조의 tsconfig paths(@/* → src)에 맞춘 별칭.
    alias: { "@": resolve(APP, "src") },
    // 앱과 테스트가 다른 React 복사본을 쓰면 "Invalid hook call"이 납니다.
    // .npmrc(legacy-peer-deps=true)로 react를 따로 안 받고 앱의 단일 copy를 씁니다.
    dedupe: ["react", "react-dom"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
