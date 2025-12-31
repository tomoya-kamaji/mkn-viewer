import { describe, expect, test } from "vitest";
import { getErrorMessage } from "./error";

describe("getErrorMessage", () => {
  test("Errorオブジェクトからmessageプロパティを取得する", () => {
    // Arrange
    const error = new Error("テストエラー");

    // Act
    const result = getErrorMessage(error);

    // Assert
    expect(result).toBe("テストエラー");
  });
  describe("非Errorオブジェクトの場合", () => {
    interface GetErrorMessageTestCase {
      name: string;
      input: unknown;
      expected: string;
    }

    const cases: GetErrorMessageTestCase[] = [
      { name: "文字列", input: "エラーメッセージ", expected: "エラーメッセージ" },
      { name: "数値", input: 404, expected: "404" },
      { name: "null", input: null, expected: "null" },
      { name: "undefined", input: undefined, expected: "undefined" },
      { name: "オブジェクト", input: { code: "ERR_001" }, expected: "[object Object]" },
    ];

    test.each(cases)("$nameをString()で文字列に変換する", ({ input, expected }) => {
      // Arrange & Act
      const result = getErrorMessage(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
