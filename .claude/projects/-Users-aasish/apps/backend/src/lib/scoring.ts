// Scoring utility functions

import type { HierarchyElement, LiftRange } from '../types/analysis';

/**
 * Calculate click probability based on CTA elements
 * Factors: CTA visibility, contrast, size (min 44x44px), position above fold
 */
export function calculateClickProbability(elements: HierarchyElement[]): number {
  if (elements.length === 0) return 30; // Default low score

  // Find CTA-like elements (buttons, links with actionable text)
  const ctaElements = elements.filter(el => {
    const tag = el.tag.toLowerCase();
    const text = el.text.toLowerCase();
    return (
      tag === 'button' ||
      tag === 'a' ||
      tag === 'input' ||
      (tag === 'div' && (text.includes('click') || text.includes('sign') || text.includes('get') || text.includes('start')))
    );
  });

  if (ctaElements.length === 0) return 25;

  let totalScore = 0;

  for (const cta of ctaElements) {
    let elementScore = 50; // Base score

    // Size scoring (min 44x44px is WCAG target)
    const sizeScore = Math.min(100, (cta.size / 60) * 100);
    elementScore = elementScore * 0.4 + sizeScore * 0.3;

    // Contrast scoring (4.5:1 is WCAG AA minimum)
    const contrastScore = Math.min(100, (cta.contrast / 7) * 100);
    elementScore = elementScore * 0.6 + contrastScore * 0.3;

    // Position scoring (above fold = better)
    const positionBonus = cta.position.y < 500 ? 20 : 0;
    elementScore += positionBonus;

    totalScore += Math.min(100, elementScore);
  }

  return Math.round(totalScore / ctaElements.length);
}

/**
 * Calculate scroll depth prediction based on content density and above-fold clarity
 */
export function calculateScrollDepth(dom: string, aboveFoldElements: number): number {
  // Parse DOM for content metrics
  const textNodes = (dom.match(/<p[^>]*>/gi) || []).length +
                    (dom.match(/<h[1-6][^>]*>/gi) || []).length +
                    (dom.match(/<li[^>]*>/gi) || []).length;

  const totalElements = (dom.match(/<[a-z]+/gi) || []).length;

  // Content density ratio
  const densityRatio = totalElements > 0 ? textNodes / totalElements : 0.5;

  // Above-fold content clarity (more elements = more reasons to scroll)
  const clarityScore = Math.min(100, aboveFoldElements * 8);

  // Density score (optimal is 0.3-0.5 density)
  let densityScore = 50;
  if (densityRatio >= 0.3 && densityRatio <= 0.5) {
    densityScore = 80 + Math.random() * 20;
  } else if (densityRatio < 0.2) {
    densityScore = 30 + densityRatio * 100;
  } else {
    densityScore = 70 - (densityRatio - 0.5) * 60;
  }

  // Scroll potential based on page length
  const pageLength = (dom.match(/<html/gi) || []).length > 0 ? 100 : 50;
  const scrollPotential = Math.min(100, pageLength * (densityRatio + 0.3));

  const score = (clarityScore * 0.3) + (densityScore * 0.4) + (scrollPotential * 0.3);
  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Normalize a score to 0-100 range
 */
export function normalizeScore(value: number, min: number = 0, max: number = 100): number {
  if (max === min) return 50;
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.round(Math.min(100, Math.max(0, normalized)));
}

/**
 * Calculate lift prediction based on recommendation type
 */
export function estimateLift(category: string, currentScore: number): LiftRange {
  const lifts: Record<string, LiftRange> = {
    'accessibility': { min: 15, max: 25, unit: 'percent', confidence: 'medium' },
    'cta': { min: 10, max: 20, unit: 'percent', confidence: 'medium' },
    'hierarchy': { min: 8, max: 12, unit: 'percent', confidence: 'low' },
    'cognitive': { min: 5, max: 10, unit: 'percent', confidence: 'low' },
    'content': { min: 3, max: 8, unit: 'percent', confidence: 'low' },
  };

  return lifts[category] || { min: 5, max: 10, unit: 'percent', confidence: 'low' };
}
