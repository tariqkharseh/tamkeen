"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type RangeType = "juz" | "page" | "chapter";

interface RangeSelectorProps {
  onStart: (type: RangeType, start: number, end: number) => void;
}

export function RangeSelector({ onStart }: RangeSelectorProps) {
  const [rangeType, setRangeType] = useState<RangeType>("juz");
  const [start, setStart] = useState<string>("1");
  const [end, setEnd] = useState<string>("30");

  const handleRangeTypeChange = (value: string) => {
    const type = value as RangeType;
    setRangeType(type);
    
    // Set default ranges based on type
    if (type === "juz") {
      setStart("1");
      setEnd("30");
    } else if (type === "page") {
      setStart("1");
      setEnd("604");
    } else if (type === "chapter") {
      setStart("1");
      setEnd("114");
    }
  };

  const handleStart = () => {
    const startNum = parseInt(start);
    const endNum = parseInt(end);
    
    if (isNaN(startNum) || isNaN(endNum)) {
      alert("Please enter valid numbers");
      return;
    }
    
    if (startNum > endNum) {
      alert("Start value must be less than or equal to end value");
      return;
    }
    
    if (startNum < 1) {
      alert("Start value must be at least 1");
      return;
    }
    
    const maxValue = rangeType === "juz" ? 30 : rangeType === "page" ? 604 : 114;
    if (endNum > maxValue) {
      alert(`End value must be at most ${maxValue}`);
      return;
    }
    
    onStart(rangeType, startNum, endNum);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Select Range</CardTitle>
        <CardDescription>
          Choose the range of verses you want to practice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={rangeType} onValueChange={handleRangeTypeChange}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="juz" id="juz" />
            <Label htmlFor="juz" className="cursor-pointer">
              Juz (1-30)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="page" id="page" />
            <Label htmlFor="page" className="cursor-pointer">
              Page (1-604)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="chapter" id="chapter" />
            <Label htmlFor="chapter" className="cursor-pointer">
              Chapter/Surah (1-114)
            </Label>
          </div>
        </RadioGroup>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="start">Start</Label>
            <Input
              id="start"
              type="number"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              min={1}
              max={rangeType === "juz" ? 30 : rangeType === "page" ? 604 : 114}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="end">End</Label>
            <Input
              id="end"
              type="number"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              min={1}
              max={rangeType === "juz" ? 30 : rangeType === "page" ? 604 : 114}
            />
          </div>
        </div>

        <Button onClick={handleStart} className="w-full" size="lg">
          Start Test
        </Button>
      </CardContent>
    </Card>
  );
}

