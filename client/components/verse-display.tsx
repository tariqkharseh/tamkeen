"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getFontFamilyForPage } from "@/lib/font-loader";

interface VerseDisplayProps {
  verseText: string;
  pageNumber: number;
  versesToShow?: number;
}

export function VerseDisplay({ verseText, pageNumber, versesToShow = 3 }: VerseDisplayProps) {
  const getQcfCodeStr = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= 9) {
      return `QCF_P00${pageNum}`;
    } else if (pageNum >= 10 && pageNum <= 99) {
      return `QCF_P0${pageNum}`;
    } else {
      return `QCF_P${pageNum}`;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-8">
        {Array.from({ length: versesToShow }).map((_, index) => (
          <span key={index} className={`${getQcfCodeStr(pageNumber)} text-4xl leading-relaxed ${index > 0 ? "text-green-700" : ""}`}>
            {verseText}
          </span>
        ))}
      </CardContent>
    </Card>
  );
}
