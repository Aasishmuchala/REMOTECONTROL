// Helper functions for cognitive load analysis

export function countDomNodes(html: string): number {
  const tags = html.match(/<[a-z][^>]*>/gi) || [];
  return tags.length;
}

export function countUniqueColors(html: string): number {
  const hexMatches = html.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g) || [];
  return new Set(hexMatches).size;
}

export function countUniqueFonts(html: string): number {
  const fontMatches = html.match(/font-family:[^;"]+/gi) || [];
  return new Set(fontMatches).join('').split(',').length;
}

export function calculateNestingDepth(html: string): number {
  const openTags = html.match(/<[a-z][^>]*[^\/]>/gi) || [];
  const closeTags = html.match(/<\/[a-z]+>/gi) || [];
  return Math.abs(openTags.length - closeTags.length);
}

export function calculateTextDensity(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter((w) => w.length > 0).length;
  const total = html.length;
  return total > 0 ? words / (total / 1000) : 0;
}

export function extractTextContent(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
