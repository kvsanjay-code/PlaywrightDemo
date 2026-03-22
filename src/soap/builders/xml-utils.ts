// Core XML building utilities

export function xmlEscape(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Wraps pre-built XML content in a tag — returns '' if content is empty/whitespace
export function elem(tag: string, content: string | undefined | null, attributes?: Record<string, string>): string {
  if (content === undefined || content === null || !content.trim()) return '';
  return `<${tag}${buildAttrs(attributes)}>${content}</${tag}>`;
}

// Wraps a simple scalar value in a tag — escapes the value, returns '' if undefined
export function optElem(tag: string, value: string | number | boolean | undefined | null, attributes?: Record<string, string>): string {
  if (value === undefined || value === null) return '';
  return `<${tag}${buildAttrs(attributes)}>${xmlEscape(String(value))}</${tag}>`;
}

// Always emits the tag even if value is undefined — used for mandatory fields
export function reqElem(tag: string, value: string, attributes?: Record<string, string>): string {
  return `<${tag}${buildAttrs(attributes)}>${xmlEscape(value)}</${tag}>`;
}

function buildAttrs(attributes?: Record<string, string>): string {
  if (!attributes || Object.keys(attributes).length === 0) return '';
  return ' ' + Object.entries(attributes)
    .map(([k, v]) => `${k}="${xmlEscape(v)}"`)
    .join(' ');
}
