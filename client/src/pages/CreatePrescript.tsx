/**
 * CreatePrescript.tsx — Inscribe Prescripts
 * Design: Form styled as filling out an official Index document, blue accents
 * Features: Deck management, prescript-to-deck assignment
 */
import Layout from "@/components/Layout";
import DocumentCard from "@/components/DocumentCard";
import { usePrescript, type Prescript } from "@/contexts/PrescriptContext";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { playMenuClick } from "@/hooks/useSoundEffects";
import {
  Plus,
  Trash2,
  Clock,
  Tag,
  Pencil,
  Check,
  X,
  FolderPlus,
  Folder,
  FolderOpen,
  GripVertical,
  ChevronDown,
} from "lucide-react";

const CATEGORY_SUGGESTIONS = [
  "Mathematics",
  "Science",
  "Literature",
  "History",
  "Languages",
  "Programming",
  "Art",
  "Music",
  "Philosophy",
  "Review",
  "Practice",
  "Reading",
];

export default function CreatePrescript() {
  const {
    prescripts,
    decks,
    addPrescript,
    removePrescript,
    createDeck,
    renameDeck,
    deleteDeck,
    updatePrescriptDeck,
  } = usePrescript();

  // Form state
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [selectedDeckForNew, setSelectedDeckForNew] = useState<number | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; duration: string; category: string }>({
    name: "",
    duration: "",
    category: "",
  });

  // Deck management state
  const [showDeckCreator, setShowDeckCreator] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [renamingDeckId, setRenamingDeckId] = useState<number | null>(null);
  const [renameDeckName, setRenameDeckName] = useState("");

  // View filter: which deck to show
  const [viewDeckId, setViewDeckId] = useState<number | "all" | "unassigned">("all");

  // Moving prescript to deck
  const [movingPrescriptId, setMovingPrescriptId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !duration) return;
    playMenuClick();

    const dur = parseInt(duration);
    if (isNaN(dur) || dur <= 0 || dur > 480) {
      toast.error("Duration must be between 1 and 480 minutes.");
      return;
    }

    try {
      await addPrescript({
        name: name.trim(),
        duration: dur,
        category: category.trim() || null,
        deckId: selectedDeckForNew,
      });

      toast.success("Prescript has been inscribed into the pool.");
      setName("");
      setDuration("");
      setCategory("");
    } catch (err) {
      toast.error("Failed to inscribe prescript.");
    }
  };

  const startEdit = (p: Prescript) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      duration: p.duration.toString(),
      category: p.category || "",
    });
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.name.trim() || !editForm.duration) return;
    const dur = parseInt(editForm.duration);
    if (isNaN(dur) || dur <= 0) return;

    try {
      await removePrescript(editingId);
      await addPrescript({
        name: editForm.name.trim(),
        duration: dur,
        category: editForm.category.trim() || null,
        deckId: prescripts.find((p) => p.id === editingId)?.deckId ?? null,
      });
      setEditingId(null);
      toast.success("Prescript has been amended.");
    } catch (err) {
      toast.error("Failed to update prescript.");
    }
  };

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) return;
    playMenuClick();
    try {
      await createDeck(newDeckName.trim());
      toast.success(`Deck "${newDeckName.trim()}" has been created.`);
      setNewDeckName("");
      setShowDeckCreator(false);
    } catch (err) {
      toast.error("Failed to create deck.");
    }
  };

  const handleRenameDeck = async () => {
    if (!renamingDeckId || !renameDeckName.trim()) return;
    playMenuClick();
    try {
      await renameDeck(renamingDeckId, renameDeckName.trim());
      toast.success("Deck has been renamed.");
      setRenamingDeckId(null);
      setRenameDeckName("");
    } catch (err) {
      toast.error("Failed to rename deck.");
    }
  };

  const handleDeleteDeck = async (deckId: number, deckName: string) => {
    playMenuClick();
    try {
      await deleteDeck(deckId);
      toast.success(`Deck "${deckName}" has been dissolved. Its prescripts are now unassigned.`);
      if (viewDeckId === deckId) setViewDeckId("all");
    } catch (err) {
      toast.error("Failed to delete deck.");
    }
  };

  const handleMovePrescript = async (prescriptId: number, deckId: number | null) => {
    playMenuClick();
    try {
      await updatePrescriptDeck(prescriptId, deckId);
      const deckName = deckId ? decks.find((d) => d.id === deckId)?.name : "Unassigned";
      toast.success(`Prescript moved to ${deckName}.`);
      setMovingPrescriptId(null);
    } catch (err) {
      toast.error("Failed to move prescript.");
    }
  };

  // Filter prescripts based on view
  const filteredPrescripts =
    viewDeckId === "all"
      ? prescripts
      : viewDeckId === "unassigned"
        ? prescripts.filter((p) => p.deckId === null)
        : prescripts.filter((p) => p.deckId === viewDeckId);

  const getDeckName = (deckId: number | null) => {
    if (deckId === null) return "Unassigned";
    return decks.find((d) => d.id === deckId)?.name || "Unknown Deck";
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-system text-[0.6rem] text-index-blue-dim mb-2 tracking-[0.2em]">
            INSCRIBE // TASK POOL MANAGEMENT
          </p>
          <h1 className="text-display text-3xl font-bold text-ink">
            Inscribe Prescripts
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg">
            Add tasks to your Prescript pool and organize them into decks.
            Decks allow you to control which types of Prescripts you receive.
          </p>
        </div>

        {/* ─── Deck Management Section ─────────────────────────────────── */}
        <DocumentCard classification="DECK MANAGEMENT" priority="standard" className="mb-6">
          <div className="space-y-3">
            {/* Deck list */}
            <div className="flex flex-wrap gap-2">
              {decks.map((deck) => (
                <div key={deck.id} className="group relative">
                  {renamingDeckId === deck.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={renameDeckName}
                        onChange={(e) => setRenameDeckName(e.target.value)}
                        className="bg-background/50 border-index-blue/20 text-ink h-8 text-xs w-40"
                        onKeyDown={(e) => e.key === "Enter" && handleRenameDeck()}
                        autoFocus
                      />
                      <button
                        onClick={handleRenameDeck}
                        className="p-1.5 hover:bg-index-blue/10 transition-colors"
                      >
                        <Check size={12} className="text-index-blue" />
                      </button>
                      <button
                        onClick={() => setRenamingDeckId(null)}
                        className="p-1.5 hover:bg-seal-red/10 transition-colors"
                      >
                        <X size={12} className="text-seal-red-bright" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-index-blue/5 border border-index-blue/20 text-sm text-ink hover:bg-index-blue/10 transition-colors">
                      <Folder size={13} className="text-index-blue shrink-0" />
                      <span className="max-w-[120px] truncate">{deck.name}</span>
                      <span className="text-[0.6rem] text-muted-foreground ml-1">
                        ({prescripts.filter((p) => p.deckId === deck.id).length})
                      </span>
                      <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setRenamingDeckId(deck.id);
                            setRenameDeckName(deck.name);
                          }}
                          className="p-0.5 hover:bg-index-blue/20 rounded"
                          title="Rename"
                        >
                          <Pencil size={10} className="text-index-blue" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeck(deck.id, deck.name)}
                          className="p-0.5 hover:bg-seal-red/20 rounded"
                          title="Delete deck"
                        >
                          <Trash2 size={10} className="text-seal-red-bright" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Create deck button / inline form */}
              {showDeckCreator ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="Deck name..."
                    className="bg-background/50 border-index-blue/20 text-ink h-8 text-xs w-40"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateDeck()}
                    autoFocus
                  />
                  <button
                    onClick={handleCreateDeck}
                    className="p-1.5 hover:bg-index-blue/10 transition-colors"
                  >
                    <Check size={12} className="text-index-blue" />
                  </button>
                  <button
                    onClick={() => {
                      setShowDeckCreator(false);
                      setNewDeckName("");
                    }}
                    className="p-1.5 hover:bg-seal-red/10 transition-colors"
                  >
                    <X size={12} className="text-seal-red-bright" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeckCreator(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-index-blue/30 text-index-blue text-sm hover:bg-index-blue/5 transition-colors"
                >
                  <FolderPlus size={13} />
                  New Deck
                </button>
              )}
            </div>

            {decks.length === 0 && (
              <p className="text-[0.75rem] text-muted-foreground">
                No decks created yet. Create a deck to organize your Prescripts by subject or type.
              </p>
            )}
          </div>
        </DocumentCard>

        {/* ─── Inscription Form ────────────────────────────────────────── */}
        <DocumentCard classification="INSCRIPTION FORM" priority="standard" className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-system text-[0.65rem] text-muted-foreground tracking-[0.1em] block mb-2">
                TASK NAME
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Review Chapter 5 — Organic Chemistry"
                className="bg-background/50 border-index-blue/20 text-ink h-10"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-system text-[0.65rem] text-muted-foreground tracking-[0.1em] block mb-2">
                  DURATION (MINUTES)
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  min="1"
                  max="480"
                  className="bg-background/50 border-index-blue/20 text-ink h-10"
                />
              </div>
              <div>
                <label className="text-system text-[0.65rem] text-muted-foreground tracking-[0.1em] block mb-2">
                  CATEGORY (OPTIONAL)
                </label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Chemistry"
                  className="bg-background/50 border-index-blue/20 text-ink h-10"
                  list="categories"
                />
                <datalist id="categories">
                  {CATEGORY_SUGGESTIONS.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Deck assignment for new prescript */}
            <div>
              <label className="text-system text-[0.65rem] text-muted-foreground tracking-[0.1em] block mb-2">
                ASSIGN TO DECK (OPTIONAL)
              </label>
              <div className="relative">
                <select
                  value={selectedDeckForNew ?? ""}
                  onChange={(e) =>
                    setSelectedDeckForNew(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full h-10 px-3 bg-background/50 border border-index-blue/20 text-ink text-sm appearance-none cursor-pointer focus:outline-none focus:border-index-blue/50"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <option value="">No deck (unassigned)</option>
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 px-4 py-3 bg-index-blue/10 border border-index-blue/30 text-index-blue text-system text-[0.65rem] tracking-[0.15em] hover:bg-index-blue/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              INSCRIBE PRESCRIPT
            </button>
          </form>
        </DocumentCard>

        {/* ─── Prescript List with Deck Filter ─────────────────────────── */}
        <div>
          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <p className="text-system text-[0.6rem] text-index-blue-dim tracking-[0.2em] mr-2">
              VIEW:
            </p>
            <button
              onClick={() => setViewDeckId("all")}
              className={`px-3 py-1 text-[0.65rem] border transition-colors ${
                viewDeckId === "all"
                  ? "bg-index-blue/15 border-index-blue/40 text-index-blue"
                  : "border-index-blue/10 text-muted-foreground hover:bg-index-blue/5"
              }`}
            >
              All ({prescripts.length})
            </button>
            <button
              onClick={() => setViewDeckId("unassigned")}
              className={`px-3 py-1 text-[0.65rem] border transition-colors ${
                viewDeckId === "unassigned"
                  ? "bg-index-blue/15 border-index-blue/40 text-index-blue"
                  : "border-index-blue/10 text-muted-foreground hover:bg-index-blue/5"
              }`}
            >
              Unassigned ({prescripts.filter((p) => p.deckId === null).length})
            </button>
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => setViewDeckId(deck.id)}
                className={`px-3 py-1 text-[0.65rem] border transition-colors flex items-center gap-1 ${
                  viewDeckId === deck.id
                    ? "bg-index-blue/15 border-index-blue/40 text-index-blue"
                    : "border-index-blue/10 text-muted-foreground hover:bg-index-blue/5"
                }`}
              >
                <Folder size={11} />
                {deck.name} ({prescripts.filter((p) => p.deckId === deck.id).length})
              </button>
            ))}
          </div>

          <p className="text-system text-[0.6rem] text-index-blue-dim mb-4 tracking-[0.2em]">
            SHOWING {filteredPrescripts.length} PRESCRIPT{filteredPrescripts.length !== 1 ? "S" : ""}
          </p>

          {filteredPrescripts.length === 0 ? (
            <DocumentCard classification="STATUS" priority="elevated">
              <div className="text-center py-8">
                <p className="text-display text-lg font-semibold text-ink mb-2">
                  {viewDeckId === "all"
                    ? "No Prescripts Inscribed"
                    : viewDeckId === "unassigned"
                      ? "No Unassigned Prescripts"
                      : "This Deck Is Empty"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {viewDeckId === "all"
                    ? "Add your first task to begin building your Prescript pool."
                    : "Inscribe new Prescripts or move existing ones here."}
                </p>
              </div>
            </DocumentCard>
          ) : (
            <AnimatePresence>
              {filteredPrescripts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -12, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <div className="document-border bg-card/60 group mb-3">
                    <div className="classification-bar flex items-center justify-between">
                      <span>
                        PRESCRIPT #{String(i + 1).padStart(3, "0")} // {p.category || "UNCATEGORIZED"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground/60 flex items-center gap-1">
                          <Folder size={10} />
                          {getDeckName(p.deckId)}
                        </span>
                        <span className="text-muted-foreground/60">{p.duration}min</span>
                      </div>
                    </div>

                    {editingId === p.id ? (
                      <div className="p-3 space-y-3">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="bg-background/50 border-index-blue/20 text-ink h-9 text-sm"
                          style={{ fontFamily: "var(--font-body)" }}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={editForm.duration}
                            onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                            className="bg-background/50 border-index-blue/20 text-ink h-9 text-sm flex-1"
                            min="1"
                            max="480"
                          />
                          <Input
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="bg-background/50 border-index-blue/20 text-ink h-9 text-sm flex-1"
                            placeholder="Category"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex-1 px-3 py-2 bg-index-blue/10 border border-index-blue/30 text-index-blue text-system text-[0.6rem] hover:bg-index-blue/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <Check size={12} />
                            SAVE
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 px-3 py-2 bg-seal-red/10 border border-seal-red-bright/30 text-seal-red-bright text-system text-[0.6rem] hover:bg-seal-red/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <X size={12} />
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 flex items-center justify-between group-hover:bg-index-blue/5 transition-colors">
                        <div>
                          <p className="text-display text-base font-semibold text-ink">{p.name}</p>
                          <div className="flex items-center gap-3 mt-2 text-[0.75rem]">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock size={12} />
                              <span>{p.duration} min</span>
                            </div>
                            {p.category && (
                              <div className="flex items-center gap-1 text-index-blue-dim">
                                <Tag size={12} />
                                <span>{p.category}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                          {/* Move to deck dropdown */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setMovingPrescriptId(
                                  movingPrescriptId === p.id ? null : p.id
                                )
                              }
                              className="p-2 hover:bg-index-blue/10 transition-colors"
                              title="Move to deck"
                            >
                              <GripVertical size={14} className="text-index-blue" />
                            </button>
                            {movingPrescriptId === p.id && (
                              <div className="absolute right-0 bottom-full mb-1 z-50 min-w-[160px] bg-card border border-index-blue/20 shadow-lg max-h-[240px] overflow-y-auto">
                                <div className="text-system text-[0.55rem] text-muted-foreground px-3 py-1.5 border-b border-index-blue/10 tracking-[0.1em]">
                                  MOVE TO DECK
                                </div>
                                <button
                                  onClick={() => handleMovePrescript(p.id, null)}
                                  className={`w-full text-left px-3 py-2 text-xs hover:bg-index-blue/5 transition-colors flex items-center gap-2 ${
                                    p.deckId === null ? "text-index-blue" : "text-ink"
                                  }`}
                                >
                                  <FolderOpen size={12} />
                                  Unassigned
                                </button>
                                {decks.map((deck) => (
                                  <button
                                    key={deck.id}
                                    onClick={() => handleMovePrescript(p.id, deck.id)}
                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-index-blue/5 transition-colors flex items-center gap-2 ${
                                      p.deckId === deck.id ? "text-index-blue" : "text-ink"
                                    }`}
                                  >
                                    <Folder size={12} />
                                    {deck.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => startEdit(p)}
                            className="p-2 hover:bg-index-blue/10 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} className="text-index-blue" />
                          </button>
                          <button
                            onClick={() => removePrescript(p.id)}
                            className="p-2 hover:bg-seal-red/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-seal-red-bright" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </Layout>
  );
}
