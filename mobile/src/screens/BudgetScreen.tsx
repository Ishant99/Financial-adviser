import React from "react";
import { ScrollView, StyleSheet, Text, View, TextInput } from "react-native";
import { theme } from "../theme";
import { formatCurrency } from "../lib/format";
import { useStore } from "../store";
import { Card, Eyebrow, H1, Section } from "../components/ui";

function MoneyInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <TextInput
      style={styles.input}
      keyboardType="numeric"
      value={value ? String(value) : ""}
      placeholder="0"
      placeholderTextColor={theme.textFaint}
      onChangeText={(t) => onChange(Number(t.replace(/[^0-9]/g, "")) || 0)}
    />
  );
}

export default function BudgetScreen() {
  const { budget, setBudget } = useStore();
  const expenses = budget.buckets.reduce((s, b) => s + b.amount, 0);
  const surplus = budget.monthlyIncome - expenses;
  const savingsRate = budget.monthlyIncome > 0 ? (surplus / budget.monthlyIncome) * 100 : 0;

  const setIncome = (n: number) => setBudget({ ...budget, monthlyIncome: n });
  const setBucket = (i: number, n: number) =>
    setBudget({ ...budget, buckets: budget.buckets.map((b, j) => (j === i ? { ...b, amount: n } : b)) });

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Eyebrow>BUDGET</Eyebrow>
      <H1>Income & spending</H1>

      <Card>
        <View style={styles.row}>
          <Text style={styles.label}>Monthly income</Text>
          <MoneyInput value={budget.monthlyIncome} onChange={setIncome} />
        </View>
      </Card>

      <Section>Monthly expenses</Section>
      <Card>
        {budget.buckets.map((b, i) => (
          <View key={b.name} style={styles.row}>
            <Text style={styles.label}>{b.name}</Text>
            <MoneyInput value={b.amount} onChange={(n) => setBucket(i, n)} />
          </View>
        ))}
      </Card>

      <Card>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Total expenses</Text>
          <Text style={styles.val}>{formatCurrency(expenses)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Monthly surplus</Text>
          <Text style={[styles.val, { color: surplus >= 0 ? theme.green : theme.red }]}>
            {formatCurrency(surplus)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Savings rate</Text>
          <Text style={[styles.val, { color: theme.indigo }]}>{savingsRate.toFixed(0)}%</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 40 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 6 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 5 },
  label: { color: theme.textDim, fontSize: 14 },
  val: { color: theme.text, fontSize: 15, fontWeight: "700" },
  input: {
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: theme.radiusSm,
    color: theme.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    minWidth: 120,
    textAlign: "right",
  },
});
