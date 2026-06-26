import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";
import { formatCurrency } from "../lib/format";
import { holdingCurrentValue } from "../data/models";
import {
  computeTaxSummary,
  ltcgHarvestingMove,
  stcgTimingMoves,
  section80cMove,
  TaxMove,
} from "../lib/finance/tax";
import { useStore } from "../store";
import { Card, Eyebrow, H1, Section } from "../components/ui";

export default function OptimizeScreen() {
  const { holdings, sips } = useStore();

  const { taxSummary, moves, concentration, sec80cInvested } = useMemo(() => {
    const taxHoldings = holdings.map((h) => ({
      name: h.name,
      units: h.units,
      purchaseNav: h.purchaseNav,
      currentNav: h.currentNav,
      holdingType: h.holdingType,
      purchaseDate: h.purchaseDate,
    }));
    const taxSummary = computeTaxSummary(taxHoldings);

    // 80C from ELSS/PPF SIPs this FY (approx: monthly * 12, capped later)
    const sec80cInvested = sips
      .filter((s) => /elss|tax saver|ppf/i.test(s.fundName))
      .reduce((sum, s) => sum + s.monthlyAmount * 12, 0);

    const moves: TaxMove[] = [];
    const h = ltcgHarvestingMove(taxSummary);
    if (h) moves.push(h);
    moves.push(...stcgTimingMoves(taxHoldings));
    const s = section80cMove(sec80cInvested);
    if (s) moves.push(s);

    // Concentration (returns risk)
    const total = holdings.reduce((acc, x) => acc + holdingCurrentValue(x), 0);
    const concentration = holdings
      .map((x) => ({ name: x.name, pct: total > 0 ? (holdingCurrentValue(x) / total) * 100 : 0 }))
      .filter((x) => x.pct >= 25)
      .sort((a, b) => b.pct - a.pct);

    return { taxSummary, moves, concentration, sec80cInvested };
  }, [holdings, sips]);

  const totalTax = taxSummary.estimatedLtcgTax + taxSummary.estimatedStcgTax;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Eyebrow>OPTIMIZE</Eyebrow>
      <H1>Taxes & returns</H1>

      <Card>
        <Text style={styles.label}>Estimated capital-gains tax · {taxSummary.financialYear}</Text>
        <Text style={styles.big}>{formatCurrency(totalTax)}</Text>
        <Text style={styles.sub}>
          LTCG {formatCurrency(taxSummary.ltcgGains)} · STCG {formatCurrency(taxSummary.stcgGains)}
          {taxSummary.unknownCount > 0 ? ` · ${taxSummary.unknownCount} unknown (excluded)` : ""}
        </Text>
      </Card>

      <Section>Tax moves</Section>
      {moves.length === 0 && (
        <Card>
          <Text style={styles.moveDetail}>
            No tax moves right now. Set purchase dates on holdings to unlock harvesting & timing advice.
          </Text>
        </Card>
      )}
      {moves.map((m, i) => (
        <Card key={i}>
          <Text style={styles.moveTitle}>{m.title}</Text>
          <Text style={styles.moveDetail}>{m.detail}</Text>
        </Card>
      ))}

      <Section>Returns & risk</Section>
      {concentration.length > 0 ? (
        concentration.map((c) => (
          <Card key={c.name}>
            <Text style={styles.moveTitle}>Concentration risk</Text>
            <Text style={styles.moveDetail}>
              {c.name} is {c.pct.toFixed(0)}% of your portfolio. Consider trimming below 25% to reduce
              single-fund risk.
            </Text>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={styles.moveDetail}>
            No single holding exceeds 25% — diversification looks healthy. (Benchmark XIRR comparison
            unlocks once SIP history is added.)
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 40 },
  label: { color: theme.textDim, fontSize: 13 },
  big: { color: theme.amber, fontSize: 30, fontWeight: "800", marginTop: 4 },
  sub: { color: theme.textFaint, fontSize: 12, marginTop: 8, lineHeight: 18 },
  moveTitle: { color: theme.text, fontSize: 15, fontWeight: "700" },
  moveDetail: { color: theme.textDim, fontSize: 13, marginTop: 6, lineHeight: 19 },
});
