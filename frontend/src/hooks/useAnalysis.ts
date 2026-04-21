import { useState, useCallback } from 'react';
import { analyzeResponse } from '../lib/api';
import type { AnalysisRequest, AnalysisResult } from '../types';

interface UseAnalysisState {
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export function useAnalysis() {
  const [state, setState] = useState<UseAnalysisState>({
    result: null,
    loading: false,
    error: null,
  });

  const analyze = useCallback(async (req: AnalysisRequest) => {
    setState({ result: null, loading: true, error: null });
    try {
      const result = await analyzeResponse(req);
      setState({ result, loading: false, error: null });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Is the backend running?';
      setState({ result: null, loading: false, error: msg });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ result: null, loading: false, error: null });
  }, []);

  return { ...state, analyze, reset };
}
