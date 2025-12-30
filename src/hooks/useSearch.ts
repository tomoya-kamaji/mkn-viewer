import { grepDirectory } from "@/lib/tauri";
import type { GrepResult } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

/** 検索のデバウンス時間（ミリ秒） */
const SEARCH_DEBOUNCE_MS = 300;

interface UseSearchReturn {
  searchQuery: string;
  searchResults: GrepResult[];
  isSearching: boolean;
  searchFiles: (query: string) => void;
  clearSearch: () => void;
}

/**
 * ファイル検索を管理するカスタムフック
 * @param currentDirectory 検索対象のディレクトリ
 */
export function useSearch(currentDirectory: string | null): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GrepResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchFiles = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // 早期リターン: クエリが空またはディレクトリ未選択
      if (!query.trim() || !currentDirectory) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await grepDirectory(currentDirectory, query);
          setSearchResults(results);
        } catch (error) {
          console.error("検索エラー:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, SEARCH_DEBOUNCE_MS);
    },
    [currentDirectory]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ディレクトリが変更されたら検索をクリア
  useEffect(() => {
    clearSearch();
  }, [clearSearch]);

  return {
    searchQuery,
    searchResults,
    isSearching,
    searchFiles,
    clearSearch,
  };
}
