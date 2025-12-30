import type { ThemeMode } from "@/types";
import mermaid from "mermaid";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

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
async function renderMermaidBlock(block: Element, index: number): Promise<void> {
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

export function MarkdownViewer({ content, fileName, theme: _theme }: MarkdownViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matches, setMatches] = useState<Array<{ element: Element; index: number }>>([]);
  // themeはCSS変数で自動適用されるため、ここでは明示的に使用しない

  // Mermaidの図を描画
  const renderMermaid = useCallback(async () => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const mermaidBlocks = container.querySelectorAll("code.language-mermaid");
    const promises = Array.from(mermaidBlocks).map((block, i) => renderMermaidBlock(block, i));
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

  // ハイライトをクリア
  const clearHighlights = useCallback((container: HTMLElement) => {
    const highlights = container.querySelectorAll(".search-highlight");
    for (const el of highlights) {
      const parent = el.parentElement;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent ?? ""), el);
        parent.normalize();
      }
    }
  }, []);

  // テキストノードを収集
  const collectTextNodes = useCallback((container: HTMLElement): Text[] => {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (parent?.closest("pre") || parent?.closest("code")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let currentNode: Node | null = walker.nextNode();
    while (currentNode) {
      if (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent) {
        textNodes.push(currentNode as Text);
      }
      currentNode = walker.nextNode();
    }
    return textNodes;
  }, []);

  // テキストノードをハイライト
  const highlightTextNode = useCallback(
    (
      textNode: Text,
      query: string,
      startMatchIndex: number,
      matches: Array<{ element: Element; index: number }>
    ): number => {
      const text = textNode.textContent ?? "";
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const textMatches = Array.from(text.matchAll(regex));

      if (textMatches.length === 0) {
        return startMatchIndex;
      }

      const parent = textNode.parentElement;
      if (!parent) {
        return startMatchIndex;
      }

      let lastIndex = 0;
      let currentMatchIndex = startMatchIndex;
      const fragment = document.createDocumentFragment();

      for (const match of textMatches) {
        if (match.index === undefined) {
          continue;
        }

        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }

        const highlight = document.createElement("mark");
        highlight.className =
          "search-highlight bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100 rounded px-0.5";
        highlight.textContent = match[0];
        highlight.setAttribute("data-match-index", String(currentMatchIndex));
        matches.push({ element: highlight, index: currentMatchIndex });
        fragment.appendChild(highlight);

        lastIndex = match.index + match[0].length;
        currentMatchIndex++;
      }

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      parent.replaceChild(fragment, textNode);
      return currentMatchIndex;
    },
    []
  );

  // 検索機能
  useEffect(() => {
    if (!isSearchOpen || !searchQuery.trim()) {
      const container = containerRef.current;
      if (container) {
        clearHighlights(container);
      }
      setMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    clearHighlights(container);

    const query = searchQuery.trim();
    if (!query) {
      return;
    }

    const textNodes = collectTextNodes(container);
    const newMatches: Array<{ element: Element; index: number }> = [];
    let matchIndex = 0;

    for (const textNode of textNodes) {
      matchIndex = highlightTextNode(textNode, query, matchIndex, newMatches);
    }

    setMatches(newMatches);
    setCurrentMatchIndex(0);

    if (newMatches.length > 0) {
      setTimeout(() => {
        const firstMatch = newMatches[0];
        if (firstMatch) {
          firstMatch.element.scrollIntoView({ behavior: "smooth", block: "center" });
          firstMatch.element.classList.add("current-match");
        }
      }, 100);
    }
  }, [isSearchOpen, searchQuery, clearHighlights, collectTextNodes, highlightTextNode]);

  // 現在のマッチをハイライト
  useEffect(() => {
    if (matches.length === 0) {
      return;
    }

    const highlights = containerRef.current?.querySelectorAll(".search-highlight");
    if (highlights) {
      for (const el of highlights) {
        el.classList.remove("current-match", "ring-2", "ring-emerald-500");
      }
    }

    const currentMatch = matches[currentMatchIndex];
    if (currentMatch) {
      currentMatch.element.classList.add("current-match", "ring-2", "ring-emerald-500");
      currentMatch.element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentMatchIndex, matches]);

  // キーボードショートカット
  useEffect(() => {
    const handleCtrlF = (e: KeyboardEvent) => {
      e.preventDefault();
      setIsSearchOpen(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    };

    const handleEscape = (e: KeyboardEvent) => {
      e.preventDefault();
      setIsSearchOpen(false);
      setSearchQuery("");
    };

    const handleEnter = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.shiftKey) {
        setCurrentMatchIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1));
      } else {
        setCurrentMatchIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlF = (e.metaKey || e.ctrlKey) && e.key === "f" && !e.shiftKey;
      const isEscape = e.key === "Escape";
      const isEnter = e.key === "Enter";

      if (isCtrlF) {
        handleCtrlF(e);
      } else if (isEscape && isSearchOpen) {
        handleEscape(e);
      } else if (isEnter && isSearchOpen && matches.length > 0) {
        handleEnter(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, matches.length]);

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

        {/* 検索バー */}
        {isSearchOpen && (
          <div className="border-t border-surface-200/50 dark:border-surface-800/50 bg-surface-100/80 dark:bg-surface-900/80">
            <div className="max-w-3xl mx-auto px-8 py-3">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-surface-500 dark:text-surface-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="検索..."
                  className="flex-1 px-2 py-1 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-surface-900 dark:text-surface-100"
                />
                {matches.length > 0 && (
                  <span className="text-xs text-surface-500 dark:text-surface-400 whitespace-nowrap">
                    {currentMatchIndex + 1} / {matches.length}
                  </span>
                )}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMatchIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1))
                    }
                    disabled={matches.length === 0}
                    className="p-1 hover:bg-surface-200 dark:hover:bg-surface-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="前へ (Shift+Enter)"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMatchIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0))
                    }
                    disabled={matches.length === 0}
                    className="p-1 hover:bg-surface-200 dark:hover:bg-surface-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="次へ (Enter)"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="p-1 hover:bg-surface-200 dark:hover:bg-surface-800 rounded transition-colors"
                    title="閉じる (Esc)"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
