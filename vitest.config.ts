import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  test: {
    // テスト環境
    environment: "jsdom",

    // セットアップファイル
    setupFiles: ["./src/test/setup.ts"],

    // グローバルAPIを有効化（describe, it, expect等をimportなしで使用）
    globals: true,

    // カバレッジ設定
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*", "src/main.tsx"],
    },

    // テストファイルのパターン
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // タイムアウト設定
    testTimeout: 10000,
  },
});
