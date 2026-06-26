import React from "react";
import { StyleSheet, Text, View, ViewStyle, Pressable } from "react-native";
import { theme } from "../theme";

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function H1({ children }: { children: React.ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function Section({ children }: { children: React.ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Stepper({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable style={styles.stepBtn} onPress={onDec}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable style={styles.stepBtn} onPress={onInc}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: theme.radius,
    padding: 18,
    marginBottom: 14,
  },
  eyebrow: { color: theme.indigo, fontSize: 12, fontWeight: "700", letterSpacing: 2, marginTop: 8 },
  h1: { color: theme.text, fontSize: 26, fontWeight: "800", marginBottom: 16 },
  section: { color: theme.text, fontSize: 16, fontWeight: "700", marginTop: 6, marginBottom: 10 },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  stepperLabel: { color: theme.textDim, fontSize: 14, flex: 1 },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.indigoSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { color: theme.indigo, fontSize: 20, fontWeight: "800" },
  stepValue: { color: theme.text, fontSize: 15, fontWeight: "700", minWidth: 92, textAlign: "center" },
});
