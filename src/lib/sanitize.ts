const HTML_TAG_RE = /<[^>]*>/g;
const CONTROL_RE = /[\u0000-\u001f\u007f]/g;

export function sanitizePlainText(value: string, maxLength = 5000) {
  return value
    .replace(HTML_TAG_RE, " ")
    .replace(CONTROL_RE, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeNullableText(value: string | null | undefined, maxLength = 5000) {
  if (typeof value !== "string") {
    return null;
  }

  const sanitized = sanitizePlainText(value, maxLength);
  return sanitized || null;
}
