export type TranslateInput = {
  text: string;
  sourceLang: string;
  targetLang: string;
};

export type TranslateResult = {
  translatedText: string;
  provider: string;
  cached: boolean;
};

export interface Translator {
  translate(input: TranslateInput): Promise<TranslateResult>;
}

