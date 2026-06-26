import AsyncStorage from "@react-native-async-storage/async-storage";
import { Holding, Budget } from "./models";

// Single-user local persistence. We store the editable slices as JSON.
// (Holdings, budget, assumptions — the things the user changes.)

const KEY = "finadvisor.state.v1";

export interface PersistedState {
  holdings: Holding[];
  budget: Budget;
  currentAge: number;
  annualReturnPct: number;
  inflationPct: number;
  lastNavSync?: string | null;
}

export async function loadState(): Promise<PersistedState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

export async function saveState(state: PersistedState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // best-effort; ignore write failures
  }
}
