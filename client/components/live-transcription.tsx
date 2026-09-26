"use client";

import { useEffect, useRef, useState } from "react";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { LiveTranscript } from "@/lib/word-alignment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaMicrophone, FaStop, FaEye, FaEyeSlash } from "react-icons/fa";

async function fetchScribeToken(): Promise<string> {
  const response = await fetch("/api/scribe-token");
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch scribe token");
  }
  return data.token;
}

interface LiveTranscriptionProps {
  resetKey?: string;
  disabled?: boolean;
  onStop: (transcript: string) => void;
  onTranscriptChange: (transcript: LiveTranscript) => void;
}

export function LiveTranscription({
  resetKey,
  disabled,
  onStop,
  onTranscriptChange,
}: LiveTranscriptionProps) {
  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    languageCode: "ar",
    commitStrategy: CommitStrategy.VAD,
    onError: (error) => console.error("Scribe error:", error),
  });

  const { clearTranscripts, disconnect, committedTranscripts, partialTranscript } = scribe;
  const stoppedRef = useRef(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    stoppedRef.current = false;
    clearTranscripts();
  }, [resetKey, clearTranscripts]);

  useEffect(() => {
    // After Stop, the final transcript has already been sent; ignore the
    // updates the hook emits while disconnecting.
    if (stoppedRef.current) return;
    onTranscriptChange({
      committed: committedTranscripts.map((t) => t.text).join(" "),
      partial: partialTranscript,
      isFinal: false,
    });
  }, [committedTranscripts, partialTranscript, onTranscriptChange]);

  useEffect(() => disconnect, [disconnect]);

  const isActive = scribe.status === "connecting" || scribe.isConnected;

  const handleStart = async () => {
    stoppedRef.current = false;
    try {
      const token = await fetchScribeToken();
      await scribe.connect({
        token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
    } catch (error) {
      console.error("Error starting transcription:", error);
      alert("Could not start live transcription. Please try again.");
    }
  };

  const handleStop = () => {
    const transcript = [
      ...scribe.committedTranscripts.map((t) => t.text),
      scribe.partialTranscript,
    ]
      .join(" ")
      .trim();
    stoppedRef.current = true;
    onTranscriptChange({ committed: transcript, partial: "", isFinal: true });
    disconnect();
    onStop(transcript);
  };

  const hasTranscript =
    scribe.committedTranscripts.length > 0 || scribe.partialTranscript;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          {isActive ? (
            <Button
              onClick={handleStop}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <FaStop />
              Stop Recording
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={disabled}
              size="lg"
              className="gap-2"
            >
              <FaMicrophone />
              Start Recording
            </Button>
          )}
        </div>

        {scribe.status === "connecting" && (
          <p className="text-center text-sm text-muted-foreground">
            Connecting...
          </p>
        )}

        {scribe.error && (
          <p className="text-center text-sm text-red-600">{scribe.error}</p>
        )}

        <div className="flex justify-center">
          <Button
            onClick={() => setShowTranscript((show) => !show)}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
          >
            {showTranscript ? <FaEyeSlash /> : <FaEye />}
            {showTranscript ? "Hide transcription" : "Show transcription"}
          </Button>
        </div>

        {showTranscript && hasTranscript && (
          <div dir="rtl" className="text-xl leading-loose text-right">
            {scribe.committedTranscripts.map((t) => (
              <span key={t.id}>{t.text} </span>
            ))}
            {scribe.partialTranscript && (
              <span className="text-muted-foreground">
                {scribe.partialTranscript}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
