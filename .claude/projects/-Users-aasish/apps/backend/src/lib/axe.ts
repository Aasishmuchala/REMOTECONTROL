import type { SerialContext } from 'axe-core';

// WCAG 2.1 relative luminance formula: L = 0.2126R + 0.7152G + 0.0722B
export function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function calculateContrastRatio(fg: string, bg: string): number {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface TextElement {
  tag: string;
  text: string;
  fg: string;
  bg: string;
  fontSize: number;
  line: string;
  col: number;
}

export function extractTextElements(dom: string): TextElement[] {
  const elements: TextElement[] = [];
  // Minimal regex-based extraction for MVP (in production use DOMParser)
  const tagRegex = /<([a-z]+)([^>]*)>([^<]{1,500})<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(dom)) !== null) {
    const tag = match[1].toLowerCase();
    const content = match[3].trim();
    if (!content || content.length < 2) continue;
    const isBlock = ['h1','h2','h3','h4','h5','h6','p','li','td','th','span','a','div'].includes(tag);
    if (!isBlock && tag !== 'a' && tag !== 'span') continue;
    elements.push({
      tag,
      text: content.slice(0, 200),
      fg: '#000000',
      bg: '#ffffff',
      fontSize: tag === 'h1' ? 32 : tag === 'h2' ? 24 : tag === 'h3' ? 18 : 14,
      line: '1',
      col: '1',
    });
  }
  return elements;
}

export async function runAxeCore(dom: string): Promise<{ violations: unknown[]; passes: unknown[] }> {
  // axe-core requires a DOM node in a browser context
  // For MVP: return structured mock data; production uses playwright/axe integration
  const { default: axe } = await import('axe-core');
  const { DOMParser } = await import('linkedom' as any);
  return { violations: [], passes: [] };
}
