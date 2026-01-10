"use client";

import { useState, useEffect } from "react";
import { RangeSelector } from "@/components/range-selector";
import { VerseDisplay } from "@/components/verse-display";
import { AudioPlayer } from "@/components/audio-player";
import { MushafModal } from "@/components/mushaf-modal";
import { TestControls } from "@/components/test-controls";
import { ResultsScreen } from "@/components/results-screen";
import { getQuranClientInstance } from "@/lib/quran-client";
import { Button } from "@/components/ui/button";
import { FaBook } from "react-icons/fa";

type TestState = "setup" | "testing" | "results";
type RangeType = "juz" | "page" | "chapter";

interface VerseData {
  verseKey: string;
  verseText: string;
  pageNumber: number;
}

function randomRangeInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function Home() {
  const [testState, setTestState] = useState<TestState>("setup");
  const [rangeType, setRangeType] = useState<RangeType>("juz");
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(30);

  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [mushafModalOpen, setMushafModalOpen] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const [score, setScore] = useState({ correct: 0, incorrect: 0, total: 0 });

  const getRandomVerse = async (selector: RangeType, data: {
    juzStart?: number;
    juzEnd?: number;
    pageStart?: number;
    pageEnd?: number;
    surahStart?: number;
    surahEnd?: number;
  }): Promise<string> => {
    switch (selector) {
      case "juz": {
        const { juzStart, juzEnd } = data;
        if (!juzStart || !juzEnd) throw new Error("Invalid juz range");
        const randomJuzNumber = randomRangeInclusive(juzStart, juzEnd);
        console.log("randomJuzNumber", randomJuzNumber);
        const response = await getQuranClientInstance().verses.findRandom({ juzNumber: randomJuzNumber });
        return response.verseKey;
      }
      case "chapter": {
        const { surahStart, surahEnd } = data;
        if (!surahStart || !surahEnd) throw new Error("Invalid chapter range");
        const randomSurahNumber = randomRangeInclusive(surahStart, surahEnd);
        console.log("randomSurahNumber", randomSurahNumber);
        const response = await getQuranClientInstance().verses.findRandom({ chapterNumber: randomSurahNumber });
        return response.verseKey;

      }
      case "page": {
        const { pageStart, pageEnd } = data;
        if (!pageStart || !pageEnd) throw new Error("Invalid page range");
        const randomPageNumber = randomRangeInclusive(pageStart, pageEnd);
        const response = await getQuranClientInstance().verses.findRandom({ pageNumber: randomPageNumber });
        return response.verseKey;
      }
      default:
        throw new Error("Invalid selector");
    }
  };

  const loadVerseData = async (verseKey: string) => {
    try {
      setIsLoading(true);
      // Request verse with codeV1 field for Arabic text display
      const verse = await getQuranClientInstance().verses.findByKey(verseKey as any, {
        fields: {
          textUthmani: true,
          codeV1: true,
          v1Page: true,
        },
      });
      
      console.log("Verse object:", JSON.stringify(verse, null, 2));
      console.log("Verse keys:", Object.keys(verse));
      
      // Get the Arabic text - prefer codeV1 as that's what the original API used
      // codeV1 is the Quranic script text that matches the QCF fonts
      const verseText = (verse as any).codeV1
      
      // Get page number - prefer v1Page as that matches codeV1
      const pageNumber = verse.pageNumber

      console.log("Extracted verse text:", verseText);
      console.log("Extracted page number:", pageNumber);

      if (!verseText) {
        console.error("No verse text found! Verse object:", verse);
        alert("Error: Could not load verse text. Please check console for details.");
        setIsLoading(false);
        return;
      }

      setVerseData({
        verseKey,
        verseText,
        pageNumber,
      });

      // Load audio
      loadAudio(verseKey);
    } catch (error) {
      console.error("Error loading verse:", error);
      alert("Error loading verse. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAudio = async (verseKey: string) => {
    try {
      setIsLoadingAudio(true);
      // Reciter ID 7 is Mishary Al Afasy
      const audioData = await getQuranClientInstance().audio.findVerseRecitationsByKey(verseKey as any, "7");
      
      console.log("Audio data response:", JSON.stringify(audioData, null, 2));
      
      // Extract audio URL from response
      // The response has audioFiles array with VerseRecitation objects that have a 'url' property
      if (audioData && audioData.audioFiles && audioData.audioFiles.length > 0) {
        const audioFile = audioData.audioFiles[0];
        let url = audioFile.url;
        
        console.log("Raw audio URL from API:", url);
        console.log("Full audio file object:", JSON.stringify(audioFile, null, 2));
        
        // Ensure URL is absolute (starts with http:// or https://)
        if (url) {
          let finalUrl = url;
          
          // If URL doesn't start with http:// or https://, it's relative
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            // Handle relative URLs
            if (url.startsWith("/")) {
              // Absolute path relative to origin - this shouldn't happen for audio files
              // Audio files should be on a CDN
              console.error("Received absolute path (starts with /) - this is unexpected for audio files:", url);
              setAudioUrl(null);
              return;
            } else {
              // Relative path (e.g., "Alafasy/mp3/002023.mp3")
              // Audio files from Quran.com are on the verses.quran.com CDN
              console.warn("Received relative URL, constructing absolute URL:", url);
              
              // Construct absolute URL using verses.quran.com base URL
              finalUrl = `https://verses.quran.com/${url}`;
              console.log("Constructed absolute URL:", finalUrl);
            }
          }
          
          // URL is absolute, use it
          console.log("Final audio URL:", finalUrl);
          setAudioUrl(finalUrl);
        } else {
          console.warn("No URL found in audio file:", audioFile);
          setAudioUrl(null);
        }
      } else {
        console.warn("Audio data structure unexpected:", audioData);
        setAudioUrl(null);
      }
    } catch (error) {
      console.error("Error loading audio:", error);
      setAudioUrl(null);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleStartTest = async (type: RangeType, start: number, end: number) => {
    setRangeType(type);
    setRangeStart(start);
    setRangeEnd(end);
    setScore({ correct: 0, incorrect: 0, total: 0 });
    setTestState("testing");
    await loadNewVerse(type, { 
      juzStart: type === "juz" ? start : undefined,
      juzEnd: type === "juz" ? end : undefined,
      pageStart: type === "page" ? start : undefined,
      pageEnd: type === "page" ? end : undefined,
      surahStart: type === "chapter" ? start : undefined,
      surahEnd: type === "chapter" ? end : undefined,
    });
  };

  const loadNewVerse = async (type: RangeType, data: any) => {
    try {
      setIsLoading(true);
      const verseKey = await getRandomVerse(type, data);
      console.log("verseKey", verseKey);
      await loadVerseData(verseKey);
    } catch (error) {
      console.error("Error loading new verse:", error);
      alert("Error loading verse. Please try again.");
      setIsLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setScore((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      total: prev.total + 1,
    }));

    // Load next verse
    loadNewVerse(rangeType, {
      juzStart: rangeType === "juz" ? rangeStart : undefined,
      juzEnd: rangeType === "juz" ? rangeEnd : undefined,
      pageStart: rangeType === "page" ? rangeStart : undefined,
      pageEnd: rangeType === "page" ? rangeEnd : undefined,
      surahStart: rangeType === "chapter" ? rangeStart : undefined,
      surahEnd: rangeType === "chapter" ? rangeEnd : undefined,
    });
  };

  const handleEndTest = () => {
    setTestState("results");
  };

  const handleNewTest = () => {
    setTestState("setup");
    setVerseData(null);
    setAudioUrl(null);
    setScore({ correct: 0, incorrect: 0, total: 0 });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <FaBook />
            Quran Hifz Practice
          </h1>
          <p className="text-muted-foreground">
            Test and strengthen your memorization
          </p>
        </div>

        {testState === "setup" && (
          <RangeSelector onStart={handleStartTest} />
        )}

        {testState === "testing" && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-lg">Loading verse...</div>
              </div>
            ) : verseData ? (
              <>
                <VerseDisplay
                  verseText={verseData.verseText}
                  pageNumber={verseData.pageNumber}
                />
                {showAnswer && <VerseDisplay
                  verseText={verseData.verseText}
                  pageNumber={verseData.pageNumber}
                />}
                
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <AudioPlayer audioUrl={audioUrl} isLoading={isLoadingAudio} />
                  <Button
                    onClick={() => setMushafModalOpen(true)}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <FaBook />
                    View Mushaf
                  </Button>
                  <Button
                    onClick={() => setShowAnswer(true)}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <FaBook />
                    Reveal Answer
                  </Button>
                </div>

                <TestControls
                  onCorrect={() => handleAnswer(true)}
                  onIncorrect={() => handleAnswer(false)}
                  onEndTest={handleEndTest}
                />
              </>
            ) : null}

            <MushafModal
              isOpen={mushafModalOpen}
              onClose={() => setMushafModalOpen(false)}
              pageNumber={verseData?.pageNumber || 1}
            />
          </div>
        )}

        {testState === "results" && (
          <ResultsScreen
            total={score.total}
            correct={score.correct}
            incorrect={score.incorrect}
            onNewTest={handleNewTest}
          />
        )}
      </div>
    </div>
  );
}
