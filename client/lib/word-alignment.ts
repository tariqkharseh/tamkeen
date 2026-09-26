import { normalizeArabic, similarity } from "@/lib/recitation";

export type WordStatus = "correct" | "incorrect";

export interface LiveTranscript {
  committed: string;
  partial: string;
  isFinal: boolean;
}

export const EMPTY_TRANSCRIPT: LiveTranscript = {
  committed: "",
  partial: "",
  isFinal: false,
};

/** Each expected word is a list of normalized spellings (e.g. Imlaei and Uthmani). */
export type ExpectedWord = string[];

const WORD_MATCH_THRESHOLD = 0.75;
const SKIP_LOOKAHEAD = 2;
const REPEAT_LOOKBACK = 3;

function splitWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map(normalizeArabic)
    .filter((w) => w.length > 0);
}

function matches(spoken: string, expected: ExpectedWord): boolean {
  return expected.some((v) => similarity(spoken, v) >= WORD_MATCH_THRESHOLD);
}

function join(a: ExpectedWord, b: ExpectedWord): ExpectedWord {
  return a.map((v, k) => v + (b[k] ?? ""));
}

/**
 * Aligns the spoken transcript against the words the user should recite and
 * returns a status for every answer word that has been reached so far.
 * Reciting the prompt verse first is allowed and does not affect the result.
 */
export function alignRecitation(
  prompt: ExpectedWord[],
  answer: ExpectedWord[],
  transcript: LiveTranscript
): (WordStatus | undefined)[] {
  const partialWords = splitWords(transcript.partial);
  const spoken = [...splitWords(transcript.committed), ...partialWords];
  // The last in-progress word may still be cut off, so it is never marked wrong.
  const pendingIndex =
    !transcript.isFinal && partialWords.length > 0 ? spoken.length - 1 : -1;

  const recitedPrompt =
    prompt.length > 0 && spoken.length > 0 && matches(spoken[0], prompt[0]);
  const expected = recitedPrompt ? [...prompt, ...answer] : answer;
  const statuses: (WordStatus | undefined)[] = new Array(expected.length);

  let i = 0;
  let j = 0;
  while (i < expected.length && j < spoken.length) {
    if (matches(spoken[j], expected[i])) {
      statuses[i++] = "correct";
      j++;
      continue;
    }
    if (j + 1 < spoken.length && matches(spoken[j] + spoken[j + 1], expected[i])) {
      statuses[i++] = "correct";
      j += 2;
      continue;
    }
    if (i + 1 < expected.length && matches(spoken[j], join(expected[i], expected[i + 1]))) {
      statuses[i++] = "correct";
      statuses[i++] = "correct";
      j++;
      continue;
    }
    if (j === pendingIndex) break;

    const isRepeat = Array.from({ length: REPEAT_LOOKBACK }, (_, k) => i - 1 - k)
      .some((p) => p >= 0 && matches(spoken[j], expected[p]));
    if (isRepeat) {
      j++;
      continue;
    }

    const skip = Array.from({ length: SKIP_LOOKAHEAD }, (_, k) => k + 1)
      .find((k) => i + k < expected.length && matches(spoken[j], expected[i + k]));
    if (skip) {
      for (let k = 0; k < skip; k++) statuses[i++] = "incorrect";
      statuses[i++] = "correct";
      j++;
      continue;
    }

    if (j + 1 < spoken.length && matches(spoken[j + 1], expected[i])) {
      j++;
      continue;
    }

    statuses[i++] = "incorrect";
    j++;
  }

  return recitedPrompt ? statuses.slice(prompt.length) : statuses;
}
