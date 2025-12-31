# テスト戦略と導入プロセス

## 概要
このプロダクト（Tauri + React + TypeScript）にテストを段階的に追加していく戦略とプロセス。

---

## テストの種類と優先度

### 1. ユニットテスト（優先度: ⭐⭐⭐⭐⭐）

#### フロントエンド（TypeScript/React）

**ユーティリティ関数** - 最も簡単で効果的
- `src/lib/error.ts` - `getErrorMessage()`
- `src/lib/shortcuts.ts` - `matchesShortcut()`
- `src/lib/toc.ts` - `generateToc()`, `addHeadingIds()`

**カスタムフック** - ビジネスロジックの核心
- `src/hooks/useTheme.ts` - テーマ管理
- `src/hooks/useSidebar.ts` - サイドバー状態管理
- `src/hooks/useShortcut.ts` - ショートカット登録
- `src/hooks/useSearch.ts` - 検索機能（デバウンス含む）
- `src/hooks/useFileSystem.ts` - ファイルシステム操作（モックが必要）

#### バックエンド（Rust）

**コマンド関数**
- `src-tauri/src/commands.rs` - `scan_directory()`, `read_file_content()`, `grep_directory()`

**ユーティリティ関数**
- `is_markdown_file()` - ファイル拡張子判定
- `should_ignore_dir()` - 無視ディレクトリ判定
- `build_file_tree()` - ファイルツリー構築

---

### 2. コンポーネントテスト（優先度: ⭐⭐⭐）

**シンプルなコンポーネント**（プレゼンテーション層）
- `src/components/LoadingSpinner.tsx`
- `src/components/ErrorMessage.tsx`
- `src/components/ThemeSelector.tsx`

**複雑なコンポーネント**（状態管理・インタラクション含む）
- `src/components/FileTree.tsx` - 再帰的レンダリング、展開/折りたたみ
- `src/components/Sidebar.tsx` - タブ切替、複数の子コンポーネント
- `src/components/MarkdownViewer.tsx` - ページ内検索、コピー機能

---

### 3. 統合テスト（優先度: ⭐⭐）

**Context とフックの連携**
- `ErrorContext` + `useFileSystem` のエラーハンドリング
- `useFileSystem` + `useSearch` の連携

---

### 4. E2Eテスト（優先度: ⭐）

**主要なユーザーフロー**
- ディレクトリを開く → ファイルを選択 → Markdown表示
- 検索機能の使用
- ショートカットキーの動作

---

## 推奨テストフレームワーク

### フロントエンド
- **Vitest** - Viteプロジェクトなので最適、高速
- **React Testing Library** - Reactコンポーネントテスト
- **@testing-library/user-event** - ユーザーインタラクションのシミュレーション

### バックエンド
- **Rust標準テストフレームワーク** - `#[cfg(test)]` モジュール
- **tempfile** - 一時ファイル/ディレクトリの作成

### E2E
- **Playwright** - TauriアプリのE2Eテストに適している
- または **Tauri Test Runner**（将来の選択肢）

---

## 段階的導入プロセス

### Phase 1: 基盤構築（1-2時間）

1. **Vitest のセットアップ**
   ```bash
   bun add -d vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
   ```

2. **設定ファイルの作成**
   - `vitest.config.ts` の作成
   - `tsconfig.json` にテスト用の設定追加

3. **package.json にテストスクリプト追加**
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest --coverage"
     }
   }
   ```

4. **最初のテストファイル作成**
   - `src/lib/error.test.ts` - 最もシンプルな関数から

---

### Phase 2: ユーティリティ関数のテスト（2-3時間）

**優先順位:**
1. ✅ `getErrorMessage()` - エラーハンドリング
2. ✅ `matchesShortcut()` - ショートカット判定
3. ✅ `generateToc()` - 目次生成
4. ✅ `addHeadingIds()` - ID付与

**目標:** カバレッジ 90%以上

---

### Phase 3: カスタムフックのテスト（4-6時間）

**優先順位:**
1. ✅ `useTheme` - シンプルな状態管理
2. ✅ `useSidebar` - 状態管理 + ストレージ連携
3. ✅ `useShortcut` - イベントリスナー管理
4. ✅ `useSearch` - デバウンス + 非同期処理
5. ✅ `useFileSystem` - 複雑な状態管理 + Tauri API モック

**注意点:**
- Tauri API は `vi.mock()` でモックする必要がある
- `@tauri-apps/api` のモックヘルパーを作成

---

### Phase 4: コンポーネントテスト（3-4時間）

**優先順位:**
1. ✅ `LoadingSpinner` - シンプルなプレゼンテーション
2. ✅ `ErrorMessage` - エラー表示
3. ✅ `FileTree` - 再帰的レンダリング、展開/折りたたみ
4. ✅ `Sidebar` - タブ切替、複数コンポーネント連携

**注意点:**
- `MarkdownViewer` は複雑なので後回し
- モックが必要なコンポーネントは適切にモック

---

### Phase 5: Rust テスト（2-3時間）

**優先順位:**
1. ✅ `is_markdown_file()` - ユニットテスト
2. ✅ `should_ignore_dir()` - ユニットテスト
3. ✅ `build_file_tree()` - 統合テスト（一時ディレクトリ使用）
4. ✅ `scan_directory()` - コマンドテスト
5. ✅ `read_file_content()` - コマンドテスト

**テストファイル:** `src-tauri/src/commands.rs` 内に `#[cfg(test)]` モジュール

---

### Phase 6: E2Eテスト（オプション、後回し可）

**優先順位:**
1. ディレクトリを開く → ファイル選択の流れ
2. 検索機能の動作確認

---

## テストファイルの配置規則

```
src/
├── lib/
│   ├── error.ts
│   └── error.test.ts          ← 同じディレクトリに配置
├── hooks/
│   ├── useTheme.ts
│   └── useTheme.test.ts        ← 同じディレクトリに配置
└── components/
    ├── LoadingSpinner.tsx
    └── LoadingSpinner.test.tsx ← 同じディレクトリに配置

src-tauri/src/
└── commands.rs                 ← #[cfg(test)] モジュール内にテスト
```

---

## テストカバレッジ目標

| カテゴリ | 目標カバレッジ |
|---------|--------------|
| ユーティリティ関数 | 90%以上 |
| カスタムフック | 80%以上 |
| コンポーネント | 70%以上 |
| Rust コマンド | 80%以上 |

---

## CI/CD への統合

### GitHub Actions の例

```yaml
name: Test

on: [push, pull_request]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test

  test-rust:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
      - run: cd src-tauri && cargo test
```

---

## 次のステップ

1. **Phase 1 から開始** - 基盤構築
2. **小さく始める** - 1つの関数からテストを書く
3. **継続的に追加** - 新機能を追加するたびにテストも追加
4. **レビュー時に確認** - PRレビュー時にテストカバレッジを確認

---

## 参考リソース

- [Vitest 公式ドキュメント](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Rust テストガイド](https://doc.rust-lang.org/book/ch11-00-testing.html)

