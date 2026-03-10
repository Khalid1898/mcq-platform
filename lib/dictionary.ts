import "server-only";
import natural from "natural";
import path from "path";

// Ensure WordNet uses the on-disk database that ships with the package.
// natural's WordNet looks for the dict files; here we point it explicitly.
const wordnetDbPath = path.join(
  process.cwd(),
  "node_modules",
  "wordnet-db",
  "dict"
);

const wordnet = new natural.WordNet(wordnetDbPath);

export type DictionaryEntry = {
  word: string;
  definition: string;
  synonyms: string[];
};

/** Look up a word in local WordNet and return a short definition + 3–5 synonyms. */
export async function lookupWord(rawWord: string): Promise<DictionaryEntry | null> {
  const cleaned = rawWord.trim().toLowerCase().replace(/[^a-z'-]/gi, "");
  if (!cleaned) return null;

  // Generate candidate base forms using simple morphology / stemming.
  const candidates = new Set<string>();
  candidates.add(cleaned);

  // Use Porter stemmer for base form.
  try {
    const stem = natural.PorterStemmer.stem(cleaned);
    if (stem && stem !== cleaned) {
      candidates.add(stem.toLowerCase());
    }
  } catch {
    // Ignore stemmer errors; we still have the original form.
  }

  // Simple plural/variant heuristics.
  if (cleaned.endsWith("s") && cleaned.length > 3) {
    candidates.add(cleaned.slice(0, -1));
  }
  if (cleaned === "toward") {
    candidates.add("towards");
  } else if (cleaned === "towards") {
    candidates.add("toward");
  }

  let results: any[] = [];

  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    results = await new Promise((resolve, reject) => {
      try {
        wordnet.lookup(candidate, (res: any[]) => resolve(res));
      } catch (err) {
        reject(err);
      }
    });
    if (results && results.length > 0) {
      break;
    }
  }

  if (!results || results.length === 0) {
    return {
      word: cleaned,
      definition: "No definition found in the local dictionary.",
      synonyms: [],
    };
  }

  const primary = results[0];
  // natural's WordNet returns gloss like: "to concentrate attention; ...".
  const gloss: string | undefined = primary.gloss;
  const definition = gloss
    ? gloss.split(";")[0].trim()
    : "No definition found in the local dictionary.";

  const allSyns = results
    .flatMap((sense) => sense.synonyms ?? [])
    .map((s) => s.toLowerCase())
    .filter((s) => s && s !== cleaned);

  const uniqueSyns: string[] = [];
  for (const s of allSyns) {
    if (!uniqueSyns.includes(s)) {
      uniqueSyns.push(s);
    }
    if (uniqueSyns.length >= 5) break;
  }

  return {
    word: cleaned,
    definition,
    synonyms: uniqueSyns,
  };
}

