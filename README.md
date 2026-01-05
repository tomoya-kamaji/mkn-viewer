# mkn - Markdown Viewer

高速・軽量なMarkdownビューアーデスクトップアプリケーション

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 特徴

- 🚀 **高速起動** - Tauri + Rustによる軽量なバイナリ（15MB以下）
- 📁 **ディレクトリブラウズ** - .md/.mdcファイルをツリー表示
- 📝 **GitHub Flavored Markdown** - テーブル、チェックボックス、取り消し線など
- 🎨 **シンタックスハイライト** - 多言語対応のコードハイライト
- 📊 **Mermaid図表** - フローチャートやシーケンス図をサポート
- 🌙 **ダークモード** - OS設定を自動検出 + 複数テーマ対応
- 📋 **目次自動生成** - 見出しから目次を自動生成
- 🔍 **全文検索** - ディレクトリ内のMarkdownファイルをgrep検索
- 🖱️ **ドラッグ＆ドロップ** - ファイル/フォルダをドロップで開く
- ⌨️ **キーボードショートカット** - 効率的な操作をサポート
- 📚 **履歴機能** - 過去に開いたフォルダを記憶

## インストール

### ソースからビルド

#### 前提条件

- [Rust](https://www.rust-lang.org/tools/install) 1.70以上
- [bun](https://bun.sh/) 1.0以上
- **macOS**: Xcode Command Line Tools
- **Windows**: [Build Tools for Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- **Linux**: `build-essential`, `libwebkit2gtk-4.0-dev`, `libgtk-3-dev` 等

<details>
<summary>Linux依存パッケージ（Ubuntu/Debian）</summary>

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  libwebkit2gtk-4.0-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

</details>

### Cursor コマンド

[Cursor](https://cursor.sh/) を使用している場合、以下のコマンドが利用できます：

| コマンド | 説明 |
|---------|------|
| `/setup` | 開発環境のセットアップ（依存関係インストール） |
| `/install` | ビルド＆ローカルインストール（セットアップ含む） |
| `/create-pr` | 変更をコミット分割してPR作成 |


#### ビルド手順

```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/mkn-view.git
cd mkn-view

# 依存関係をインストール
bun install

# 本番ビルド
bun run tauri:build
```

ビルド後のアプリケーションは以下に生成されます：

| OS | パス |
|----|------|
| macOS | `src-tauri/target/release/bundle/dmg/mkn_*.dmg` |
| Windows | `src-tauri/target/release/bundle/msi/mkn_*.msi` |
| Linux | `src-tauri/target/release/bundle/deb/mkn_*.deb` |

## 使い方

1. **アプリを起動** - mknを開く
2. **フォルダを選択** - 「フォルダを開く」ボタンまたはフォルダをドラッグ＆ドロップ
3. **ファイルを閲覧** - サイドバーから.md/.mdcファイルを選択


## 開発

```bash
# 開発サーバーを起動（ホットリロード対応）
bun run tauri:dev
```

### コマンド一覧

| コマンド | 説明 |
|---------|------|
| `bun run tauri:dev` | Tauriアプリを開発モードで起動 |
| `bun run tauri:build` | 本番ビルド |
| `bun run dev` | Vite開発サーバーのみ起動 |
| `bun run build` | フロントエンドビルド |
| `bun run check` | Biomeでコードチェック |
| `bun run format` | Biomeでフォーマット |
| `bun run lint` | Biomeでリント |
| `bun run lint:fix` | Biomeで自動修正 |
| `bun run test` | テストをウォッチモードで実行 |
| `bun run test:run` | テストを1回実行 |
| `bun run test:ui` | Vitest UIでテスト実行 |
| `bun run test:coverage` | カバレッジレポート生成 |


## キーボードショートカット

| ショートカット | 動作 |
|---------------|------|
| `⌘ B` / `Ctrl B` | サイドバーの表示/非表示 |
| `⌘ ⇧ F` / `Ctrl Shift F` | グローバル検索にフォーカス |
| `⌘ F` / `Ctrl F` | ページ内検索 |
| `Escape` | ページ内検索を閉じる |
| `Enter` | 次の検索結果 |
| `⇧ Enter` | 前の検索結果 |

## 技術スタック

- **フレームワーク**: [Tauri](https://tauri.app/) 1.8
- **バックエンド**: Rust
- **フロントエンド**: React 18 + TypeScript 5
- **パッケージマネージャー**: [bun](https://bun.sh/)
- **テスト**: Vitest + Testing Library
- **Linter/Formatter**: [Biome](https://biomejs.dev/)
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS

## トラブルシューティング

### macOS: 「開発元を確認できない」エラー

初回起動時にGatekeeperの警告が出る場合：

```bash
xattr -cr /Applications/mkn.app
```

または「システム環境設定」→「セキュリティとプライバシー」→「このまま開く」

### ビルドエラー: Rust関連

Rustツールチェインを最新に更新：

```bash
rustup update stable
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。
