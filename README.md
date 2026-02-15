# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## 部署 (GitHub Pages)

本專案已設定使用 GitHub Actions 自動部署至 GitHub Pages。

### 設定步驟

1.  **推送到 GitHub**：確保您的專案已推送到 GitHub 儲存庫的 `main` 分支。

2.  **新增 Secrets**：前往您的 GitHub 儲存庫 -> **Settings** (設定) -> **Secrets and variables** (機密與變數) -> **Actions** -> **New repository secret** (新增儲存庫機密)。新增以下 Secrets（數值可在您的 Firebase 控制台找到）：

    *   `VITE_FIREBASE_API_KEY`
    *   `VITE_FIREBASE_AUTH_DOMAIN`
    *   `VITE_FIREBASE_PROJECT_ID`
    *   `VITE_FIREBASE_STORAGE_BUCKET`
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`
    *   `VITE_FIREBASE_APP_ID`
    *   `VITE_FIREBASE_MEASUREMENT_ID`
    *   `VITE_CURRENT_YEAR` (可選，若未設定則預設為 2026)

3.  **檢查 Workflow**：當您推送 commit 到 `main` 分支後，「部署至 GitHub Pages」的 Action 就會自動執行。

4.  **驗證 Pages 設定**：前往 **Settings** (設定) -> **Pages** (頁面)。確認 "Build and deployment" (建置與部署) 的來源設定為 **Deploy from a branch** (從分支部署)，且分支設定為 `gh-pages` / `(root)`。

### 本地開發 (Local Development)

1.  Clone 此儲存庫。
2.  複製 `.env.example` 並更名為 `.env`。
3.  在 `.env` 中填入您的環境變數數值。
4.  執行 `npm install`。
5.  執行 `npm run dev`。
