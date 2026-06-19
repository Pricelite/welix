import { sanitizeNullableText, sanitizePlainText } from "@/lib/sanitize";

describe("sanitize", () => {
  it("removes html and control characters", () => {
    expect(sanitizePlainText("<script>alert(1)</script> Bonjour\nmonde")).toBe("alert(1) Bonjour monde");
  });

  it("returns null for empty nullable text", () => {
    expect(sanitizeNullableText("   ")).toBeNull();
  });
});
