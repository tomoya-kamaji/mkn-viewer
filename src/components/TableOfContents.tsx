import type { TocItem } from "@/types";

interface TableOfContentsProps {
  toc: TocItem[];
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  if (toc.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="w-64 flex-shrink-0 border-l border-surface-200 dark:border-surface-800 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-200 mb-3">目次</h3>
        <ul className="space-y-1">
          {toc.map((item, index) => (
            <li key={`${item.id}-${index}`}>
              <button
                type="button"
                onClick={() => handleClick(item.id)}
                className="block w-full text-left text-sm text-surface-800 dark:text-surface-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate"
                style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                title={item.text}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
