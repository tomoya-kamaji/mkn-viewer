---
description: アプリケーションをローカルにビルド＆インストール（セットアップ含む）
---

## Description

このコマンドは、mkn-viewをローカルでビルドし、システムにインストールします。
**未セットアップの場合は自動的にセットアップを実行します。**

<context>
開発版のアプリケーションをローカルマシンで使用したい場合に実行します。
ビルド済みバイナリを生成し、適切な場所にインストールします。
</context>

**使用例:** `/install` → セットアップ + ビルド + インストール完了

## Implementation

<step>

### 1. 前提条件の確認とセットアップ

まず、必要なツールがインストールされているか確認します：

```bash
# Rustの確認
rustc --version || {
  echo "❌ Rustがインストールされていません"
  echo "インストール: https://rustup.rs/"
  exit 1
}

# bunの確認
bun --version || {
  echo "❌ bunがインストールされていません"
  echo "インストール: https://bun.sh/"
  exit 1
}
```

**どちらかがない場合:** エラーメッセージを表示し、インストール手順を案内して処理を中断

### 2. 依存関係のインストール（セットアップ）

`node_modules` が存在しない、または `package.json` が更新されている場合に実行：

```bash
# フロントエンド依存関係
bun install

# Rust依存関係の事前チェック
cd src-tauri && cargo check && cd ..
```

**既にセットアップ済みの場合:** このステップはスキップ可能

### 3. 現在の環境確認

```bash
# OSを確認
uname -s

# 現在のディレクトリ確認
pwd
```

### 4. 本番ビルドの実行

```bash
bun run tauri:build
```

**ビルド時間:** 初回は5-10分程度かかる場合があります。

### 5. ビルド成果物の確認

ビルド後、以下のパスに成果物が生成されます：

**macOS:**
```bash
ls -la src-tauri/target/release/bundle/macos/
ls -la src-tauri/target/release/bundle/dmg/
```

**Windows:**
```bash
dir src-tauri\target\release\bundle\msi\
```

**Linux:**
```bash
ls -la src-tauri/target/release/bundle/deb/
ls -la src-tauri/target/release/bundle/appimage/
```

### 6. インストール実行

**macOS:**
```bash
# .appをApplicationsフォルダにコピー
cp -r src-tauri/target/release/bundle/macos/mkn.app /Applications/

# または DMGをマウントしてインストール
open src-tauri/target/release/bundle/dmg/mkn_*.dmg
```

**Linux (Debian/Ubuntu):**
```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/mkn_*.deb
```

**Linux (AppImage):**
```bash
chmod +x src-tauri/target/release/bundle/appimage/mkn_*.AppImage
mv src-tauri/target/release/bundle/appimage/mkn_*.AppImage ~/Applications/
```

### 7. インストール確認

**macOS:**
```bash
# アプリケーションを開く
open /Applications/mkn.app
```

**Linux:**
```bash
# アプリケーションを起動
mkn
```

</step>

<output>

インストール完了後、以下を出力：

```
✅ インストール完了

セットアップ:
  - Rust: v1.XX.X ✓
  - bun: v1.X.X ✓
  - 依存関係: インストール済み ✓

ビルド情報:
  - バージョン: 0.1.0
  - ターゲット: aarch64-apple-darwin
  - ビルドタイプ: release

インストール先:
  - /Applications/mkn.app

起動方法:
  - Spotlight: "mkn" で検索
  - ターミナル: open /Applications/mkn.app
  - Finder: アプリケーションフォルダから起動
```

</output>

<constraints>
- 前提条件（Rust, bun）が満たされていない場合は処理を中断
- ビルドエラーが発生した場合は原因を特定し報告
- 既存のインストールがある場合は上書き確認
- 権限エラーの場合はsudoの使用を案内
</constraints>

<forbidden>
- 既存の設定ファイル（~/.config/mkn等）を削除しない
- ユーザーの確認なしにシステムファイルを変更しない
</forbidden>

## 実行フロー

```mermaid
flowchart TD
    A[/install 実行] --> B{Rust インストール済み?}
    B -->|No| C[エラー: Rust インストール手順を案内]
    B -->|Yes| D{bun インストール済み?}
    D -->|No| E[エラー: bun インストール手順を案内]
    D -->|Yes| F{node_modules 存在?}
    F -->|No| G[bun install + cargo check]
    F -->|Yes| H[スキップ]
    G --> I[OS確認]
    H --> I
    I --> J[bun run tauri:build]
    J --> K{ビルド成功?}
    K -->|No| L[エラー: 原因を報告]
    K -->|Yes| M[ビルド成果物確認]
    M --> N{OS判定}
    N -->|macOS| O[/Applications にコピー]
    N -->|Linux deb| P[dpkg でインストール]
    N -->|Linux AppImage| Q[~/Applications に配置]
    O --> R[起動確認]
    P --> R
    Q --> R
    R --> S[✅ インストール完了]
```

## トラブルシューティング

### macOS: 「開発元を確認できない」エラー

```bash
xattr -cr /Applications/mkn.app
```

### ビルドエラー: Cargo関連

```bash
# Rustツールチェインを更新
rustup update stable

# キャッシュをクリアして再ビルド
cd src-tauri && cargo clean && cd ..
bun run tauri:build
```

### Linux: 依存ライブラリ不足

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y libwebkit2gtk-4.0-dev libgtk-3-dev libayatana-appindicator3-dev
```
