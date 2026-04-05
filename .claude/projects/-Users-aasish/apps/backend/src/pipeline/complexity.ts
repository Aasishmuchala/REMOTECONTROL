import {
  countDomNodes,
  countUniqueColors,
  calculateNestingDepth,
  extractTextContent,
} from '../lib/complexity';

export interface CognitiveLoadResult {
  score: number;
  components: {
    text: number;
    visual: number;
    layout: number;
  };
  breakdown: Record<string, number>;
}

function normalize(v: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
}

/**
 * Compute cognitive load ensemble score from DOM and screenshot.
 * Higher score = more complex (worse for usability).
 * Weights: text 30%, visual 40%, layout 30%
 */
export async function computeCognitiveLoad(
  dom: string,
  _screenshot: Buffer
): Promise<CognitiveLoadResult> {
  const textContent = extractTextContent(dom);
  const words = textContent.split(/\s+/).filter((w) => w.length > 0);

  // Text complexity: based on word count and density
  const wordCount = words.length;
  const avgWordsPerLine = wordCount / Math.max(1, countDomNodes(dom) / 10);
  const textComplexity = normalize(avgWordsPerLine, 1, 50); // 0-100

  // Visual complexity: rule-based from DOM
  const domNodeCount = countDomNodes(dom);
  const colorCount = countUniqueColors(dom);
  const nesting = calculateNestingDepth(dom);
  const visualRaw = (domNodeCount * 0.4 + colorCount * 3 + nesting * 2);
  const visualComplexity = normalize(visualRaw, 0, 500); // 0-100

  // Layout complexity: element density
  const layoutDensity = normalize(domNodeCount / Math.max(1, 100), 0, 1);
  const layoutComplexity = layoutDensity * 100;

  // Ensemble weighted average
  const score = Math.round(
    textComplexity * 0.3 + visualComplexity * 0.4 + layoutComplexity * 0.3
  );

  return {
    score,
    components: {
      text: Math.round(textComplexity),
      visual: Math.round(visualComplexity),
      layout: Math.round(layoutComplexity),
    },
    breakdown: {
      wordCount,
      domNodeCount,
      uniqueColors: colorCount,
      nestingDepth: nesting,
    },
  };
}
