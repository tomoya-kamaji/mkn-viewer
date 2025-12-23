import mermaid from "mermaid";
import { useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import type { ThemeMode } from "@/types";

// highlight.js のテーマ
import "highlight.js/styles/github-dark.css";

interface MarkdownViewerProps {
  content: string;
  fileName: string;
  theme: ThemeMode;
}

// Mermaidの初期化
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

/**
 * 単一のMermaidブロックをレンダリング
 */
async function renderMermaidBlock(
  block: Element,
  index: number
): Promise<void> {
  const code = block.textContent ?? "";
  const parent = block.parentElement;

  if (!parent || !code) {
    return;
  }

  try {
    const id = `mermaid-${Date.now()}-${index}`;
    const { svg } = await mermaid.render(id, code);
    const wrapper = document.createElement("div");
    wrapper.className = "mermaid-diagram my-4 flex justify-center";
    wrapper.innerHTML = svg;
    parent.replaceWith(wrapper);
  } catch (error) {
    console.error("Mermaid rendering error:", error);
  }
}

export function MarkdownViewer({
  content,
  fileName,
  theme: _theme,
}: MarkdownViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // themeはCSS変数で自動適用されるため、ここでは明示的に使用しない

  // Mermaidの図を描画
  const renderMermaid = useCallback(async () => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const mermaidBlocks = container.querySelectorAll("code.language-mermaid");
    const promises = Array.from(mermaidBlocks).map((block, i) =>
      renderMermaidBlock(block, i)
    );
    await Promise.all(promises);
  }, []);

  // コンテンツにMermaidブロックが含まれる場合のみレンダリング
  const hasMermaid = content.includes("```mermaid");

  useEffect(() => {
    // コンテンツにMermaidブロックがあれば再レンダリング
    if (hasMermaid) {
      renderMermaid();
    }
  }, [hasMermaid, renderMermaid]);

  // 見出しにIDを付与するカスタムコンポーネント
  const components: Components = {
    h1: ({ children, ...props }) => {
      const id = generateHeadingId(children);
      return (
        <h1 id={id} {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }) => {
      const id = generateHeadingId(children);
      return (
        <h2 id={id} {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }) => {
      const id = generateHeadingId(children);
      return (
        <h3 id={id} {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ children, ...props }) => {
      const id = generateHeadingId(children);
      return (
        <h4 id={id} {...props}>
          {children}
        </h4>
      );
    },
    h5: ({ children, ...props }) => {
      const id = generateHeadingId(children);
      return (
        <h5 id={id} {...props}>
          {children}
        </h5>
      );
    },
    h6: ({ children, ...props }) => {
      const id = generateHeadingId(children);
      return (
        <h6 id={id} {...props}>
          {children}
        </h6>
      );
    },
    // 外部リンクは新しいタブで開く
    a: ({ href, children, ...props }) => {
      const isExternal = href?.startsWith("http");
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div ref={containerRef} className="h-full overflow-y-auto scroll-smooth">
      {/* ファイル名ヘッダー - ミニマルデザイン */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-surface-50/80 dark:bg-surface-950/80 border-b border-surface-200/50 dark:border-surface-800/50">
        <div className="max-w-3xl mx-auto px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
            <h1 className="text-sm font-medium tracking-wide text-surface-600 dark:text-surface-400 truncate">
              {fileName}
            </h1>
          </div>
        </div>
      </header>

      {/* Markdownコンテンツ - ゆったりとした余白 */}
      <article className="markdown-body px-8 py-12 max-w-3xl mx-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}

/**
 * 見出しからIDを生成
 */
function generateHeadingId(children: React.ReactNode): string {
  const text = extractTextFromChildren(children);
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, "");
}

/**
 * 子要素からテキストを抽出
 */
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    return extractTextFromChildren(children.props.children);
  }
  return "";
}
