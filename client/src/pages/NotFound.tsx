/**
 * NotFound.tsx — 404 page styled as a missing/classified document
 * Design: Index blue accents
 */
import { useLocation } from "wouter";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="document-border bg-card/80 max-w-md w-full">
        <div className="classification-bar">
          ERROR // <span className="text-seal-red-bright">DOCUMENT NOT FOUND</span>
        </div>
        <div className="p-8 text-center">
          <AlertTriangle size={40} className="mx-auto mb-6 text-seal-red-bright/60" />
          <h1 className="text-display text-4xl font-bold text-ink mb-2">404</h1>
          <p className="text-system text-[0.65rem] text-seal-red-bright tracking-[0.2em] mb-4">
            CLASSIFIED OR NONEXISTENT
          </p>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            The requested document does not exist within the Index archives,
            or your clearance level is insufficient to access it.
          </p>
          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-index-blue/10 border border-index-blue/30 text-index-blue text-system text-[0.65rem] tracking-[0.15em] hover:bg-index-blue/20 transition-all duration-200"
          >
            <ArrowLeft size={14} />
            Return to Sanctum
          </button>
        </div>
      </div>
    </div>
  );
}
