import { Holding } from "../data/models";

// Free AMFI daily NAV feed. Plain-text, semicolon-delimited:
// Scheme Code;ISIN Div Payout;ISIN Div Reinvest;Scheme Name;Net Asset Value;Date
const AMFI_URL = "https://www.amfiindia.com/spages/NAVAll.txt";

interface NavRow {
  schemeCode: string;
  isins: string[];
  schemeName: string;
  nav: number;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/direct|regular|plan|growth|idcw|payout|reinvest|-|fund/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchNavTable(): Promise<NavRow[]> {
  const res = await fetch(AMFI_URL);
  const text = await res.text();
  const rows: NavRow[] = [];
  for (const line of text.split("\n")) {
    const parts = line.split(";");
    if (parts.length < 6) continue;
    const nav = parseFloat(parts[4]);
    if (Number.isNaN(nav)) continue;
    rows.push({
      schemeCode: parts[0].trim(),
      isins: [parts[1].trim(), parts[2].trim()].filter((x) => x && x !== "-"),
      schemeName: parts[3].trim(),
      nav,
    });
  }
  return rows;
}

export interface NavSyncResult {
  holdings: Holding[];
  updated: number;
  date: string;
}

/**
 * Update mutual-fund holdings' currentNav from the AMFI feed.
 * Matches by ISIN first, then by normalized scheme-name contains.
 * Stocks / non-MF assets are left untouched (no free official MF feed for them).
 */
export async function syncNavs(holdings: Holding[]): Promise<NavSyncResult> {
  const table = await fetchNavTable();
  const byIsin = new Map<string, NavRow>();
  for (const r of table) for (const isin of r.isins) byIsin.set(isin, r);

  let updated = 0;
  const next = holdings.map((h) => {
    if (h.holdingType !== "MutualFund") return h;

    let match: NavRow | undefined;
    if (h.isin) match = byIsin.get(h.isin);
    if (!match) {
      const target = normalize(h.name);
      match = table.find((r) => {
        const n = normalize(r.schemeName);
        return n.includes(target) || target.includes(n);
      });
    }
    if (match && match.nav > 0 && match.nav !== h.currentNav) {
      updated++;
      return { ...h, currentNav: match.nav };
    }
    return h;
  });

  return { holdings: next, updated, date: new Date().toISOString().slice(0, 10) };
}
