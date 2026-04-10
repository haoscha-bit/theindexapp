/**
 * FocusTimer.tsx — Active Prescript Session
 * Design: Minimal, distraction-free countdown. Index blue accents. No background images.
 * Pass/Fail: User can pass (premature completion) or fail (abandon) at any time.
 * Animations: _CleAr_ and _FaIL_ in Press Start 2P font with Index logo, matching reference site.
 */
import { usePrescript } from "@/contexts/PrescriptContext";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check } from "lucide-react";
import { useSoundEffects, playMenuClick } from "@/hooks/useSoundEffects";

const INDEX_LOGO = "/assets/The_Index_Logo.webp";
const MESSAGE_URL = "/assets/PrescriptMessage.mp3";

// Scramble effect for _CleAr_ and _FaIL_ text
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function useScrambleText(finalText: string, active: boolean, duration: number = 800) {
  const [display, setDisplay] = useState("");
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setDisplay("");
      return;
    }

    const startTime = Date.now();
    const chars = finalText.split("");

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      const result = chars.map((char, i) => {
        if (char === "_" || char === " ") return char;
        const charProgress = Math.min(1, progress * chars.length / (i + 1));
        if (charProgress >= 1) return char;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      });

      setDisplay(result.join(""));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(finalText);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active, finalText, duration]);

  return display;
}

export default function FocusTimer() {
  const { activePrescript, timerEndTime, startTimer, completeSession, failSession } = usePrescript();
  const timerStartedRef = useRef(false);
  const [, navigate] = useLocation();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState<"clear" | "fail" | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearText = useScrambleText("_CleAr_", showResult === "clear", 600);
  const failText = useScrambleText("_FaIL_", showResult === "fail", 600);
  const { playMessageLoop, stopMessage } = useSoundEffects();

  // Redirect if no active prescript
  useEffect(() => {
    if (!activePrescript) {
      navigate("/receive");
      return;
    }
    // Start the timer exactly when the user lands on this page
    if (!timerEndTime && !timerStartedRef.current) {
      timerStartedRef.current = true;
      startTimer();
    }
  }, [activePrescript, timerEndTime, startTimer, navigate]);

  // Timer logic
  useEffect(() => {
    if (!timerEndTime) return;

    const tick = () => {
      const remaining = Math.max(0, timerEndTime - Date.now());
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setIsComplete(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerEndTime]);

  const handlePass = useCallback(() => {
    playMenuClick();
    setShowResult("clear");
    playMessageLoop();
    setTimeout(() => {
      stopMessage();
      completeSession();
      toast.success("Prescript fulfilled. Compliance recorded.");
      navigate("/");
    }, 2000);
  }, [completeSession, navigate, playMessageLoop, stopMessage]);

  const handleFail = useCallback(() => {
    setShowResult("fail");
    playMessageLoop();
    setTimeout(() => {
      stopMessage();
      failSession();
      toast.error("Deviation recorded. Streak compromised.");
      navigate("/");
    }, 2000);
  }, [failSession, navigate, playMessageLoop, stopMessage]);

  if (!activePrescript) return null;
  if (!timerEndTime) {
    // Timer is being initialized, show loading state
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.08 0.015 250)" }}>
        <p className="text-system text-[0.6rem] text-index-blue-dim tracking-[0.2em] animate-pulse">INITIALIZING SESSION...</p>
      </div>
    );
  }

  const totalDuration = activePrescript.duration * 60 * 1000;
  const elapsed = totalDuration - timeLeft;
  const progress = Math.min(1, elapsed / totalDuration);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: "oklch(0.08 0.015 250)" }}
    >
      {/* Result overlay — _CleAr_ or _FaIL_ */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ backgroundColor: "oklch(0.06 0.01 250)" }}
          >
            {/* Index Logo */}
            <motion.img
              src={INDEX_LOGO}
              alt="The Index"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain mb-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ filter: "drop-shadow(0 0 30px oklch(0.68 0.16 240 / 0.5))" }}
            />

            {/* Scramble text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-index-blue blue-glow text-center"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "clamp(1.2rem, 4vw, 2rem)",
                letterSpacing: "0.1em",
                textShadow: "0 0 20px oklch(0.68 0.16 240 / 0.4)",
              }}
            >
              {showResult === "clear" ? clearText : failText}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-index-blue/10">
        <div className="text-system text-[0.55rem] text-index-blue-dim tracking-[0.2em]">
          ACTIVE SESSION // {activePrescript.category?.toUpperCase() || "UNCATEGORIZED"}
        </div>

        {/* Fail button (replaces old Abandon) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-system text-[0.6rem] text-muted-foreground hover:text-seal-red-bright transition-colors flex items-center gap-1.5"
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "0.55rem" }}
            >
              Fail
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-seal-red-bright/30 max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-display text-xl text-ink">
                Confirm Failure
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                Failing this Prescript will be recorded as a deviation.
                Your streak will be compromised. This action is irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-system text-[0.6rem] border-border">
                Continue Session
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => { playMenuClick(); handleFail(); }}
                className="text-system text-[0.6rem] bg-seal-red/20 border border-seal-red-bright/30 text-seal-red-bright hover:bg-seal-red/30"
              >
                Accept Failure
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Main timer area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg w-full"
        >
          {/* Task name */}
          <p className="text-system text-[0.55rem] text-muted-foreground tracking-[0.2em] mb-3">
            CURRENT DIRECTIVE
          </p>
          <h2 className="text-display text-xl sm:text-2xl font-semibold text-ink mb-10 leading-relaxed">
            {activePrescript.name}
          </h2>

          {/* Timer display */}
          <div className="mb-10">
            {!isComplete ? (
              <div>
                <div className="text-6xl sm:text-8xl text-ink tabular-nums tracking-wider" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                  {String(minutes).padStart(2, "0")}
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-index-blue/60"
                  >
                    :
                  </motion.span>
                  {String(seconds).padStart(2, "0")}
                </div>
                <p className="text-system text-[0.55rem] text-muted-foreground mt-4 tracking-[0.15em]">
                  REMAINING
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-5xl sm:text-6xl font-semibold text-index-blue blue-glow mb-4" style={{ fontFamily: "var(--font-mono)" }}>
                  00:00
                </div>
                <p className="text-system text-[0.7rem] text-index-blue tracking-[0.25em]">
                  SESSION COMPLETE
                </p>
              </motion.div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto mb-10">
            <div className="h-px bg-border relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-index-blue/60"
                style={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[0.55rem] text-muted-foreground/50" style={{ fontFamily: "var(--font-mono)" }}>
                0:00
              </span>
              <span className="text-[0.55rem] text-muted-foreground/50" style={{ fontFamily: "var(--font-mono)" }}>
                {activePrescript.duration}:00
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {/* Pass button — always available */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handlePass}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-index-blue/10 border border-index-blue/40 text-index-blue hover:bg-index-blue/20 transition-all duration-300"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "clamp(0.5rem, 1.5vw, 0.7rem)",
                letterSpacing: "0.1em",
              }}
            >
              Pass
            </motion.button>

            {/* Seal Compliance — only when timer is done */}
            {isComplete && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handlePass}
                className="inline-flex items-center gap-3 px-6 sm:px-10 py-3 sm:py-4 bg-index-blue/10 border border-index-blue/40 text-index-blue text-system text-[0.75rem] tracking-[0.2em] hover:bg-index-blue/20 transition-all duration-300 animate-pulse-blue"
              >
                <Check size={18} />
                Seal Compliance
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom info */}
      <div className="relative z-10 px-4 sm:px-8 py-4 border-t border-index-blue/10 text-center">
        <p className="text-[0.5rem] text-muted-foreground/40" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
          FOCUS. COMPLY. THE PRESCRIPT DEMANDS NOTHING LESS.
        </p>
      </div>
    </div>
  );
}
