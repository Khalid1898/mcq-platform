import "server-only";
import type { Translator, TranslateInput, TranslateResult } from "./translator";
import { translationCache } from "./cache";

/**
 * Placeholder translator implementation.
 *
 * This currently just returns the input text unchanged so that the
 * translation pipeline (API route, UI, caching, etc.) can be exercised
 * without depending on any specific engine.
 *
 * In production, replace this class with a real implementation
 * (e.g. Argos microservice, Azure, Google, etc.) that still conforms
 * to the Translator interface.
 */
export class ArgosTranslator implements Translator {
  readonly provider = "noop-translator";

  async translate(input: TranslateInput): Promise<TranslateResult> {
    const cached = await translationCache.get(input);
    if (cached) return { ...cached, cached: true };

    const result: TranslateResult = {
      translatedText: input.text,
      provider: this.provider,
      cached: false,
    };

    await translationCache.set(input, result);
    return result;
  }
}

// Default translator instance used by the API route.
export const defaultTranslator: Translator = new ArgosTranslator();

