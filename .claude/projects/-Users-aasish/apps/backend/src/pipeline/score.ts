// NeuroScore computation engine

import type { ScoreComponents, NeuroScore } from '../types/analysis';

/**
 * Compute the NeuroScore from five weighted components
 * Formula (locked per STATE.md):
 *   NeuroScore = attention*0.25 + clickProbability*0.30 + scrollDepth*0.20 + hierarchy*0.15 + accessibility*0.10
 */
export function computeNeuroScore(components: ScoreComponents): NeuroScore {
  const { attention, clickProbability, scrollDepth, hierarchy, accessibility } = components;

  // Weights (must sum to 1.0)
  const WEIGHTS = {
    attention: 0.25,
    clickProbability: 0.30,
    scrollDepth: 0.20,
    hierarchy: 0.15,
    accessibility: 0.10,
  };

  // Calculate weighted contributions
  const breakdown = {
    attention: {
      value: attention,
      weight: WEIGHTS.attention,
      contribution: attention * WEIGHTS.attention,
    },
    clickProbability: {
      value: clickProbability,
      weight: WEIGHTS.clickProbability,
      contribution: clickProbability * WEIGHTS.clickProbability,
    },
    scrollDepth: {
      value: scrollDepth,
      weight: WEIGHTS.scrollDepth,
      contribution: scrollDepth * WEIGHTS.scrollDepth,
    },
    hierarchy: {
      value: hierarchy,
      weight: WEIGHTS.hierarchy,
      contribution: hierarchy * WEIGHTS.hierarchy,
    },
    accessibility: {
      value: accessibility,
      weight: WEIGHTS.accessibility,
      contribution: accessibility * WEIGHTS.accessibility,
    },
  };

  // Sum contributions
  const score = Object.values(breakdown).reduce(
    (sum, item) => sum + item.contribution,
    0
  );

  // Calculate confidence based on score variance
  const meanScore = (attention + clickProbability + scrollDepth + hierarchy + accessibility) / 5;
  const variance = (
    Math.pow(attention - meanScore, 2) +
    Math.pow(clickProbability - meanScore, 2) +
    Math.pow(scrollDepth - meanScore, 2) +
    Math.pow(hierarchy - meanScore, 2) +
    Math.pow(accessibility - meanScore, 2)
  ) / 5;

  // Low variance = high confidence (scores are consistent)
  const stdDev = Math.sqrt(variance);
  const confidence = Math.max(0.5, 1 - (stdDev / 50));

  return {
    score: Math.round(score * 100) / 100,
    components,
    breakdown,
    confidence: Math.round(confidence * 100) / 100,
  };
}

/**
 * Domain-specific calibration (MVP: always 'general')
 * Future: calibrate scores per industry vertical
 */
export function calibrateForDomain(
  score: NeuroScore,
  domain: 'saas' | 'ecommerce' | 'media' | 'finance' | 'general'
): NeuroScore {
  // MVP: No domain calibration yet
  return score;
}
