import { Material } from './material';

export interface AIConfidenceItem {
  value: string;
  confidence: number;
}

export interface InferredFunctionItem {
  value: string;
  confidence: number;
  inferred: boolean;
}

export interface AIColorAnalysis {
  primary: string;
  secondary: string | null;
  confidence: number;
}

export interface AISurfaceAnalysis {
  texture: string;
  gloss: string;
  pattern: string;
}

export interface AIIntentNotes {
  color_override?: string | null;
  ignore_color?: boolean;
  product_emphasis?: string | null;
  user_query_summary?: string;
}

export interface NormalizedSearchFeatures {
  product_candidates: AIConfidenceItem[];
  structure_candidates: AIConfidenceItem[];
  visual_features: string[];
  color: AIColorAnalysis;
  surface: AISurfaceAnalysis;
  possible_functions: InferredFunctionItem[];
  application_candidates: string[];
  search_keywords: string[];
  intent_notes?: AIIntentNotes;
}

export interface MatchReasons {
  high: string[];
  partial: string[];
  different: string[];
  inferred: string[];
}

export interface ScoreBreakdown {
  visual: number;
  product: number;
  structure: number;
  feature: number;
  intent: number;
  color: number;
  total: number;
}

export interface MaterialSearchResult {
  material: Material;
  similarity: number; // 0 to 100 integer
  match_reasons: MatchReasons;
  score_breakdown: ScoreBreakdown;
}

export interface SearchAnalysisRequest {
  image?: string; // base64 data url or raw base64
  natural_language?: string;
  quick_tags?: string[];
}

export interface SearchAnalysisResponse {
  features: NormalizedSearchFeatures;
  search_id: string;
}

export type SearchStep =
  | 'idle'
  | 'analyzing_image'
  | 'extracting_features'
  | 'searching_library'
  | 'calculating_similarity'
  | 'compiling_results'
  | 'completed'
  | 'error';
