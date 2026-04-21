export type VeracityLabel =
  | 'supported'
  | 'unsupported'
  | 'insufficient_evidence';

export interface Claim {
  id: number;
  text: string;
  label: VeracityLabel;
  confidence: number;
  evidence: string[];
  evidence_source: string | null;
  explanation: string;
  span_start: number | null;
  span_end: number | null;
}

export interface AnalysisStats {
  total_claims: number;
  supported: number;
  unsupported: number;
  insufficient_evidence: number;
  overall_faithfulness_score: number;
  hallucination_rate: number;
}

export interface AnalysisResult {
  query: string;
  response: string;
  model_name: string;
  claims: Claim[];
  stats: AnalysisStats;
  annotated_response: string;
  processing_time_ms: number;
}

export interface AnalysisRequest {
  query: string;
  response: string;
  model_name?: string;
}

export interface Example {
  id: number;
  title: string;
  query: string;
  response: string;
  model_name: string;
}