// TypeScript types for analysis pipeline

export interface ScoreComponents {
  attention: number;
  clickProbability: number;
  scrollDepth: number;
  hierarchy: number;
  accessibility: number;
}

export interface NeuroScore {
  score: number;
  components: ScoreComponents;
  breakdown: {
    attention: { value: number; weight: number; contribution: number };
    clickProbability: { value: number; weight: number; contribution: number };
    scrollDepth: { value: number; weight: number; contribution: number };
    hierarchy: { value: number; weight: number; contribution: number };
    accessibility: { value: number; weight: number; contribution: number };
  };
  confidence: number;
}

export interface HierarchyElement {
  tag: string;
  text: string;
  size: number;
  contrast: number;
  position: { x: number; y: number };
  importance: number;
}

export interface CognitiveLoadResult {
  score: number;
  factors: {
    textComplexity: number;
    visualComplexity: number;
    layoutComplexity: number;
  };
  level: 'low' | 'medium' | 'high';
}

export interface HierarchyResult {
  score: number;
  elements: HierarchyElement[];
  patterns: string[];
}

export interface AccessibilityIssue {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  wcagRef?: string;
  element?: string;
}

export interface AccessibilityResult {
  score: number;
  passed: number;
  failed: number;
  issues: AccessibilityIssue[];
}

export interface CritiqueResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: BasicRecommendation[];
}

export interface BasicRecommendation {
  id: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  category: string;
  title: string;
  description: string;
  suggestedFix: string;
  predictedLift: { min: number; max: number; unit: string };
}

export interface HeatmapData {
  data: number[];
  width: number;
  height: number;
  model: string;
}

export interface ScreenshotData {
  url: string;
  width: number;
  height: number;
}

export interface AnalysisResult {
  id: string;
  url: string;
  screenshot: ScreenshotData;
  heatmap: HeatmapData;
  neuroScore: NeuroScore;
  cognitiveLoad: CognitiveLoadResult;
  hierarchy: HierarchyResult;
  accessibility: AccessibilityResult;
  critique: CritiqueResult;
  status: 'complete' | 'partial' | 'failed';
  errors: string[];
  durationMs: number;
}

export interface AnalysisStatus {
  status: 'pending' | 'processing' | 'complete' | 'failed';
  progress?: number;
  currentStage?: string;
}

export interface CaptureResult {
  screenshot: Buffer;
  dom: string;
  viewport: string;
  title?: string;
}

export interface Recommendation {
  id: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  category: 'accessibility' | 'hierarchy' | 'cognitive' | 'cta' | 'content';
  title: string;
  description: string;
  currentState: string;
  suggestedFix: string;
  predictedLift: { min: number; max: number; unit: string };
  wcagRef?: string;
  effort: 'low' | 'medium' | 'high';
}

export interface LiftRange {
  min: number;
  max: number;
  unit: string;
  confidence: 'low' | 'medium' | 'high';
}
