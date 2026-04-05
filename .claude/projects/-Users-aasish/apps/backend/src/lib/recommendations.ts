// Recommendation helper functions

import type { Recommendation, LiftRange } from '../types/analysis';

/**
 * Classify priority based on issue severity
 */
export function classifyPriority(
  impact: 'critical' | 'serious' | 'moderate' | 'minor',
  category: 'accessibility' | 'hierarchy' | 'cognitive' | 'cta' | 'content'
): 'P0' | 'P1' | 'P2' | 'P3' {
  // Accessibility critical/serious are always P0/P1
  if (category === 'accessibility') {
    if (impact === 'critical') return 'P0';
    if (impact === 'serious') return 'P1';
    if (impact === 'moderate') return 'P2';
    return 'P3';
  }

  // CTA visibility issues are high priority
  if (category === 'cta') {
    return impact === 'critical' ? 'P0' : 'P1';
  }

  // Default mapping
  if (impact === 'critical') return 'P0';
  if (impact === 'serious') return 'P1';
  if (impact === 'moderate') return 'P2';
  return 'P3';
}

/**
 * Estimate lift based on recommendation type and current score
 */
export function estimateLiftForRecommendation(
  recommendation: Recommendation,
  currentScore: number
): LiftRange {
  const lifts: Record<string, LiftRange> = {
    'accessibility': { 
      min: 15, max: 25, unit: 'percent', confidence: 'high',
    },
    'cta': { 
      min: 10, max: 20, unit: 'percent', confidence: 'high',
    },
    'hierarchy': { 
      min: 8, max: 12, unit: 'percent', confidence: 'medium',
    },
    'cognitive': { 
      min: 5, max: 10, unit: 'percent', confidence: 'medium',
    },
    'content': { 
      min: 3, max: 8, unit: 'percent', confidence: 'low',
    },
  };

  const baseLift = lifts[recommendation.category] || lifts['content'];
  
  // Adjust based on current score (lower score = higher potential lift)
  const scoreFactor = Math.max(0.5, (100 - currentScore) / 100);
  
  return {
    min: Math.round(baseLift.min * scoreFactor),
    max: Math.round(baseLift.max * scoreFactor),
    unit: baseLift.unit,
    confidence: baseLift.confidence,
  };
}
