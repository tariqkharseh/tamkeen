import { VerseKey } from "@quranjs/api";
import { getQuranClientInstance } from "@/lib/quran-client";

// Speech-to-text output rarely matches the mushaf letter-for-letter,
// so a recitation counts as correct above this similarity.
export const MATCH_THRESHOLD = 0.85;

export interface VerseTexts {
  imlaei: string;
  uthmani: string;
}

export interface RecitationResult {
  isCorrect: boolean;
  similarity: number;
  transcript: string;
}

export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ء/g, "")
    .replace(/[^\u0621-\u064A]/g, "");
}

function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

export function similarity(a: string, b: string): number {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - levenshtein(a, b) / longest;
}

export async function fetchVerseTexts(keys: VerseKey[]): Promise<(VerseTexts | null)[]> {
  const results = await Promise.allSettled(
    keys.map((key) =>
      getQuranClientInstance().verses.findByKey(key, {
        fields: { textImlaei: true, textUthmani: true },
      })
    )
  );
  return results.map((r) =>
    r.status === "fulfilled"
      ? { imlaei: r.value.textImlaei ?? "", uthmani: r.value.textUthmani ?? "" }
      : null
  );
}

/**
 * `prompt` is the verse shown to the user; `answer` is the verses they must
 * recite. Reciting the prompt verse before the answer is also accepted.
 */
export function compareRecitation(
  transcript: string,
  prompt: VerseTexts | null,
  answer: VerseTexts[]
): RecitationResult {
  const spoken = normalizeArabic(transcript);
  const candidates: string[] = [];

  for (const script of ["imlaei", "uthmani"] as const) {
    const answerText = answer.map((v) => normalizeArabic(v[script])).join("");
    candidates.push(answerText);
    if (prompt) candidates.push(normalizeArabic(prompt[script]) + answerText);
  }

  const best = Math.max(...candidates.map((c) => similarity(spoken, c)));
  return {
    isCorrect: best >= MATCH_THRESHOLD,
    similarity: best,
    transcript,
  };
}
