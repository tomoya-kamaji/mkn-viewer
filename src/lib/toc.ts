import type { TocItem } from "@/types";

/**
 * Markdownコンテンツから目次を生成
 */
export function generateToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const matches = markdown.matchAll(headingRegex);

  const toc: TocItem[] = [];
  for (const match of matches) {
    const level = match[1]?.length ?? 0;
    const text = match[2]?.trim() ?? "";

    if (level > 0 && text) {
      // IDを生成（日本語対応）
      const id = text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, "");

      toc.push({ id, text, level });
    }
  }

  return toc;
}

/**
 * 見出しIDを追加したMarkdownを生成
 */
export function addHeadingIds(markdown: string): string {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;

  return markdown.replace(headingRegex, (_match, hashes: string, text: string) => {
    const id = text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, "");

    return `${hashes} ${text} {#${id}}`;
  });
}
