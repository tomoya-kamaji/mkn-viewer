# mkn - Markdown Viewer

高速・軽量なMarkdownビューアーデスクトップアプリケーション

## 特徴

- 🚀 **高速起動** - Tauri + Rustによる軽量なバイナリ（15MB以下）
- 📁 **ディレクトリブラウズ** - .md/.mdcファイルをツリー表示
- 📝 **GitHub Flavored Markdown** - テーブル、チェックボックス、取り消し線など
- 🎨 **シンタックスハイライト** - 多言語対応のコードハイライト
- 📊 **Mermaid図表** - フローチャートやシーケンス図をサポート
- 🌙 **ダークモード** - OS設定を自動検出
- 📋 **目次自動生成** - 見出しから目次を自動生成
- 🖱️ **ドラッグ＆ドロップ** - ファイル/フォルダをドロップで開く
- ⌨️ **キーボードショートカット** - Cmd+B でサイドバー切り替え
- 📚 **履歴機能** - 過去に開いたフォルダを記憶

## 技術スタック

- **フレームワーク**: [Tauri](https://tauri.app/) 1.8
- **バックエンド**: Rust
- **フロントエンド**: React 18 + TypeScript 5
- **パッケージマネージャー**: [bun](https://bun.sh/)
- **Linter/Formatter**: [Biome](https://biomejs.dev/)
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS

## 前提条件

- [Rust](https://www.rust-lang.org/tools/install) 1.70以上
- [bun](https://bun.sh/) 1.0以上
- macOS 10.13以上

## セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd mkn-view

# 依存関係をインストール
bun install
```

## 開発

```bash
# 開発サーバーを起動
bun run tauri:dev
```

## ビルド

```bash
# 本番ビルド
bun run tauri:build
```

ビルド後のアプリケーションは `src-tauri/target/release/bundle/` に生成されます。

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `bun run dev` | Vite開発サーバー起動 |
| `bun run build` | フロントエンドビルド |
| `bun run tauri:dev` | Tauriアプリを開発モードで起動 |
| `bun run tauri:build` | 本番ビルド |
| `bun run check` | Biomeでコードチェック |
| `bun run format` | Biomeでフォーマット |
| `bun run lint` | Biomeでリント |
| `bun run lint:fix` | Biomeで自動修正 |

## キーボードショートカット

| ショートカット | 動作 |
|---------------|------|
| `⌘ B` | サイドバーの表示/非表示 |

## ライセンス

MIT

