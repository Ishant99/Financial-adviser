import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import { theme } from "../theme";
import { formatCurrency } from "../lib/format";
import { holdingCurrentValue, holdingInvested } from "../data/models";
import { useStore } from "../store";
import { Card, Eyebrow, H1, Section } from "../components/ui";

export default function PortfolioScreen() {
  const { holdings, updateHolding, syncNow, navSyncing, lastNavSync } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [dateDraft, setDateDraft] = useState("");

  const total = useMemo(() => holdings.reduce((s, h) => s + holdingCurrentValue(h), 0), [holdings]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Eyebrow>PORTFOLIO</Eyebrow>
      <H1>{formatCurrency(total)}</H1>

      <Pressable style={styles.refresh} onPress={() => syncNow()} disabled={navSyncing}>
        <Text style={styles.refreshText}>
          {navSyncing ? "Refreshing NAVs…" : `↻ Refresh prices${lastNavSync ? ` · synced ${lastNavSync}` : ""}`}
        </Text>
      </Pressable>

      <Section>Holdings ({holdings.length})</Section>
      {holdings.map((h) => {
        const value = holdingCurrentValue(h);
        const inv = holdingInvested(h);
        const gain = value - inv;
        const pct = inv > 0 ? (gain / inv) * 100 : 0;
        const up = gain >= 0;
        return (
          <Card key={h.id}>
            <View style={styles.row}>
              <Text style={styles.name} numberOfLines={1}>
                {h.name}
              </Text>
              <Text style={styles.value}>{formatCurrency(value)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.meta}>
                {h.units.toFixed(3)} units · {h.holdingType}
              </Text>
              <Text style={[styles.gain, { color: up ? theme.green : theme.red }]}>
                {up ? "+" : ""}
                {formatCurrency(gain)} ({pct.toFixed(1)}%)
              </Text>
            </View>

            {/* Purchase date — drives tax accuracy */}
            {editing === h.id ? (
              <View style={styles.dateRow}>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textFaint}
                  value={dateDraft}
                  onChangeText={setDateDraft}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.saveBtn}
                  onPress={() => {
                    updateHolding(h.id, { purchaseDate: dateDraft || null });
                    setEditing(null);
                  }}
                >
                  <Text style={styles.saveText}>Save</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  setEditing(h.id);
                  setDateDraft(h.purchaseDate ?? "");
                }}
              >
                <Text style={styles.dateLabel}>
                  {h.purchaseDate ? `Bought ${h.purchaseDate}` : "⚠️ Set purchase date (for tax)"}
                </Text>
              </Pressable>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 40 },
  refresh: {
    alignSelf: "flex-start",
    backgroundColor: theme.indigoSoft,
    borderRadius: theme.radiusSm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
  },
  refreshText: { color: theme.indigo, fontSize: 13, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  name: { color: theme.text, fontSize: 15, fontWeight: "700", flex: 1 },
  value: { color: theme.text, fontSize: 15, fontWeight: "700" },
  meta: { color: theme.textFaint, fontSize: 12, marginTop: 4 },
  gain: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  dateLabel: { color: theme.indigo, fontSize: 12, marginTop: 10 },
  dateRow: { flexDirection: "row", gap: 8, marginTop: 10, alignItems: "center" },
  input: {
    flex: 1,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: theme.radiusSm,
    color: theme.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  saveBtn: { backgroundColor: theme.indigo, borderRadius: theme.radiusSm, paddingHorizontal: 16, paddingVertical: 9 },
  saveText: { color: "#fff", fontWeight: "700" },
});
