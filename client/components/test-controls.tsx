"use client";

import { Button } from "@/components/ui/button";
import { FaCheck, FaTimes, FaStop } from "react-icons/fa";

interface TestControlsProps {
  onCorrect: () => void;
  onIncorrect: () => void;
  onEndTest: () => void;
}

export function TestControls({
  onCorrect,
  onIncorrect,
  onEndTest,
}: TestControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <Button
        onClick={onCorrect}
        variant="default"
        size="lg"
        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
      >
        <FaCheck />
        Correct
      </Button>
      <Button
        onClick={onIncorrect}
        variant="default"
        size="lg"
        className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
      >
        <FaTimes />
        Incorrect
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
  );
}

