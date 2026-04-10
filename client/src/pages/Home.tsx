/**
 * Home.tsx — The Sanctum (Main Chamber)
 * Design: Clean dark layout with Index logo and blue accents
 */
import Layout from "@/components/Layout";
import DocumentCard from "@/components/DocumentCard";
import { usePrescript } from "@/contexts/PrescriptContext";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { FilePlus, BarChart3, Archive, ChevronRight } from "lucide-react";
import { playDice, playMenuClick } from "@/hooks/useSoundEffects";

const BEEPER_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663528861189/RhtPG9LggTLTG7ANMWXNdF/the-prescript-beeper-code-v0-9tynecxzlqmg1-removebg-preview_9e06d390.png";

const INDEX_LOGO = "/assets/The_Index_Logo.webp";

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function Home() {
  // The userAuth hooks provides authentication state
  const { prescripts, totalCompleted, streak, rank, getCompletionRate, activePrescript } = usePrescript();

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section — Clean with logo */}
        <div className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-index-blue/10">
          <div className="max-w-3xl flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="shrink-0"
            >
              <img
                src={INDEX_LOGO}
                alt="The Index"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                style={{ filter: "drop-shadow(0 0 20px oklch(0.68 0.16 240 / 0.3))" }}
              />
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            >
              <p className="text-system text-[0.6rem] text-index-blue-dim mb-3 tracking-[0.2em]">
                THE INDEX // PRESCRIPT SYSTEM // ACTIVE
              </p>
              <h1 className="text-display text-3xl sm:text-4xl font-bold text-ink leading-tight mb-3">
                The Prescript Always Guides Us<br />
                <span className="text-index-blue blue-glow">To the Righteous Path.</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                You are no longer choosing tasks. You are following instructions.
                The system removes the burden of choice and replaces it with
                structure, compliance, and purpose.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
          {/* Status overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Prescripts Fulfilled", value: formatNumber(totalCompleted), accent: false },
              { label: "Consecutive Compliance", value: `${streak} days`, accent: false },
              { label: "Compliance Rate", value: `${getCompletionRate()}%`, accent: false },
              { label: "Current Rank", value: rank, accent: true },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="document-border bg-card/60 p-3"
              >
                <div className="text-system text-[0.5rem] text-muted-foreground mb-1.5">
                  {stat.label}
                </div>
                <div className={`text-display font-semibold ${stat.accent ? "text-index-blue text-sm sm:text-base" : "text-ink text-xl"}`}>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Active Prescript notice */}
          {activePrescript && (
            <DocumentCard
              classification="ACTIVE SESSION"
              priority="critical"
              className="mb-6"
              delay={0.3}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-system text-[0.6rem] text-seal-red-bright mb-1">
                    Prescript in progress
                  </p>
                  <p className="text-display text-lg font-semibold text-ink">
                    {activePrescript.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activePrescript.duration} minutes — {activePrescript.category || "Uncategorized"}
                  </p>
                </div>
                <Link href="/focus" onClick={playMenuClick}>
                  <div className="flex items-center gap-2 px-4 py-2 bg-seal-red/20 border border-seal-red-bright/30 text-seal-red-bright text-system text-[0.65rem] hover:bg-seal-red/30 transition-colors">
                    Resume <ChevronRight size={14} />
                  </div>
                </Link>
              </div>
            </DocumentCard>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prescripts.length === 0 ? (
              <DocumentCard
                classification="DIRECTIVE"
                priority="elevated"
                className="sm:col-span-2"
                delay={0.4}
              >
                <div className="text-center py-6">
                  <p className="text-display text-xl font-semibold text-ink mb-2">
                    No Prescripts Have Been Inscribed
                  </p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Before the system can issue directives, you must first inscribe
                    your tasks into the Prescript pool. Each task becomes a potential
                    assignment.
                  </p>
                  <Link href="/create">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-index-blue/10 border border-index-blue/30 text-index-blue text-system text-[0.7rem] hover:bg-index-blue/20 transition-all duration-200 animate-pulse-blue">
                      <FilePlus size={16} />
                      Begin Inscription
                    </div>
                  </Link>
                </div>
              </DocumentCard>
            ) : (
              <>
                <Link href="/receive" onClick={playDice}>
                  <DocumentCard
                    classification="ACTION"
                    priority="standard"
                    delay={0.4}
                  >
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 flex items-center justify-center border border-index-blue/20 bg-index-blue/5">
                        <img src={BEEPER_ICON} alt="Prescript Beeper" className="w-6 h-6 object-contain" style={{ filter: "drop-shadow(0 0 4px oklch(0.68 0.16 240 / 0.3))" }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-display text-lg font-semibold text-ink group-hover:text-index-blue transition-colors">
                          Receive Prescript
                        </p>
                        <p className="text-[0.75rem] text-muted-foreground">
                          The system will assign your next directive
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-index-blue/30 group-hover:text-index-blue transition-colors" />
                    </div>
                  </DocumentCard>
                </Link>
                <Link href="/create" onClick={playDice}>
                  <DocumentCard
                    classification="ACTION"
                    priority="standard"
                    delay={0.5}
                  >
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 flex items-center justify-center border border-index-blue/20 bg-index-blue/5">
                        <FilePlus size={22} className="text-index-blue" />
                      </div>
                      <div className="flex-1">
                        <p className="text-display text-lg font-semibold text-ink group-hover:text-index-blue transition-colors">
                          Inscribe Prescripts
                        </p>
                        <p className="text-[0.75rem] text-muted-foreground">
                          Add tasks to the assignment pool ({prescripts.length} active)
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-index-blue/30 group-hover:text-index-blue transition-colors" />
                    </div>
                  </DocumentCard>
                </Link>

                <Link href="/dashboard" onClick={playDice}>
                  <DocumentCard
                    classification="ACTION"
                    priority="standard"
                    delay={0.6}
                  >
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 flex items-center justify-center border border-index-blue/20 bg-index-blue/5">
                        <BarChart3 size={22} className="text-index-blue" />
                      </div>
                      <div className="flex-1">
                        <p className="text-display text-lg font-semibold text-ink group-hover:text-index-blue transition-colors">
                          Compliance Registry
                        </p>
                        <p className="text-[0.75rem] text-muted-foreground">
                          Review your obedience metrics
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-index-blue/30 group-hover:text-index-blue transition-colors" />
                    </div>
                  </DocumentCard>
                </Link>

                <Link href="/history" onClick={playDice}>
                  <DocumentCard
                    classification="ACTION"
                    priority="standard"
                    delay={0.7}
                  >
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 flex items-center justify-center border border-index-blue/20 bg-index-blue/5">
                        <Archive size={22} className="text-index-blue" />
                      </div>
                      <div className="flex-1">
                        <p className="text-display text-lg font-semibold text-ink group-hover:text-index-blue transition-colors">
                          Session Archives
                        </p>
                        <p className="text-[0.75rem] text-muted-foreground">
                          Filed records of past sessions
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-index-blue/30 group-hover:text-index-blue transition-colors" />
                    </div>
                  </DocumentCard>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
