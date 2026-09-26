"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getQuranClientInstance } from "@/lib/quran-client";
import { normalizeArabic } from "@/lib/recitation";
import {
  alignRecitation,
  ExpectedWord,
  LiveTranscript,
  WordStatus,
} from "@/lib/word-alignment";
import { QuranClient, VerseKey } from "@quranjs/api";

type GetVerseOptions = Parameters<QuranClient["verses"]["findByKey"]>[1];

interface VerseDisplayProps {
  verseKey: VerseKey;
  verseNumber: number;
  versesToShow: number;
  revealVerses: boolean;
  transcript: LiveTranscript;
}

interface DisplayWord {
  glyph: string;
  pageNumber: number;
  isVerseEnd: boolean;
  spellings: ExpectedWord;
}

// @quranjs/api drops `wordFields` when building the query string, so the raw
// snake_case parameter is passed instead.
const WORD_OPTIONS = {
  words: true,
  word_fields: "code_v1,text_uthmani,text_imlaei",
} as GetVerseOptions;

const getQcfCodeStr = (pageNum: number) => {
  if (pageNum >= 1 && pageNum <= 9) {
    return `QCF_P00${pageNum}`;
  } else if (pageNum >= 10 && pageNum <= 99) {
    return `QCF_P0${pageNum}`;
  } else {
    return `QCF_P${pageNum}`;
  }
};

const toExpected = (verse: DisplayWord[]): ExpectedWord[] =>
  verse.filter((w) => !w.isVerseEnd).map((w) => w.spellings);

export function VerseDisplay({
  verseKey,
  verseNumber,
  versesToShow,
  revealVerses,
  transcript,
}: VerseDisplayProps) {
  const [verses, setVerses] = useState<DisplayWord[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const getVerseWords = async (verseKey: VerseKey): Promise<DisplayWord[]> => {
      const verse = await getQuranClientInstance().verses.findByKey(verseKey, WORD_OPTIONS);
      return (verse.words ?? []).map((w) => ({
        glyph: w.codeV1 ?? "",
        pageNumber: w.pageNumber ?? verse.pageNumber,
        isVerseEnd: w.charTypeName === "end",
        spellings: [normalizeArabic(w.textImlaei ?? ""), normalizeArabic(w.textUthmani ?? "")],
      }));
    };
    const chapter = verseKey.split(":")[0];

    const verseKeys = Array.from(
      { length: versesToShow + 1 },
      (_, i) => `${chapter}:${verseNumber + i}` as VerseKey
    );

    Promise.allSettled(verseKeys.map(getVerseWords)).then((results) => {
      const loaded: DisplayWord[][] = [];
      for (const r of results) {
        if (r.status !== "fulfilled") break;
        loaded.push(r.value);
      }
      setVerses(loaded);
      setIsLoading(false);
    });
  }, []);

  const [promptVerse, ...answerVerses] = verses;

  const statuses = useMemo(() => {
    const [prompt, ...answer] = verses;
    return prompt
      ? alignRecitation(toExpected(prompt), answer.flatMap(toExpected), transcript)
      : [];
  }, [verses, transcript]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const currentWordIndex = transcript.isFinal
    ? -1
    : statuses.reduce((last, s, i) => (s ? i : last), -1);

  let answerWordIndex = 0;
  const renderAnswerWord = (word: DisplayWord, key: string) => {
    const index = word.isVerseEnd ? answerWordIndex - 1 : answerWordIndex++;
    const status: WordStatus | undefined = statuses[index];
    if (!status && !revealVerses) return null;
    const color =
      status === "incorrect"
        ? "text-red-600"
        : status === "correct"
          ? index === currentWordIndex && !word.isVerseEnd
            ? "text-green-600"
            : ""
          : "text-muted-foreground";
    return (
      <span key={key} className={`${getQcfCodeStr(word.pageNumber)} ${color}`}>
        {word.glyph}{" "}
      </span>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-8 text-right text-4xl leading-relaxed">
        {promptVerse?.map((word, i) => (
          <span key={`p-${i}`} className={getQcfCodeStr(word.pageNumber)}>
            {word.glyph}{" "}
          </span>
        ))}
        {answerVerses.map((verse, v) =>
          verse.map((word, i) => renderAnswerWord(word, `a-${v}-${i}`))
        )}
      </CardContent>
    </Card>
  );
}
