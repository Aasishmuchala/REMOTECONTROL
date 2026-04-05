export interface ExtractedElement {
  tag: string;
  text: string;
  size: number;
  contrast: number;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: string;
}

export function extractElements(dom: string): ExtractedElement[] {
  const elements: ExtractedElement[] = [];
  const tagRegex = /<([a-z]+)([^>]*)>([^<]{1,200})<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(dom)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const text = match[3].trim();
    if (!text || text.length < 2) continue;

    const fontSizeMap: Record<string, number> = { h1: 32, h2: 24, h3: 18, h4: 16, h5: 14, h6: 12, p: 14, li: 14, td: 14, th: 14, span: 12, a: 14 };
    const size = fontSizeMap[tag] || 14;

    elements.push({
      tag,
      text,
      size,
      contrast: tag === 'h1' || tag === 'h2' ? 1.0 : 0.7,
      x: 0, y: 0, width: 100, height: size * 1.5,
      style: attrs,
    });
  }
  return elements;
}

export function calculateSizeScore(element: ExtractedElement): number {
  return Math.min(1, element.size / 32);
}

export function calculateContrastScore(element: ExtractedElement): number {
  return element.contrast;
}

export function calculatePositionScore(element: ExtractedElement, viewport = { width: 1920, height: 1080 }): number {
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  const normX = centerX / viewport.width;
  const normY = centerY / viewport.height;
  return Math.max(0, 1 - normY * 0.5 - Math.abs(normX - 0.5) * 0.3);
}

export function calculateSaliencyAlignment(element: ExtractedElement, heatmap: Float32Array): number {
  // Simplified: elements in upper portion align with typical F-pattern
  return element.y < 400 ? 0.8 : 0.4;
}

export function calculateDomScore(element: ExtractedElement): number {
  const domWeight: Record<string, number> = { h1: 1.0, h2: 0.8, h3: 0.6, h4: 0.5, h5: 0.4, h6: 0.3, p: 0.2, li: 0.2, span: 0.1, a: 0.15 };
  return domWeight[element.tag] || 0.1;
}
