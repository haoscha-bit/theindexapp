/**
 * Rank system for The Index Prescript Study App
 * 5 main tiers, each with 3 subranks (I, II, III)
 * Total: 15 ranks + "Uninitialized" for 0 completions
 */

export interface RankInfo {
  threshold: number;
  title: string;
  next: number | null;
}

export const RANKS: RankInfo[] = [
  { threshold: 0, title: "Proselyte I", next: 50 },
  { threshold: 50, title: "Proselyte II", next: 100 },
  { threshold: 100, title: "Proselyte III", next: 200 },
  { threshold: 200, title: "Sighted Proselyte I", next: 250 },
  { threshold: 250, title: "Sighted Proselyte II", next: 300 },
  { threshold: 300, title: "Sighted Proselyte III", next: 400 },
  { threshold: 400, title: "Proxy I", next: 450 },
  { threshold: 450, title: "Proxy II", next: 500 },
  { threshold: 500, title: "Proxy III", next: 600 },
  { threshold: 600, title: "Messenger I", next: 650 },
  { threshold: 650, title: "Messenger II", next: 700 },
  { threshold: 700, title: "Messenger III", next: 800 },
  { threshold: 800, title: "Weaver I", next: 900 },
  { threshold: 900, title: "Weaver II", next: 1000 },
  { threshold: 1000, title: "Weaver III", next: null },
];

/**
 * Get the rank title for a given number of completed prescripts.
 * Returns "Uninitialized" for 0 completions.
 */
export function getRank(completed: number): string {
  if (completed === 0) return "Uninitialized";
  // Walk backwards through ranks to find the highest matching threshold
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (completed >= RANKS[i].threshold) {
      return RANKS[i].title;
    }
  }
  return "Proselyte I";
}

/**
 * Get the full rank info for a given number of completed prescripts.
 */
export function getRankInfo(completed: number): RankInfo {
  let info = RANKS[0];
  for (const r of RANKS) {
    if (completed >= r.threshold) info = r;
  }
  return info;
}
