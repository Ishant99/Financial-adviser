import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Holding, SipPlan, Goal, Budget } from "./data/models";
import { seedHoldings, seedSips, seedGoals, seedBudget } from "./data/seed";
import { loadState, saveState } from "./data/storage";
import { syncNavs } from "./lib/navSync";

interface Store {
  ready: boolean;
  holdings: Holding[];
  sips: SipPlan[];
  goals: Goal[];
  budget: Budget;
  currentAge: number;
  annualReturnPct: number;
  inflationPct: number;
  lastNavSync: string | null;
  navSyncing: boolean;
  setHoldings: (h: Holding[]) => void;
  setBudget: (b: Budget) => void;
  setAssumptions: (a: Partial<Pick<Store, "currentAge" | "annualReturnPct" | "inflationPct">>) => void;
  updateHolding: (id: string, patch: Partial<Holding>) => void;
  syncNow: () => Promise<number>;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>(seedHoldings);
  const [sips] = useState<SipPlan[]>(seedSips);
  const [goals] = useState<Goal[]>(seedGoals);
  const [budget, setBudget] = useState<Budget>(seedBudget);
  const [currentAge, setAge] = useState(28);
  const [annualReturnPct, setReturn] = useState(11);
  const [inflationPct, setInflation] = useState(6);
  const [lastNavSync, setLastNavSync] = useState<string | null>(null);
  const [navSyncing, setNavSyncing] = useState(false);
  const didAutoSync = useRef(false);

  // Load persisted state once on mount.
  useEffect(() => {
    (async () => {
      const s = await loadState();
      if (s) {
        if (s.holdings?.length) setHoldings(s.holdings);
        if (s.budget) setBudget(s.budget);
        if (typeof s.currentAge === "number") setAge(s.currentAge);
        if (typeof s.annualReturnPct === "number") setReturn(s.annualReturnPct);
        if (typeof s.inflationPct === "number") setInflation(s.inflationPct);
        if (s.lastNavSync) setLastNavSync(s.lastNavSync);
      }
      setReady(true);
    })();
  }, []);

  // Persist whenever editable state changes (after initial load).
  useEffect(() => {
    if (!ready) return;
    saveState({ holdings, budget, currentAge, annualReturnPct, inflationPct, lastNavSync });
  }, [ready, holdings, budget, currentAge, annualReturnPct, inflationPct, lastNavSync]);

  const syncNow = useMemo(
    () => async (): Promise<number> => {
      setNavSyncing(true);
      try {
        const res = await syncNavs(holdings);
        setHoldings(res.holdings);
        setLastNavSync(res.date);
        return res.updated;
      } catch {
        return 0;
      } finally {
        setNavSyncing(false);
      }
    },
    [holdings],
  );

  // Auto-refresh NAVs once per day on launch.
  useEffect(() => {
    if (!ready || didAutoSync.current) return;
    const today = new Date().toISOString().slice(0, 10);
    if (lastNavSync !== today) {
      didAutoSync.current = true;
      syncNow();
    }
  }, [ready, lastNavSync, syncNow]);

  const value = useMemo<Store>(
    () => ({
      ready,
      holdings,
      sips,
      goals,
      budget,
      currentAge,
      annualReturnPct,
      inflationPct,
      lastNavSync,
      navSyncing,
      setHoldings,
      setBudget,
      setAssumptions: (a) => {
        if (a.currentAge !== undefined) setAge(a.currentAge);
        if (a.annualReturnPct !== undefined) setReturn(a.annualReturnPct);
        if (a.inflationPct !== undefined) setInflation(a.inflationPct);
      },
      updateHolding: (id, patch) =>
        setHoldings((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h))),
      syncNow,
    }),
    [ready, holdings, sips, goals, budget, currentAge, annualReturnPct, inflationPct, lastNavSync, navSyncing, syncNow],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
