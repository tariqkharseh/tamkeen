"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getQuranClientInstance } from "@/lib/quran-client";
import { VerseKey } from "@quranjs/api";

interface VerseDisplayProps {
  verseKey: VerseKey;
  verseNumber: number;
  versesToShow: number;
  revealVerses: boolean;
}

const getQcfCodeStr = (pageNum: number) => {
  if (pageNum >= 1 && pageNum <= 9) {
    return `QCF_P00${pageNum}`;
  } else if (pageNum >= 10 && pageNum <= 99) {
    return `QCF_P0${pageNum}`;
  } else {
    return `QCF_P${pageNum}`;
  }
};

export function VerseDisplay({
  verseKey,
  verseNumber,
  versesToShow,
  revealVerses
}: VerseDisplayProps) {
  const [verses, setVerses] = useState<
    { verseText: string; pageNumber: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const getVerseData = async (verseKey: VerseKey) => {
      const verse = await getQuranClientInstance().verses.findByKey(verseKey, {
        fields: {
          textUthmani: true,
          codeV1: true,
          v1Page: true,
        },
      });
      return { verseText: verse.codeV1, pageNumber: verse.pageNumber };
    };
    const chapter = verseKey.split(":")[0];

    const verseKeys = Array.from(
      { length: versesToShow + 1 },
      (_, i) => `${chapter}:${verseNumber + i}` as VerseKey
    );

    Promise.all(verseKeys.map(getVerseData)).then((verses) => {
      setVerses(
        verses.map((v) => ({
          verseText: v.verseText ?? "",
          pageNumber: v.pageNumber,
        }))
      );
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full">
      <CardContent className="p-8 text-right">
        {Array.from({ length: revealVerses ? versesToShow + 1 : 1 }).map((_, index) => (
          <span
            key={index}
            className={`${getQcfCodeStr(
              verses[index].pageNumber
            )} text-4xl leading-relaxed ${index > 0 ? "text-green-700" : ""}`}
          >
            {verses[index].verseText}
          </span>
        ))}
      </CardContent>
    </Card>
  );
}
