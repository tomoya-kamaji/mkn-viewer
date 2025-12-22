import type { FileNode } from "@/types";
import { useState } from "react";

interface FileTreeProps {
  nodes: FileNode[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  depth?: number;
}

export function FileTree({ nodes, selectedFile, onSelectFile, depth = 0 }: FileTreeProps) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          depth={depth}
        />
      ))}
    </ul>
  );
}

interface FileTreeNodeProps {
  node: FileNode;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  depth: number;
}

function FileTreeNode({ node, selectedFile, onSelectFile, depth }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const isSelected = node.path === selectedFile;

  const handleClick = () => {
    if (node.isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={`
          w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-sm
          transition-colors
          ${
            isSelected
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100"
              : "hover:bg-surface-200 dark:hover:bg-surface-800"
          }
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* フォルダ/ファイルアイコン */}
        {node.isDirectory ? (
          <>
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <svg
              className="w-4 h-4 text-amber-500"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </>
        ) : (
          <>
            <span className="w-4" />
            <svg
              className="w-4 h-4 text-surface-800 dark:text-surface-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {/* 子ノード */}
      {node.isDirectory && isExpanded && node.children && node.children.length > 0 && (
        <FileTree
          nodes={node.children}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          depth={depth + 1}
        />
      )}
    </li>
  );
}
