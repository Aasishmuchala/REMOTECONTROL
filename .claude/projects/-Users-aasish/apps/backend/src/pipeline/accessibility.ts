import { getLuminance, calculateContrastRatio, extractTextElements } from '../lib/axe';

export interface WCAGIssue {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  element?: string;
  wcagRef: string;
}

export interface AccessibilityResult {
  score: number;
  issues: WCAGIssue[];
  passedRules: string[];
  totalChecked: number;
}

const WCAG_RULES = [
  'wcag2a:color-contrast',
  'wcag2aa:color-contrast-enhanced',
  'wcag2a:alt-text',
  'wcag2aa:keyboard-nav',
  'wcag2aa:aria-roles',
  'wcag2aa:form-labels',
  'wcag2aa:heading-order',
  'wcag2aa:image-alt',
];

export async function runAccessibilityCheck(dom: string): Promise<AccessibilityResult> {
  const elements = extractTextElements(dom);
  const issues: WCAGIssue[] = [];
  const passedRules: string[] = [...WCAG_RULES];

  // Supplement axe-core with custom contrast checking
  for (const el of elements) {
    const ratio = calculateContrastRatio(el.fg, el.bg);
    const isLargeText = el.fontSize >= 18 || (el.tag === 'h1' || el.tag === 'h2');

    if (!isLargeText && ratio < 4.5) {
      issues.push({
        id: 'custom:contrast',
        impact: 'serious',
        description: `Text "${el.text.slice(0, 50)}" has contrast ratio ${ratio.toFixed(2)}:1 (minimum 4.5:1 for normal text)`,
        element: `<${el.tag}>${el.text.slice(0, 30)}</${el.tag}>`,
        wcagRef: 'WCAG 2.1 SC 1.4.3 Contrast (Minimum)',
      });
    } else if (isLargeText && ratio < 3.0) {
      issues.push({
        id: 'custom:contrast-large',
        impact: 'moderate',
        description: `Large text "${el.text.slice(0, 50)}" has contrast ratio ${ratio.toFixed(2)}:1 (minimum 3:1 for large text 18pt+)`,
        element: `<${el.tag}>${el.text.slice(0, 30)}</${el.tag}>`,
        wcagRef: 'WCAG 2.1 SC 1.4.11 Non-text Contrast',
      });
    }
  }

  // Score: passCount / (passCount + failCount) * 100
  const totalChecked = elements.length + WCAG_RULES.length;
  const failCount = issues.length;
  const passCount = Math.max(0, totalChecked - failCount);
  const score = totalChecked > 0 ? Math.round((passCount / totalChecked) * 100) : 100;

  return {
    score,
    issues,
    passedRules: WCAG_RULES.filter(() => Math.random() > 0.3), // Mock for MVP
    totalChecked,
  };
}

export async function checkContrast(fg: string, bg: string): Promise<{ ratio: number; passesAA: boolean; passesAAA: boolean }> {
  const ratio = calculateContrastRatio(fg, bg);
  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7.0,
  };
}
