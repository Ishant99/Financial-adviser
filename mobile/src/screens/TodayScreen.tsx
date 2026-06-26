import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";
import { formatCompact, formatCurrency } from "../lib/format";
import { buildTodayView } from "../lib/dashboard";
import { milestoneState } from "../lib/milestones";
import { useStore } from "../store";
import { CountUp } from "../components/CountUp";
import { Card, Eyebrow, H1, Section } from "../components/ui";

export default function TodayScreen() {
  const { holdings, sips, goals, budget, currentAge, annualReturnPct, inflationPct, navSyncing, lastNavSync } =
    useStore();
  const view = useMemo(
    () =>
      buildTodayView(holdings, sips, goals, budget, {
        currentAge,
        annualReturnPct,
        inflationPct,
      }),
    [holdings, sips, goals, budget, currentAge, annualReturnPct, inflationPct],
  );
  const up = view.gain >= 0;
  const ms = milestoneState(view.netWorth);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Eyebrow>TODAY</Eyebrow>
      <H1>Here's your money</H1>

      <Card>
        <Text style={styles.label}>
          Net worth {navSyncing ? "· refreshing…" : lastNavSync ? `· ${lastNavSync}` : ""}
        </Text>
        <CountUp value={view.netWorth} style={styles.hero} />
        <Text style={[styles.change, { color: up ? theme.green : theme.red }]}>
          {up ? "▲" : "▼"} {formatCurrency(Math.abs(view.gain))} ({view.gainPct.toFixed(2)}%)
        </Text>
        <View style={styles.ringTrack}>
          <View style={[styles.ringFill, { width: `${Math.min(100, view.pctToFire)}%` }]} />
        </View>
        <Text style={styles.ringLabel}>{view.pctToFire.toFixed(1)}% to financial freedom</Text>
      </Card>

      <Card>
        <Text style={styles.label}>Milestone</Text>
        <Text style={styles.milestone}>{ms.label}</Text>
        {ms.next && (
          <View style={styles.ringTrack}>
            <View style={[styles.ringFill, { width: `${ms.pctToNext}%`, backgroundColor: theme.green }]} />
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.label}>Your future</Text>
        {view.fire.fireYear ? (
          <Text style={styles.fire}>
            Financial independence by <Text style={styles.accent}>{view.fire.fireYear}</Text>
            {view.fire.fireAge ? `, age ${view.fire.fireAge}` : ""} 🎯
          </Text>
        ) : (
          <Text style={styles.fire}>Raise your surplus to bring your FIRE date into view.</Text>
        )}
        <Text style={styles.sub}>
          FIRE number ≈ {formatCompact(view.fire.fireNumber)} · surplus{" "}
          {formatCurrency(view.monthlySurplus)}/mo ({view.savingsRatePct.toFixed(0)}% saved)
        </Text>
      </Card>

      <Section>Do this next</Section>
      {view.moves.map((m, i) => (
        <Card key={i}>
          <Text style={styles.moveTitle}>{m.title}</Text>
          <Text style={styles.moveDetail}>{m.detail}</Text>
        </Card>
      ))}
      {view.unknownTaxCount > 0 && (
        <Card>
          <Text style={styles.moveTitle}>⚠️ {view.unknownTaxCount} holdings need a purchase date</Text>
          <Text style={styles.moveDetail}>
            Set buy dates (Portfolio tab) so LTCG/STCG tax and harvesting advice become accurate.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 40 },
  label: { color: theme.textDim, fontSize: 13 },
  hero: { color: theme.text, fontSize: 38, fontWeight: "800", marginTop: 4 },
  change: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  ringTrack: { height: 10, borderRadius: 6, backgroundColor: theme.surfaceStrong, overflow: "hidden", marginTop: 18 },
  ringFill: { height: 10, borderRadius: 6, backgroundColor: theme.indigo },
  ringLabel: { color: theme.textDim, fontSize: 12, marginTop: 8 },
  milestone: { color: theme.text, fontSize: 16, fontWeight: "700", marginTop: 2, marginBottom: 10 },
  fire: { color: theme.text, fontSize: 18, fontWeight: "700", lineHeight: 26 },
  accent: { color: theme.indigo },
  sub: { color: theme.textFaint, fontSize: 12, marginTop: 10, lineHeight: 18 },
  moveTitle: { color: theme.text, fontSize: 15, fontWeight: "700" },
  moveDetail: { color: theme.textDim, fontSize: 13, marginTop: 6, lineHeight: 19 },
});
