import type { Interest } from '../_data';

export const INTEREST_EVENT = 'gg:interest';
export const JOINED_KEY = 'gg-joined';

export type InterestDetail = { interest: Interest; label?: string };

// Pre-selects an interest in the signup form and brings it into view, so any
// "notify me" action on the page lands the visitor one tap away from joining.
export function chooseInterest(interest: Interest, label?: string) {
  window.dispatchEvent(new CustomEvent<InterestDetail>(INTEREST_EVENT, { detail: { interest, label } }));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('join-card')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
}

export function readStore(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

export function writeStore(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}
