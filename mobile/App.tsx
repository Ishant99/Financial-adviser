import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";

import { theme } from "./src/theme";
import { StoreProvider } from "./src/store";
import TodayScreen from "./src/screens/TodayScreen";
import PortfolioScreen from "./src/screens/PortfolioScreen";
import OptimizeScreen from "./src/screens/OptimizeScreen";
import FutureScreen from "./src/screens/FutureScreen";
import BudgetScreen from "./src/screens/BudgetScreen";

type Tab = "today" | "portfolio" | "optimize" | "future" | "budget";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "today", label: "Today", icon: "◎" },
  { key: "portfolio", label: "Portfolio", icon: "▦" },
  { key: "optimize", label: "Optimize", icon: "✦" },
  { key: "future", label: "Future", icon: "↗" },
  { key: "budget", label: "Budget", icon: "₹" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <StoreProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.body}>
          {tab === "today" && <TodayScreen />}
          {tab === "portfolio" && <PortfolioScreen />}
          {tab === "optimize" && <OptimizeScreen />}
          {tab === "future" && <FutureScreen />}
          {tab === "budget" && <BudgetScreen />}
        </View>
        <View style={styles.tabbar}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
                <Text style={[styles.icon, { color: active ? theme.indigo : theme.textFaint }]}>
                  {t.icon}
                </Text>
                <Text style={[styles.tabLabel, { color: active ? theme.indigo : theme.textFaint }]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  body: { flex: 1 },
  tabbar: {
    flexDirection: "row",
    borderTopColor: theme.border,
    borderTopWidth: 1,
    backgroundColor: theme.bg,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 18, marginBottom: 2 },
  tabLabel: { fontSize: 11, fontWeight: "600" },
});
