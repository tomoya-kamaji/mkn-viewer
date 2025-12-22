import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import type { Components } from "react-markdown";

// highlight.js のテーマ
import "highlight.js/styles/github-dark.css";

interface MarkdownViewerProps {
  content: string;
  fileName: string;
}

// Mermaidの初期化
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

export function MarkdownViewer({ content, fileName }: MarkdownViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mermaidの図を描画
  useEffect(() => {
    const renderMermaid = async () => {
      if (!containerRef.current) {
        return;
      }

      const mermaidBlocks = containerRef.current.querySelectorAll("code.language-mermaid");
      for (let i = 0; i < mermaidBlocks.length; i++) {
        const block = mermaidBlocks[i];
        if (!block) {
          continue;
        }
        const code = block.textContent ?? "";
        const parent = block.parentElement;

        if (parent && code) {
          try {
            const id = `mermaid-${Date.now()}-${i}`;
            const { svg } = await mermaid.render(id, code);
            const wrapper = document.createElement("div");
            wrapper.className = "mermaid-diagram my-4 flex justify-center";
            wrapper.innerHTML = svg;
            parent.replaceWith(wrapper);
          } catch (error) {
            console.error("Mermaid rendering error:", error);
          }
        }
      }
    };

    renderMermaid();
  }, [content]);

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
    <div ref={containerRef} className="h-full overflow-y-auto">
      {/* ファイル名ヘッダー */}
      <div className="sticky top-0 z-10 bg-surface-50/95 dark:bg-surface-950/95 backdrop-blur border-b border-surface-200 dark:border-surface-800 px-8 py-3">
        <h1 className="text-lg font-semibold text-surface-900 dark:text-surface-100 truncate">
          {fileName}
        </h1>
      </div>

      {/* Markdownコンテンツ */}
      <div className="markdown-body p-8 max-w-4xl mx-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
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

