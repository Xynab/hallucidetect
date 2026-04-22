import axios from 'axios';
import type { AnalysisRequest, AnalysisResult, Example } from '../types';

// Fix: use type-safe bypass for Vercel build
const env = (import.meta as any).env;

// In production, VITE_API_URL points to backend.
// In dev, empty string uses Vite proxy.
const BASE_URL = env?.VITE_API_URL
  ? `${env.VITE_API_URL}/api/v1`
  : '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
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
  const res = await fetch(`${BASE_URL}/history`);
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
