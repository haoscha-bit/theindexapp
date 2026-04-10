/**
 * History.tsx — Session Archives
 * Design: Filing cabinet of past session documents, Index blue accents
 */
import Layout from "@/components/Layout";
import DocumentCard from "@/components/DocumentCard";
import { usePrescript } from "@/contexts/PrescriptContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Archive, Check, X, Clock, Tag, Filter } from "lucide-react";

type FilterType = "all" | "completed" | "failed";

export default function History() {
  const { sessions } = usePrescript();
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredSessions = useMemo(() => {
    if (filter === "all") return sessions;
    return sessions.filter((s) => s.status === filter);
  }, [sessions, filter]);

  // Group by date
  const groupedSessions = useMemo(() => {
    const groups: Record<string, typeof sessions> = {};
    for (const s of filteredSessions) {
      const date = new Date(s.completedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(s);
    }
    return Object.entries(groups);
  }, [filteredSessions]);

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        {/* Page header */}
        <div className="mb-6">
          <p className="text-system text-[0.6rem] text-index-blue-dim tracking-[0.2em] mb-2">
            SESSION ARCHIVES
          </p>
          <h2 className="text-display text-2xl sm:text-3xl font-bold text-ink">
            Filed Records
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            A chronological record of all Prescript sessions — fulfilled and deviated.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-6">
          <Filter size={14} className="text-index-blue-dim" />
          {(["all", "completed", "failed"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-3 py-1.5 text-system text-[0.6rem] border transition-all duration-200
                ${
                  filter === f
                    ? "border-index-blue/40 bg-index-blue/10 text-index-blue"
                    : "border-border bg-transparent text-muted-foreground hover:border-index-blue/20"
                }
              `}
            >
              {f === "all" ? "All Records" : f === "completed" ? "Fulfilled" : "Deviations"}
            </button>
          ))}
          <span className="text-[0.6rem] text-muted-foreground/50 ml-auto" style={{ fontFamily: "var(--font-mono)" }}>
            {filteredSessions.length} record{filteredSessions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Empty state */}
        {sessions.length === 0 && (
          <DocumentCard classification="NOTICE" priority="standard">
            <div className="text-center py-12">
              <Archive size={36} className="mx-auto mb-4 text-muted-foreground/20" />
              <p className="text-display text-lg text-ink mb-2">Archives Empty</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No sessions have been recorded. Complete or abandon a Prescript
                to create your first archive entry.
              </p>
            </div>
          </DocumentCard>
        )}

        {/* Session groups */}
        <div className="space-y-6">
          {groupedSessions.map(([date, daySessions], gi) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-index-blue/10" />
                <span className="text-system text-[0.55rem] text-index-blue-dim tracking-[0.15em]">
                  {date.toUpperCase()}
                </span>
                <div className="h-px flex-1 bg-index-blue/10" />
              </div>

              {/* Session entries */}
              <div className="space-y-2">
                <AnimatePresence>
                  {daySessions.map((session, i) => {
                    const time = new Date(session.completedAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const isCompleted = session.status === "completed";

                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ delay: gi * 0.1 + i * 0.03, duration: 0.3 }}
                      >
                        <div className={`document-border bg-card/40 ${!isCompleted ? "border-seal-red/20" : ""}`}>
                          <div className="classification-bar flex items-center justify-between">
                            <span>
                              RECORD // {time} //{" "}
                              <span className={isCompleted ? "text-index-blue-dim" : "text-seal-red-bright"}>
                                {isCompleted ? "FULFILLED" : "DEVIATION"}
                              </span>
                            </span>
                            <span className="text-muted-foreground/40">
                              {session.duration ?? "?"}min
                            </span>
                          </div>
                          <div className="p-3 flex items-center gap-3">
                            <div className={`w-8 h-8 flex items-center justify-center border ${
                              isCompleted
                                ? "border-index-blue/20 bg-index-blue/5"
                                : "border-seal-red/20 bg-seal-red/5"
                            }`}>
                              {isCompleted ? (
                                <Check size={14} className="text-index-blue" />
                              ) : (
                                <X size={14} className="text-seal-red-bright" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-display text-sm font-medium text-ink truncate">
                                {session.prescriptName || "Unknown Prescript"}
                              </p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-[0.6rem] text-muted-foreground flex items-center gap-1">
                                  <Clock size={9} /> {session.duration ?? "?"} min
                                </span>
                                {session.category && (
                                  <span className="text-[0.6rem] text-index-blue-dim flex items-center gap-1">
                                    <Tag size={9} /> {session.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

        {/* Filtered empty */}
        {sessions.length > 0 && filteredSessions.length === 0 && (
          <DocumentCard classification="NOTICE" priority="standard">
            <p className="text-center text-muted-foreground py-8 text-sm">
              No records match the current filter.
            </p>
          </DocumentCard>
        )}
      </div>
    </Layout>
  );
}
