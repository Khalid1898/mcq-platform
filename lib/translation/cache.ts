import "server-only";
import type { TranslateInput, TranslateResult } from "./translator";

export interface TranslationCache {
  get(key: TranslateInput): Promise<TranslateResult | null>;
  set(key: TranslateInput, value: TranslateResult): Promise<void>;
}

function makeKey(input: TranslateInput): string {
  return `${input.sourceLang}::${input.targetLang}::${input.text}`;
}

class InMemoryTranslationCache implements TranslationCache {
  private store = new Map<string, TranslateResult>();

  async get(input: TranslateInput): Promise<TranslateResult | null> {
    const key = makeKey(input);
    return this.store.get(key) ?? null;
  }

  async set(input: TranslateInput, value: TranslateResult): Promise<void> {
    const key = makeKey(input);
    this.store.set(key, value);
  }
}

// Simple process-local cache for now; can be swapped for Redis or another backend later.
export const translationCache: TranslationCache = new InMemoryTranslationCache();

