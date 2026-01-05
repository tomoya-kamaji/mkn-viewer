---
description: 開発環境のセットアップを自動実行
---

## Description

このコマンドは、mkn-viewの開発環境を自動でセットアップします。

<context>
新しくプロジェクトをクローンした開発者、または依存関係を再構築したい場合に使用します。
</context>

**使用例:** `/setup` → 開発環境セットアップ完了

## Implementation

<step>

### 1. 前提条件の確認

必要なツールがインストールされているか確認します：

```bash
# Rustの確認
rustc --version || echo "❌ Rustがインストールされていません。https://rustup.rs/ からインストールしてください。"

# bunの確認
bun --version || echo "❌ bunがインストールされていません。https://bun.sh/ からインストールしてください。"
```

**どちらかが失敗した場合:**
- エラーメッセージを表示し、インストール手順を案内
- 処理を中断

### 2. 依存関係のインストール

```bash
# フロントエンド依存関係
bun install

# Rust依存関係（自動でビルド時にダウンロード）
cd src-tauri && cargo check && cd ..
```

### 3. 設定ファイルの確認

以下のファイルが存在することを確認：

- `biome.json` - Linter/Formatter設定
- `tailwind.config.js` - Tailwind CSS設定
- `tsconfig.json` - TypeScript設定
- `src-tauri/tauri.conf.json` - Tauri設定

### 4. Git Hooksのセットアップ

```bash
# lefthookがインストールされている場合
bunx lefthook install
```

### 5. 動作確認

```bash
# 型チェック
bun run build

# Lintチェック
bun run check
```

</step>

<output>

セットアップ完了後、以下を出力：

```
✅ セットアップ完了

前提条件:
  - Rust: v1.XX.X ✓
  - bun: v1.X.X ✓

インストール済み:
  - フロントエンド依存関係 ✓
  - Rust依存関係 ✓
  - Git Hooks ✓

次のステップ:
  開発サーバー起動: bun run tauri:dev
```

</output>

<constraints>
- 前提条件が満たされていない場合は処理を中断
- エラーが発生した場合は原因と解決策を表示
- 既にセットアップ済みの場合も安全に再実行可能
</constraints>

## 実行フロー

```mermaid
flowchart TD
    A[/setup 実行] --> B{Rust インストール済み?}
    B -->|No| C[エラー: Rust インストール手順を案内]
    B -->|Yes| D{bun インストール済み?}
    D -->|No| E[エラー: bun インストール手順を案内]
    D -->|Yes| F[bun install]
    F --> G[cargo check]
    G --> H[lefthook install]
    H --> I[bun run build]
    I --> J[bun run check]
    J --> K[✅ セットアップ完了]
```

