import {
  extractElements,
  calculateSizeScore,
  calculateContrastScore,
  calculatePositionScore,
  calculateSaliencyAlignment,
  calculateDomScore,
} from '../lib/hierarchy';

export interface HierarchyElement {
  tag: string;
  text: string;
  score: number;
  signals: {
    size: number;
    contrast: number;
    position: number;
    saliency: number;
    dom: number;
  };
}

export interface HierarchyResult {
  score: number;
  elements: HierarchyElement[];
  coherence: number;
}

/**
 * Multi-signal visual hierarchy analysis.
 * Signals: size (0.2) + contrast (0.15) + position (0.15) + saliency (0.25) + DOM (0.25)
 */
export async function analyzeVisualHierarchy(
  dom: string,
  heatmap: Float32Array
): Promise<HierarchyResult> {
  const elements = extractElements(dom);
  const ranked: HierarchyElement[] = [];

  for (const el of elements) {
    const sizeS = calculateSizeScore(el);
    const contrastS = calculateContrastScore(el);
    const positionS = calculatePositionScore(el);
    const saliencyS = calculateSaliencyAlignment(el, heatmap);
    const domS = calculateDomScore(el);

    const score = Math.round(
      (sizeS * 0.2 + contrastS * 0.15 + positionS * 0.15 + saliencyS * 0.25 + domS * 0.25) * 100
    );

    ranked.push({
      tag: el.tag,
      text: el.text.slice(0, 80),
      score,
      signals: {
        size: Math.round(sizeS * 100),
        contrast: Math.round(contrastS * 100),
        position: Math.round(positionS * 100),
        saliency: Math.round(saliencyS * 100),
        dom: Math.round(domS * 100),
      },
    });
  }

  ranked.sort((a, b) => b.score - a.score);

  // Overall coherence: how well element hierarchy matches visual hierarchy
  const avgScore = ranked.length > 0 ? ranked.reduce((s, e) => s + e.score, 0) / ranked.length : 50;
  const coherence = Math.min(100, Math.max(0, Math.round(avgScore)));

  return {
    score: Math.round(avgScore),
    elements: ranked.slice(0, 20),
    coherence,
  };
}
