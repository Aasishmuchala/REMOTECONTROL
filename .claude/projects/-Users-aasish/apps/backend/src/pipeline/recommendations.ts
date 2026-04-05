// Recommendation generation engine

import type { AnalysisResult, Recommendation, LiftRange, AccessibilityIssue } from '../types/analysis';
import { estimateLift } from '../lib/scoring';

/**
 * Generate prioritized recommendations from analysis results
 */
export function generateRecommendations(analysis: AnalysisResult): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Extract from accessibility issues (P0/P1)
  const a11yRecs = generateAccessibilityRecommendations(analysis.accessibility.issues);
  recommendations.push(...a11yRecs);

  // Extract from hierarchy problems (P1/P2)
  const hierarchyRecs = generateHierarchyRecommendations(analysis.hierarchy);
  recommendations.push(...hierarchyRecs);

  // Extract from cognitive load (P2/P3)
  const cognitiveRecs = generateCognitiveRecommendations(analysis.cognitiveLoad);
  recommendations.push(...cognitiveRecs);

  // Extract from CTA visibility (P0/P1)
  const ctaRecs = generateCTARecommendations(analysis.neuroScore.components.clickProbability);
  recommendations.push(...ctaRecs);

  // Sort by priority (P0 first)
  const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

function generateAccessibilityRecommendations(issues: AccessibilityIssue[]): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const issue of issues) {
    const priority = issue.impact === 'critical' ? 'P0' : issue.impact === 'serious' ? 'P1' : 'P2';
    const effort = issue.impact === 'critical' ? 'medium' : 'medium';

    recs.push({
      id: `rec_a11y_${issue.id}`,
      priority,
      category: 'accessibility',
      title: `Fix ${issue.id.replace(/-/g, ' ')}`,
      description: issue.description,
      currentState: `WCAG ${issue.impact} issue detected: ${issue.description}`,
      suggestedFix: getAccessibilityFix(issue),
      predictedLift: estimateLift('accessibility', 0),
      wcagRef: issue.wcagRef,
      effort,
    });
  }

  return recs;
}

function generateHierarchyRecommendations(hierarchy: AnalysisResult['hierarchy']): Recommendation[] {
  const recs: Recommendation[] = [];

  if (hierarchy.score < 60) {
    recs.push({
      id: 'rec_hierarchy_improve',
      priority: 'P1',
      category: 'hierarchy',
      title: 'Improve visual hierarchy clarity',
      description: 'The page hierarchy is unclear, making it difficult for users to understand content importance.',
      currentState: `Hierarchy score: ${hierarchy.score}/100`,
      suggestedFix: 'Ensure heading levels (h1 > h2 > h3) are properly nested. Use size and contrast to establish clear visual hierarchy.',
      predictedLift: estimateLift('hierarchy', hierarchy.score),
      effort: 'medium',
    });
  }

  if (hierarchy.patterns.length === 0) {
    recs.push({
      id: 'rec_hierarchy_pattern',
      priority: 'P2',
      category: 'hierarchy',
      title: 'Establish clear reading pattern',
      description: 'No clear reading pattern detected. Users may struggle to navigate the page.',
      currentState: 'No recognized reading pattern',
      suggestedFix: 'Design with F-pattern or Z-pattern layouts in mind. Place key content in natural eye-tracking paths.',
      predictedLift: estimateLift('hierarchy', 50),
      effort: 'high',
    });
  }

  return recs;
}

function generateCognitiveRecommendations(cognitiveLoad: AnalysisResult['cognitiveLoad']): Recommendation[] {
  const recs: Recommendation[] = [];

  if (cognitiveLoad.level === 'high') {
    recs.push({
      id: 'rec_cognitive_high',
      priority: 'P2',
      category: 'cognitive',
      title: 'Reduce cognitive load',
      description: 'The page has high cognitive load, potentially overwhelming users.',
      currentState: `Cognitive load score: ${cognitiveLoad.score}/100`,
      suggestedFix: 'Simplify layout, reduce unique colors and fonts, break complex sections into smaller chunks.',
      predictedLift: estimateLift('cognitive', cognitiveLoad.score),
      effort: 'medium',
    });
  }

  if (cognitiveLoad.factors.textComplexity > 70) {
    recs.push({
      id: 'rec_cognitive_text',
      priority: 'P3',
      category: 'cognitive',
      title: 'Simplify text complexity',
      description: 'Text content is complex. Consider simplifying language for broader accessibility.',
      currentState: `Text complexity: ${cognitiveLoad.factors.textComplexity}/100`,
      suggestedFix: 'Use shorter sentences, simpler vocabulary, and clearer CTAs.',
      predictedLift: estimateLift('cognitive', cognitiveLoad.factors.textComplexity),
      effort: 'low',
    });
  }

  return recs;
}

function generateCTARecommendations(clickProbability: number): Recommendation[] {
  const recs: Recommendation[] = [];

  if (clickProbability < 50) {
    recs.push({
      id: 'rec_cta_invisible',
      priority: 'P0',
      category: 'cta',
      title: 'Make CTA elements more visible',
      description: 'CTA elements are not clearly visible or lack proper contrast.',
      currentState: `Click probability score: ${clickProbability}/100`,
      suggestedFix: 'Ensure CTA buttons have 4.5:1 contrast ratio minimum. Use size of at least 44x44px. Place CTAs above the fold.',
      predictedLift: estimateLift('cta', clickProbability),
      effort: 'low',
    });
  } else if (clickProbability < 70) {
    recs.push({
      id: 'rec_cta_improve',
      priority: 'P1',
      category: 'cta',
      title: 'Optimize CTA elements',
      description: 'CTAs exist but could be more prominent.',
      currentState: `Click probability score: ${clickProbability}/100`,
      suggestedFix: 'Increase CTA button size to 60px or larger. Add hover effects. Consider above-fold placement.',
      predictedLift: estimateLift('cta', clickProbability),
      effort: 'low',
    });
  }

  return recs;
}

function getAccessibilityFix(issue: AccessibilityIssue): string {
  const fixes: Record<string, string> = {
    'color-contrast': 'Increase contrast ratio to at least 4.5:1 for normal text, 3:1 for large text.',
    'missing-alt': 'Add descriptive alt text to all images conveying information.',
    'missing-labels': 'Add proper labels to form inputs for screen reader compatibility.',
    'keyboard-navigation': 'Ensure all interactive elements are keyboard accessible.',
    'heading-order': 'Ensure heading levels are properly nested (h1 > h2 > h3).',
  };

  return fixes[issue.id] || 'Review WCAG guidelines and implement the necessary fix.';
}

/**
 * Group recommendations by priority
 */
export function groupByPriority(recommendations: Recommendation[]): Map<string, Recommendation[]> {
  const groups = new Map<string, Recommendation[]>();
  
  for (const rec of recommendations) {
    const existing = groups.get(rec.priority) || [];
    existing.push(rec);
    groups.set(rec.priority, existing);
  }

  return groups;
}
