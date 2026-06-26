import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";
import { formatCompact } from "../lib/format";
import { holdingCurrentValue } from "../data/models";
import { projectNetWorth } from "../lib/finance/projection";
import { useStore } from "../store";
import { Card, Eyebrow, H1, Section, Stepper } from "../components/ui";

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <View style={styles.spark}>
      {values.map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: `${Math.max(2, (v / max) * 100)}%`,
            backgroundColor: theme.indigo,
            marginHorizontal: 1,
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
            opacity: 0.5 + (0.5 * i) / values.length,
          }}
        />
      ))}
    </View>
  );
}

export default function FutureScreen() {
  const { holdings, budget, currentAge, annualReturnPct, inflationPct } = useStore();
  const netWorth = useMemo(() => holdings.reduce((s, h) => s + holdingCurrentValue(h), 0), [holdings]);
  const expenses = budget.buckets.reduce((s, b) => s + b.amount, 0);
  const baseSurplus = budget.monthlyIncome - expenses;

  // What-if overrides (local, non-destructive)
  const [extraSip, setExtraSip] = useState(0);
  const [retireAge, setRetireAge] = useState(60);
  const [returnPct, setReturnPct] = useState(annualReturnPct);

  const result = useMemo(
    () =>
      projectNetWorth({
        currentNetWorth: netWorth,
        monthlySurplus: baseSurplus,
        monthlySip: extraSip,
        annualReturnPct: returnPct,
        inflationPct,
        currentAge,
        annualExpenses: expenses * 12,
        years: Math.max(5, retireAge - currentAge + 5),
      }),
    [netWorth, baseSurplus, extraSip, returnPct, inflationPct, currentAge, expenses, retireAge],
  );

  const realSeries = result.points.filter((_, i) => i % 2 === 0).map((p) => p.real);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Eyebrow>FUTURE</Eyebrow>
      <H1>Steer your future</H1>

      <Card>
        {result.fireYear ? (
          <Text style={styles.fire}>
            Financial independence by <Text style={styles.accent}>{result.fireYear}</Text>
            {result.fireAge ? `, age ${result.fireAge}` : ""}
          </Text>
        ) : (
          <Text style={styles.fire}>Not reaching FIRE in this horizon — try the sliders below.</Text>
        )}
        <Text style={styles.sub}>
          FIRE number ≈ {formatCompact(result.fireNumber)} · projected (real) at horizon ≈{" "}
          {formatCompact(result.points[result.points.length - 1].real)}
        </Text>
        <Sparkline values={realSeries} />
        <Text style={styles.axis}>
          {result.points[0].year} → {result.points[result.points.length - 1].year} (inflation-adjusted)
        </Text>
      </Card>

      <Section>What if…</Section>
      <Card>
        <Stepper
          label="Extra SIP / month"
          value={`₹${extraSip.toLocaleString("en-IN")}`}
          onDec={() => setExtraSip((v) => Math.max(0, v - 2500))}
          onInc={() => setExtraSip((v) => v + 2500)}
        />
        <Stepper
          label="Retire at age"
          value={`${retireAge}`}
          onDec={() => setRetireAge((v) => Math.max(currentAge + 1, v - 1))}
          onInc={() => setRetireAge((v) => Math.min(75, v + 1))}
        />
        <Stepper
          label="Expected return"
          value={`${returnPct}%`}
          onDec={() => setReturnPct((v) => Math.max(4, v - 1))}
          onInc={() => setReturnPct((v) => Math.min(18, v + 1))}
        />
      </Card>
      <Text style={styles.hint}>
        Drag the numbers and watch your FIRE date move. Adding ₹{(2500).toLocaleString("en-IN")}+/mo or
        switching to direct funds (+1% return) usually pulls it years closer.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 40 },
  fire: { color: theme.text, fontSize: 18, fontWeight: "700", lineHeight: 26 },
  accent: { color: theme.indigo },
  sub: { color: theme.textFaint, fontSize: 12, marginTop: 10, lineHeight: 18 },
  spark: { flexDirection: "row", alignItems: "flex-end", height: 90, marginTop: 16 },
  axis: { color: theme.textFaint, fontSize: 11, marginTop: 6 },
  hint: { color: theme.textFaint, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
