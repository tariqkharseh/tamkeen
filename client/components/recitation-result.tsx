"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaCheck, FaTimes, FaArrowRight, FaStop } from "react-icons/fa";
import { RecitationResult } from "@/lib/recitation";

interface RecitationResultCardProps {
  result: RecitationResult;
  onNext: () => void;
  onEndTest: () => void;
}

export function RecitationResultCard({
  result,
  onNext,
  onEndTest,
}: RecitationResultCardProps) {
  return (
    <Card
      className={
        result.isCorrect
          ? "border-green-600 bg-green-50"
          : "border-red-600 bg-red-50"
      }
    >
      <CardContent className="space-y-4">
        <div
          className={`flex items-center justify-center gap-2 text-2xl font-bold ${
            result.isCorrect ? "text-green-700" : "text-red-700"
          }`}
        >
          {result.isCorrect ? <FaCheck /> : <FaTimes />}
          {result.isCorrect ? "Correct" : "Incorrect"}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {Math.round(result.similarity * 100)}% match
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button onClick={onNext} size="lg" className="flex-1 gap-2">
            Next
            <FaArrowRight />
          </Button>
          <Button
            onClick={onEndTest}
            variant="outline"
            size="lg"
            className="flex-1 gap-2"
          >
            <FaStop />
            End Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
