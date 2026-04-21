import axios from 'axios';
import type { AnalysisRequest, AnalysisResult, Example } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export async function analyzeResponse(req: AnalysisRequest): Promise<AnalysisResult> {
  const { data } = await api.post<AnalysisResult>('/analyze', req);
  return data;
}

export async function fetchExamples(): Promise<Example[]> {
  const { data } = await api.get<{ examples: Example[] }>('/examples');
  return data.examples;
}
export async function fetchHistory() {
  const res = await fetch('/api/v1/history');
  return res.json();
}
export async function checkHealth(): Promise<boolean> {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
}
