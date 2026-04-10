/**
 * useTextScramble — scramble text animation matching nyos.dev/prescript style
 * 
 * Phase 1 (Scramble): All characters show random scramble chars, cycling rapidly.
 *   Duration controlled by scrambleDurationMs.
 * Phase 2 (Reveal): Characters resolve left-to-right from scramble into final text.
 *   Speed controlled by revealSpeed.
 * 
 * Callbacks:
 *   onScrambleStart — called when scramble begins
 *   onRevealStart — called when reveal (typing) begins
 *   onComplete — called when fully revealed
 */
import { useState, useRef, useCallback } from "react";

const SCRAMBLE_CHARS = "0123456789!█▒░ABCDEF";
const BLOCK_CHAR = "█";
const BLOCK_CHANCE = 0.35;

function randomChar(): string {
  return Math.random() < BLOCK_CHANCE
    ? BLOCK_CHAR
    : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

interface ScrambleOptions {
  scrambleDurationMs?: number; // How long to show pure scramble before reveal
  revealSpeed?: number; // Characters revealed per frame (fraction of total length)
  fps?: number;
  onScrambleStart?: () => void;
  onRevealStart?: () => void;
  onComplete?: () => void;
}

export function useTextScramble() {
  const [displayText, setDisplayText] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"idle" | "scramble" | "reveal" | "done">("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrambleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (scrambleTimerRef.current) {
      clearTimeout(scrambleTimerRef.current);
      scrambleTimerRef.current = null;
    }
  }, []);

  const start = useCallback((finalText: string, options: ScrambleOptions = {}) => {
    const {
      scrambleDurationMs = 1500,
      revealSpeed = 0.04,
      fps = 16,
      onScrambleStart,
      onRevealStart,
      onComplete,
    } = options;

    cleanup();
    setIsActive(true);
    setPhase("scramble");

    const len = finalText.length;

    // Generate scrambled text for each frame
    function generateScramble(): string {
      let out = "";
      for (let i = 0; i < len; i++) {
        if (finalText[i] === " ") {
          out += " ";
        } else {
          out += randomChar();
        }
      }
      return out;
    }

    // Phase 1: Pure scramble
    onScrambleStart?.();
    timerRef.current = setInterval(() => {
      setDisplayText(generateScramble());
    }, 1000 / fps);

    // After scrambleDurationMs, transition to reveal phase
    scrambleTimerRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);

      setPhase("reveal");
      onRevealStart?.();

      let progress = 0;

      timerRef.current = setInterval(() => {
        progress += revealSpeed * len;

        let out = "";
        for (let i = 0; i < len; i++) {
          const targetChar = finalText[i] ?? "";
          if (i < progress) {
            out += targetChar;
          } else {
            if (targetChar === " ") out += " ";
            else out += randomChar();
          }
        }
        setDisplayText(out);

        if (progress >= len) {
          setDisplayText(finalText);
          setPhase("done");
          setIsActive(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          onComplete?.();
        }
      }, 1000 / fps);
    }, scrambleDurationMs);
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setDisplayText("");
    setIsActive(false);
    setPhase("idle");
  }, [cleanup]);

  return {
    displayText,
    isActive,
    phase,
    start,
    reset,
  };
}
