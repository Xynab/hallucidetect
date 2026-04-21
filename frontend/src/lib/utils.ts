import { clsx, type ClassValue } from 'clsx';
import type { VeracityLabel } from '../types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function labelColor(label: VeracityLabel) {
  switch (label) {
    case 'supported': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    case 'unsupported': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' };
    case 'insufficient_evidence': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' };
  }
}

export function labelText(label: VeracityLabel) {
  switch (label) {
    case 'supported': return 'Supported';
    case 'unsupported': return 'Hallucination';
    case 'insufficient_evidence': return 'Unverifiable';
  }
}

export function confidencePct(c: number) {
  return Math.round(c * 100);
}

export function faithfulnessGrade(score: number): { grade: string; color: string } {
  if (score >= 0.85) return { grade: 'A', color: 'text-emerald-600' };
  if (score >= 0.70) return { grade: 'B', color: 'text-teal-600' };
  if (score >= 0.55) return { grade: 'C', color: 'text-amber-600' };
  if (score >= 0.40) return { grade: 'D', color: 'text-orange-600' };
  return { grade: 'F', color: 'text-red-600' };
}
