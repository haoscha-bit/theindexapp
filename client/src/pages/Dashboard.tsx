/**
 * Dashboard.tsx — Compliance Registry
 * Design: Analytics dashboard with Index blue accents
 */
import Layout from "@/components/Layout";
import DocumentCard from "@/components/DocumentCard";
import { usePrescript } from "@/contexts/PrescriptContext";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Flame, ScrollText, Award } from "lucide-react";
import { useMemo } from "react";
import { RANKS } from "@shared/ranks";

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function Dashboard() {
  const { totalCompleted, totalFailed, streak, rank, sessions, getCompletionRate, prescripts } = usePrescript();

  const currentRankInfo = useMemo(() => {
    let info = RANKS[0];
    for (const r of RANKS) {
      if (totalCompleted >= r.threshold) info = r;
    }
    return info;
  }, [totalCompleted]);

  const rankProgress = useMemo(() => {
    if (!currentRankInfo.next) return 100;
    const range = currentRankInfo.next - currentRankInfo.threshold;
    const progress = totalCompleted - currentRankInfo.threshold;
    return Math.min(100, Math.round((progress / range) * 100));
  }, [totalCompleted, currentRankInfo]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, { completed: number; failed: number }> = {};
    for (const s of sessions) {
      const cat = s.category || "Uncategorized";
      if (!map[cat]) map[cat] = { completed: 0, failed: 0 };
      if (s.status === "completed") map[cat].completed++;
      else map[cat].failed++;
    }
    return Object.entries(map)
      .map(([name, stats]) => ({ name, ...stats, total: stats.completed + stats.failed }))
      .sort((a, b) => b.total - a.total);
  }, [sessions]);

  // Recent 7 days activity
  const weekActivity = useMemo(() => {
    const days: { label: string; completed: number; failed: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      const daySessions = sessions.filter((s) => {
        const sessionDate = new Date(s.completedAt).toISOString().split("T")[0];
        return sessionDate === dateStr;
      });
      days.push({
        label: dayLabel,
        completed: daySessions.filter((s) => s.status === "completed").length,
        failed: daySessions.filter((s) => s.status === "failed").length,
      });
    }
    return days;
  }, [sessions]);

  const maxDayActivity = Math.max(1, ...weekActivity.map((d) => d.completed + d.failed));

  // Total study time
  // Total study time
  const totalMinutes = useMemo(() => {
    return sessions
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + (s.duration || 0), 0);
  }, [sessions]);

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
        {/* Page header */}
        <div className="mb-8">
          <p className="text-system text-[0.6rem] text-index-blue-dim tracking-[0.2em] mb-2">
            COMPLIANCE REGISTRY
          </p>
          <h2 className="text-display text-2xl sm:text-3xl font-bold text-ink">
            Obedience Metrics
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            A comprehensive record of your compliance with the Prescript system.
          </p>
        </div>

        {/* Primary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Prescripts Fulfilled",
              value: formatNumber(totalCompleted),
              icon: ScrollText,
              sub: `${formatNumber(totalFailed)} deviation${totalFailed !== 1 ? "s" : ""}`,

              color: "text-index-blue",
            },
            {
              label: "Compliance Rate",
              value: `${getCompletionRate()}%`,
              icon: Target,
              sub: `${formatNumber(totalCompleted + totalFailed)} total sessions`,
              color: getCompletionRate() >= 80 ? "text-index-blue" : getCompletionRate() >= 50 ? "text-index-blue-dim" : "text-seal-red-bright",
            },
            {
              label: "Consecutive Compliance",
              value: `${streak}`,
              icon: Flame,
              sub: streak > 0 ? "days active" : "no active streak",
              color: streak > 0 ? "text-index-blue" : "text-muted-foreground",
            },
            {
              label: "Total Study Time",
              value: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
              icon: TrendingUp,
              sub: `across ${formatNumber(totalCompleted)} sessions`,
              color: "text-index-cyan",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <div className="document-border bg-card/60 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-system text-[0.5rem] text-muted-foreground">
                      {stat.label}
                    </span>
                    <Icon size={14} className="text-index-blue-dim" />
                  </div>
                  <div className={`text-display text-2xl font-semibold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <p className="text-[0.6rem] text-muted-foreground/60 mt-1" style={{ fontFamily: "var(--font-body)", textTransform: "none", letterSpacing: "normal" }}>
                    {stat.sub}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Rank progression */}
          <DocumentCard classification="RANK PROGRESSION" priority="standard" delay={0.3}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 flex items-center justify-center border border-index-blue/20 bg-index-blue/5">
                <Award size={24} className="text-index-blue" />
              </div>
              <div>
                <p className="text-display text-xl font-semibold text-index-blue">{rank}</p>
                <p className="text-[0.65rem] text-muted-foreground">
                  {currentRankInfo.next
                    ? `${formatNumber(totalCompleted)} / ${formatNumber(currentRankInfo.next)} — ${formatNumber(currentRankInfo.next - totalCompleted)} more to next rank`
                    : `${formatNumber(totalCompleted)} completed — Maximum rank achieved`}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-1.5 bg-background/50 border border-index-blue/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-index-blue-dim to-index-blue"
                  initial={{ width: 0 }}
                  animate={{ width: `${rankProgress}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[0.5rem] text-muted-foreground/50" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatNumber(currentRankInfo.threshold)}
                </span>
                <span className="text-[0.5rem] text-index-blue-dim" style={{ fontFamily: "var(--font-mono)" }}>
                  {rankProgress}%
                </span>
                <span className="text-[0.5rem] text-muted-foreground/50" style={{ fontFamily: "var(--font-mono)" }}>
                  {currentRankInfo.next || "MAX"}
                </span>
              </div>
            </div>

            {/* Rank ladder */}
            <div className="space-y-1 mt-4">
              {RANKS.map((r) => (
                <div
                  key={r.title}
                  className={`flex items-center justify-between py-1 px-2 text-[0.6rem] ${
                    r.title === rank
                      ? "bg-index-blue/10 border-l-2 border-index-blue text-index-blue"
                      : totalCompleted >= r.threshold
                      ? "text-muted-foreground"
                      : "text-muted-foreground/30"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span>{r.title.toUpperCase()}</span>
                  <span>{r.threshold}+</span>
                </div>
              ))}
            </div>
          </DocumentCard>

          {/* 7-day activity */}
          <DocumentCard classification="WEEKLY ACTIVITY" priority="standard" delay={0.4}>
            <div className="space-y-3">
              {weekActivity.map((day, i) => {
                const total = day.completed + day.failed;
                const barWidth = total > 0 ? (total / maxDayActivity) * 100 : 0;
                return (
                  <div key={`${day.label}-${i}`} className="flex items-center gap-3">
                    <span className="text-[0.6rem] text-muted-foreground w-8 text-right" style={{ fontFamily: "var(--font-mono)" }}>
                      {day.label}
                    </span>
                    <div className="flex-1 h-5 bg-background/30 border border-border/50 relative overflow-hidden">
                      {day.completed > 0 && (
                        <motion.div
                          className="absolute top-0 left-0 h-full bg-index-blue/30"
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.completed / maxDayActivity) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.5 + i * 0.05 }}
                        />
                      )}
                      {day.failed > 0 && (
                        <motion.div
                          className="absolute top-0 h-full bg-seal-red/30"
                          style={{ left: `${(day.completed / maxDayActivity) * 100}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.failed / maxDayActivity) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.6 + i * 0.05 }}
                        />
                      )}
                    </div>
                    <span className="text-[0.55rem] text-muted-foreground/60 w-6 text-right" style={{ fontFamily: "var(--font-mono)" }}>
                      {total}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-index-blue/30 border border-index-blue/20" />
                <span className="text-[0.55rem] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>COMPLETED</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-seal-red/30 border border-seal-red/20" />
                <span className="text-[0.55rem] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>DEVIATION</span>
              </div>
            </div>
          </DocumentCard>
        </div>

        {/* Category breakdown */}
        {categoryStats.length > 0 && (
          <DocumentCard classification="CATEGORY ANALYSIS" priority="standard" delay={0.5}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-index-blue/10">
                    <th className="text-left py-2 text-system text-[0.55rem] text-index-blue-dim font-normal">Subject</th>
                    <th className="text-right py-2 text-system text-[0.55rem] text-index-blue-dim font-normal">Completed</th>
                    <th className="text-right py-2 text-system text-[0.55rem] text-index-blue-dim font-normal">Deviations</th>
                    <th className="text-right py-2 text-system text-[0.55rem] text-index-blue-dim font-normal">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStats.map((cat) => {
                    const rate = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
                    return (
                      <tr key={cat.name} className="border-b border-border/20">
                        <td className="py-2.5 text-ink text-display font-medium">{cat.name}</td>
                        <td className="py-2.5 text-right text-index-blue-dim" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                          {cat.completed}
                        </td>
                        <td className="py-2.5 text-right text-seal-red-bright/70" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                          {cat.failed}
                        </td>
                        <td className={`py-2.5 text-right ${rate >= 80 ? "text-index-blue" : rate >= 50 ? "text-index-blue-dim" : "text-seal-red-bright"}`} style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                          {rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DocumentCard>
        )}

        {/* Empty state */}
        {sessions.length === 0 && (
          <DocumentCard classification="NOTICE" priority="standard" delay={0.3}>
            <div className="text-center py-10">
              <TrendingDown size={32} className="mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-display text-lg text-ink mb-2">No Records Filed</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Complete your first Prescript session to begin building your compliance record.
                The system tracks all activity.
              </p>
            </div>
          </DocumentCard>
        )}
      </div>
    </Layout>
  );
}
