"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaPlay, FaPause } from "react-icons/fa";

interface AudioPlayerProps {
  audioUrl: string | null;
  isLoading?: boolean;
}

export function AudioPlayer({ audioUrl, isLoading }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    // Reset when audio URL changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  if (!audioUrl && !isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={audioUrl || undefined} preload="none" />
      <Button
        onClick={togglePlay}
        disabled={!audioUrl || isLoading}
        variant="outline"
        size="lg"
        className="gap-2"
      >
        {isPlaying ? (
          <>
            <FaPause />
            Pause
          </>
        ) : (
          <>
            <FaPlay />
            Play Audio
          </>
        )}
      </Button>
    </div>
  );
}

