import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PrescriptProvider } from "./contexts/PrescriptContext";
import Home from "./pages/Home";
import CreatePrescript from "./pages/CreatePrescript";
import ReceivePrescript from "./pages/ReceivePrescript";
import FocusTimer from "./pages/FocusTimer";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreatePrescript} />
      <Route path="/receive" component={ReceivePrescript} />
      <Route path="/focus" component={FocusTimer} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/history" component={History} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            toastOptions={{
              style: {
                background: "oklch(0.16 0.012 270)",
                border: "1px solid oklch(0.72 0.12 75 / 0.3)",
                color: "oklch(0.88 0.005 80)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              },
            }}
          />
          <PrescriptProvider>
            <AppRouter />
          </PrescriptProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
