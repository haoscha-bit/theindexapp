/**
 * DocumentCard.tsx — Reusable "classified document" card component
 * Design: Dark bordered card with classification header bar, Index blue accents
 */
import { motion } from "framer-motion";

interface DocumentCardProps {
  classification?: string;
  priority?: "standard" | "elevated" | "critical";
  date?: string;
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
}

const priorityColors: Record<string, string> = {
  standard: "text-index-blue-dim",
  elevated: "text-index-blue",
  critical: "text-seal-red-bright",
};

export default function DocumentCard({
  classification = "DOCUMENT",
  priority = "standard",
  date,
  children,
  className = "",
  animate = true,
  delay = 0,
}: DocumentCardProps) {
  const displayDate = date || new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase();

  const content = (
    <div className={`document-border bg-card/80 backdrop-blur-sm ${className}`}>
      {/* Classification bar */}
      <div className="classification-bar flex items-center justify-between">
        <span>
          {classification} // <span className={priorityColors[priority]}>PRIORITY: {priority.toUpperCase()}</span>
        </span>
        <span className="text-muted-foreground/60">{displayDate}</span>
      </div>
      {/* Content */}
      <div className="p-4 sm:p-5">
        {children}
      </div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {content}
    </motion.div>
  );
}
