"use client";

import { Button } from "@/components/ui/button";
import { FaStop } from "react-icons/fa";

interface TestControlsProps {
  onEndTest: () => void;
}

export function TestControls({ onEndTest }: TestControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
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
