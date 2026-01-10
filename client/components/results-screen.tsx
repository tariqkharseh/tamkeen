"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResultsScreenProps {
  total: number;
  correct: number;
  incorrect: number;
  onNewTest: () => void;
}

export function ResultsScreen({
  total,
  correct,
  incorrect,
  onNewTest,
}: ResultsScreenProps) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Results</CardTitle>
        <CardDescription>Your performance summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="text-6xl font-bold">{percentage}%</div>
          <div className="text-lg text-muted-foreground">Accuracy</div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {correct}
            </div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg">
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {incorrect}
            </div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </div>
        </div>

        <Button onClick={onNewTest} className="w-full" size="lg">
          Start New Test
        </Button>
      </CardContent>
    </Card>
  );
}

