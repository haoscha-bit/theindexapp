/**
 * ReceivePrescript.tsx — Receive a Prescript assignment
 * Design: Matches nyos.dev/prescript style.
 *   - Black background, Index logo centered at top
 *   - Deck selector before receiving
 *   - "- Click to Receive -" prompt in pixel font
 *   - On click: scramble animation with PrescriptRandomizer.mp3
 *   - Then: text resolves left-to-right with PrescriptMessage.mp3 (looping)
 *   - After reveal: show task details and Begin Compliance button
 */
import Layout from "@/components/Layout";
import { usePrescript } from "@/contexts/PrescriptContext";
import { useLocation } from "wouter";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ChevronRight, Clock, Tag, RefreshCw, Folder, ChevronDown } from "lucide-react";
import { usePrescriptAudio } from "@/hooks/usePrescriptAudio";
import { playMenuClick } from "@/hooks/useSoundEffects";

const INDEX_LOGO_GLOW = "/assets/The_Index_Logo.webp";

const SCRAMBLE_CHARS = "0123456789!█▒░ABCDEF";
const BLOCK_CHAR = "█";
const BLOCK_CHANCE = 0.35;

function randomChar(): string {
  return Math.random() < BLOCK_CHANCE
    ? BLOCK_CHAR
    : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

export default function ReceivePrescript() {
  const {
    prescripts,
    decks,
    assignPrescript,
    activePrescript,
    selectedDeckId,
    setSelectedDeckId,
    getPrescriptsForDeck,
  } = usePrescript();
  const [, navigate] = useLocation();
  const { playRandomizer, stopRandomizer, playMessage, stopMessage, stopAll } = usePrescriptAudio();

  // States: idle -> scrambling -> revealing -> revealed
  const [phase, setPhase] = useState<"idle" | "scrambling" | "revealing" | "revealed">(
    activePrescript ? "revealed" : "idle"
  );
  const [assignedPrescript, setAssignedPrescript] = useState(activePrescript);
  const [displayText, setDisplayText] = useState("");
  const [rerollsUsed, setRerollsUsed] = useState(0);
  const [showDetails, setShowDetails] = useState(activePrescript ? true : false);
  const MAX_REROLLS = 1;

  const scrambleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pool count for the currently selected deck
  const poolPrescripts = getPrescriptsForDeck(selectedDeckId);
  const poolCount = poolPrescripts.length;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
      if (scrambleTimerRef.current) clearInterval(scrambleTimerRef.current);
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, [stopAll]);

  const runScrambleAndReveal = useCallback((taskName: string, onComplete: () => void) => {
    const len = taskName.length;
    const FPS = 16;
    const SCRAMBLE_DURATION_MS = 1500; // Pure scramble phase
    const REVEAL_SPEED = 0.04; // Fraction of total length per frame

    // Phase 1: Pure scramble — play randomizer audio
    playRandomizer();
    setPhase("scrambling");

    scrambleTimerRef.current = setInterval(() => {
      let out = "";
      for (let i = 0; i < len; i++) {
        if (taskName[i] === " ") {
          out += " ";
        } else {
          out += randomChar();
        }
      }
      setDisplayText(out);
    }, 1000 / FPS);

    // After scramble duration, transition to reveal
    phaseTimerRef.current = setTimeout(() => {
      if (scrambleTimerRef.current) {
        clearInterval(scrambleTimerRef.current);
        scrambleTimerRef.current = null;
      }

      // Stop randomizer, start message audio
      stopRandomizer();
      playMessage();
      setPhase("revealing");

      let progress = 0;

      revealTimerRef.current = setInterval(() => {
        progress += REVEAL_SPEED * len;

        let out = "";
        for (let i = 0; i < len; i++) {
          const targetChar = taskName[i] ?? "";
          if (i < progress) {
            out += targetChar;
          } else {
            if (targetChar === " ") out += " ";
            else out += randomChar();
          }
        }
        setDisplayText(out);

        if (progress >= len) {
          setDisplayText(taskName);
          if (revealTimerRef.current) {
            clearInterval(revealTimerRef.current);
            revealTimerRef.current = null;
          }
          stopMessage();
          onComplete();
        }
      }, 1000 / FPS);
    }, SCRAMBLE_DURATION_MS);
  }, [playRandomizer, stopRandomizer, playMessage, stopMessage]);

  const handleAssign = useCallback(() => {
    if (poolCount === 0) {
      toast.error(
        selectedDeckId !== null
          ? "No Prescripts in this deck. Assign tasks to this deck first."
          : "No Prescripts in the pool. Inscribe tasks first."
      );
      return;
    }

    const result = assignPrescript();
    if (result) {
      setAssignedPrescript(result);
      setShowDetails(false);

      runScrambleAndReveal(result.name, () => {
        setPhase("revealed");
        // Show details with a slight delay after text is fully revealed
        setTimeout(() => {
          setShowDetails(true);
        }, 400);
      });
    } else {
      toast.error("Assignment failed. The system could not select a Prescript.");
    }
  }, [poolCount, selectedDeckId, assignPrescript, runScrambleAndReveal]);

  const handleReroll = useCallback(() => {
    if (rerollsUsed >= MAX_REROLLS) {
      toast.error("Reroll limit reached. You must comply.");
      return;
    }

    setRerollsUsed((prev) => prev + 1);
    setShowDetails(false);

    const result = assignPrescript();
    if (result) {
      setAssignedPrescript(result);

      runScrambleAndReveal(result.name, () => {
        setPhase("revealed");
        setTimeout(() => {
          setShowDetails(true);
          toast("Prescript has been reassigned. This is your final directive.");
        }, 400);
      });
    }
  }, [rerollsUsed, MAX_REROLLS, assignPrescript, runScrambleAndReveal]);

  const handleBeginSession = () => {
    navigate("/focus");
  };

  const getSelectedDeckName = () => {
    if (selectedDeckId === null) return "All Prescripts";
    return decks.find((d) => d.id === selectedDeckId)?.name || "Unknown Deck";
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        {/* Index Logo — always visible at top */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={INDEX_LOGO_GLOW}
            alt="The Index"
            className="w-28 h-28 sm:w-36 sm:h-36 mx-auto object-contain"
            style={{ filter: "drop-shadow(0 0 20px oklch(0.68 0.16 240 / 0.4))" }}
          />
        </motion.div>

        {/* Idle state — Deck selector + Click to Receive */}
        {phase === "idle" && !activePrescript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {/* Deck Selector — only show if decks exist */}
            {decks.length > 0 && (
              <div className="mb-8">
                <p className="text-system text-[0.5rem] text-muted-foreground/50 tracking-[0.2em] mb-2">
                  SELECT DECK
                </p>
                <div className="relative inline-block">
                  <select
                    value={selectedDeckId ?? ""}
                    onChange={(e) =>
                      setSelectedDeckId(e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="appearance-none bg-transparent border border-index-blue/20 text-index-blue-dim text-sm px-4 py-2 pr-8 cursor-pointer focus:outline-none focus:border-index-blue/50 transition-colors min-w-[180px] text-center"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <option value="">All Prescripts</option>
                    {decks.map((deck) => (
                      <option key={deck.id} value={deck.id}>
                        {deck.name} ({prescripts.filter((p) => p.deckId === deck.id).length})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-index-blue-dim pointer-events-none"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleAssign}
              disabled={poolCount === 0}
              className="text-pixel text-sm sm:text-base text-index-blue-bright tracking-wider hover:text-index-blue transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              - Click to Receive -
            </button>

            {poolCount === 0 && (
              <p className="text-[0.65rem] text-seal-red-bright mt-4 font-mono">
                {selectedDeckId !== null
                  ? "This deck has no Prescripts. Assign tasks to it first."
                  : "No Prescripts inscribed. Visit the Inscription Chamber first."}
              </p>
            )}

            {poolCount > 0 && (
              <p className="text-[0.55rem] text-muted-foreground/40 mt-4 font-mono tracking-wider">
                {poolCount} TASK{poolCount !== 1 ? "S" : ""} IN{" "}
                {selectedDeckId !== null ? (
                  <span className="text-index-blue-dim">
                    <Folder size={9} className="inline -mt-0.5 mr-0.5" />
                    {getSelectedDeckName().toUpperCase()}
                  </span>
                ) : (
                  "POOL"
                )}
              </p>
            )}
          </motion.div>
        )}

        {/* Scrambling / Revealing / Revealed — show the text */}
        {(phase === "scrambling" || phase === "revealing" || phase === "revealed") && (
          <div className="text-center max-w-2xl w-full">
            {/* The scramble/reveal text in Press Start 2P */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="min-h-[3rem] flex items-center justify-center"
            >
              <p className="text-pixel text-sm sm:text-base md:text-lg text-index-blue-bright blue-glow leading-relaxed break-words">
                {displayText || assignedPrescript?.name || ""}
              </p>
            </motion.div>

            {/* Task details — fade in after reveal completes */}
            <AnimatePresence>
              {showDetails && assignedPrescript && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-10"
                >
                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={14} className="text-index-blue-dim" />
                      <span>{assignedPrescript.duration} minutes</span>
                    </div>
                    {assignedPrescript.category && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Tag size={14} className="text-index-blue-dim" />
                        <span>{assignedPrescript.category}</span>
                      </div>
                    )}
                    {assignedPrescript.deckId && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Folder size={14} className="text-index-blue-dim" />
                        <span>
                          {decks.find((d) => d.id === assignedPrescript.deckId)?.name || "Deck"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => { playMenuClick(); handleBeginSession(); }}
                      className="flex items-center gap-3 px-8 py-4 bg-index-blue/10 border border-index-blue/40 text-index-blue text-system text-[0.7rem] tracking-[0.15em] hover:bg-index-blue/20 transition-all duration-300"
                    >
                      Begin Compliance
                      <ChevronRight size={16} />
                    </button>

                    {rerollsUsed < MAX_REROLLS && poolCount > 1 && (
                      <button
                        onClick={() => { playMenuClick(); handleReroll(); }}
                        className="flex items-center gap-2 px-4 py-4 border border-border text-muted-foreground text-system text-[0.6rem] hover:border-index-blue/20 hover:text-index-blue-dim transition-all duration-200"
                      >
                        <RefreshCw size={14} />
                        Reroll ({MAX_REROLLS - rerollsUsed} remaining)
                      </button>
                    )}
                  </div>

                  {/* Warning */}
                  <p className="text-[0.5rem] text-muted-foreground/40 mt-8 tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
                    CANCELLATION OF AN ACTIVE SESSION WILL BE RECORDED AS DEVIATION.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}
