import { createContext, useContext, useEffect, useState } from "react";
import { getRank } from "@shared/ranks";

// Types
export interface Prescript {
  id: number;
  name: string;
  duration: number;
  category: string | null;
  deckId: number | null;
  createdAt: Date;
}

export interface Deck {
  id: number;
  name: string;
  createdAt: Date;
}

export interface SessionRecord {
  id: number;
  prescriptId: number;
  prescriptName: string | null;
  category: string | null;
  duration: number | null;
  status: "completed" | "failed";
  completedAt: Date;
}

export interface PrescriptState {
  prescripts: Prescript[];
  decks: Deck[];
  sessions: SessionRecord[];
  streak: number;
  totalCompleted: number;
  totalFailed: number;
  lastCompletedDate: Date | null;
  activePrescript: Prescript | null;
  timerEndTime: number | null;
  rank: string;
  selectedDeckId: number | null;
}

interface PrescriptContextType extends PrescriptState {
  addPrescript: (p: Omit<Prescript, "id" | "createdAt">) => Promise<void>;
  removePrescript: (id: number) => Promise<void>;
  assignPrescript: () => Prescript | null;
  startTimer: () => void;
  completeSession: () => Promise<void>;
  failSession: () => Promise<void>;
  clearActivePrescript: () => void;
  getCompletionRate: () => number;
  createDeck: (name: string) => Promise<void>;
  renameDeck: (id: number, name: string) => Promise<void>;
  deleteDeck: (id: number) => Promise<void>;
  setSelectedDeckId: (deckId: number | null) => void;
  updatePrescriptDeck: (prescriptId: number, deckId: number | null) => Promise<void>;
  getPrescriptsForDeck: (deckId: number | null) => Prescript[];
}

const PrescriptContext = createContext<PrescriptContextType | null>(null);

// --- localStorage helpers ---
function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}

function computeStats(sessions: SessionRecord[]) {
  const completed = sessions.filter((s) => s.status === "completed").length;
  const failed = sessions.filter((s) => s.status === "failed").length;

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const s of sorted) {
    const d = new Date(s.completedAt);
    d.setHours(0, 0, 0, 0);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - streak);
    if (s.status === "completed" && d.getTime() === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  const lastCompleted = sorted.find((s) => s.status === "completed")?.completedAt ?? null;

  return { completed, failed, streak, lastCompleted };
}

export function PrescriptProvider({ children }: { children: React.ReactNode }) {
  const [prescripts, setPrescripts] = useState<Prescript[]>(() =>
    loadData<Prescript[]>("prescripts", [])
  );
  const [decks, setDecks] = useState<Deck[]>(() =>
    loadData<Deck[]>("decks", [])
  );
  const [sessions, setSessions] = useState<SessionRecord[]>(() =>
    loadData<SessionRecord[]>("sessions", [])
  );
  const [activePrescript, setActivePrescript] = useState<Prescript | null>(() => {
    try {
      const stored = sessionStorage.getItem("activePrescript");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);

  // Persist on change
  useEffect(() => { saveData("prescripts", prescripts); }, [prescripts]);
  useEffect(() => { saveData("decks", decks); }, [decks]);
  useEffect(() => { saveData("sessions", sessions); }, [sessions]);

  const { completed, failed, streak, lastCompleted } = computeStats(sessions);
  const rank = getRank(completed);

  // --- Prescripts ---
  const addPrescript = async (p: Omit<Prescript, "id" | "createdAt">) => {
    setPrescripts((prev) => [
      ...prev,
      { ...p, id: nextId(prev), createdAt: new Date() },
    ]);
  };

  const removePrescript = async (id: number) => {
    setPrescripts((prev) => prev.filter((p) => p.id !== id));
  };

  const getPrescriptsForDeck = (deckId: number | null): Prescript[] => {
    if (deckId === null) return prescripts;
    return prescripts.filter((p) => p.deckId === deckId);
  };

  const assignPrescript = (): Prescript | null => {
    const pool = getPrescriptsForDeck(selectedDeckId);
    if (pool.length === 0) return null;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    setActivePrescript(selected);
    sessionStorage.setItem("activePrescript", JSON.stringify(selected));
    return selected;
  };

  const startTimer = () => {
    if (!activePrescript) return;
    setTimerEndTime(Date.now() + activePrescript.duration * 60 * 1000);
  };

  const clearActivePrescript = () => {
    setActivePrescript(null);
    setTimerEndTime(null);
    sessionStorage.removeItem("activePrescript");
  };

  const recordSession = async (status: "completed" | "failed") => {
    if (!activePrescript) return;
    const newSession: SessionRecord = {
      id: nextId(sessions),
      prescriptId: activePrescript.id,
      prescriptName: activePrescript.name,
      category: activePrescript.category,
      duration: activePrescript.duration,
      status,
      completedAt: new Date(),
    };
    setSessions((prev) => [...prev, newSession]);
    clearActivePrescript();
  };

  const completeSession = async () => recordSession("completed");
  const failSession = async () => recordSession("failed");

  const getCompletionRate = () => {
    if (sessions.length === 0) return 0;
    return Math.round((completed / sessions.length) * 100);
  };

  // --- Decks ---
  const createDeck = async (name: string) => {
    setDecks((prev) => [...prev, { id: nextId(prev), name, createdAt: new Date() }]);
  };

  const renameDeck = async (id: number, name: string) => {
    setDecks((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));
  };

  const deleteDeck = async (id: number) => {
    setDecks((prev) => prev.filter((d) => d.id !== id));
    setPrescripts((prev) => prev.map((p) => (p.deckId === id ? { ...p, deckId: null } : p)));
    if (selectedDeckId === id) setSelectedDeckId(null);
  };

  const updatePrescriptDeck = async (prescriptId: number, deckId: number | null) => {
    setPrescripts((prev) =>
      prev.map((p) => (p.id === prescriptId ? { ...p, deckId } : p))
    );
  };

  const value: PrescriptContextType = {
    prescripts,
    decks,
    sessions,
    streak,
    totalCompleted: completed,
    totalFailed: failed,
    lastCompletedDate: lastCompleted ? new Date(lastCompleted) : null,
    activePrescript,
    timerEndTime,
    rank,
    selectedDeckId,
    addPrescript,
    removePrescript,
    assignPrescript,
    startTimer,
    completeSession,
    failSession,
    clearActivePrescript,
    getCompletionRate,
    createDeck,
    renameDeck,
    deleteDeck,
    setSelectedDeckId,
    updatePrescriptDeck,
    getPrescriptsForDeck,
  };

  return (
    <PrescriptContext.Provider value={value}>{children}</PrescriptContext.Provider>
  );
}

export function usePrescript() {
  const ctx = useContext(PrescriptContext);
  if (!ctx) throw new Error("usePrescript must be used within PrescriptProvider");
  return ctx;
}
