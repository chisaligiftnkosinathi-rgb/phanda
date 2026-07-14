import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function InteractiveSandboxScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Interactive Sandbox</Text>
      <Text style={styles.subtitle}>Proposal: {id}</Text>

      <View style={styles.sandboxArea}>
        <Text style={styles.sandboxLabel}>Physics Simulation Feed</Text>
        <Text style={styles.logText}>
          [SIM] Relaxing constraint rule_payment_v1...{"\n"}
          [SIM] Running 1,000 historical state transitions...{"\n"}
          [SIM] 42 new execution pathways successfully completed.{"\n"}
          [SIM] 3 structural breaks detected in cascading dependencies.{"\n"}
          [SIM] C++ contradiction probability reduced by 14.2%.{"\n"}
          [SIM] Core structural integrity remains above threshold (92%).
        </Text>
      </View>

      <View style={styles.sandboxAction}>
        <Text style={styles.actionPrompt}>Sandbox is strictly sandboxed.</Text>
        <Text style={styles.actionNote}>
          World D observes and predicts. Actioning this proposal requires external 
          Governance Alignment validation (World E).
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f3ff" },
  header: { fontSize: 26, fontWeight: "bold", color: "#4c1d95" },
  subtitle: { fontSize: 13, color: "#6d28d9", marginBottom: 20, fontFamily: "monospace" },
  
  sandboxArea: { backgroundColor: "#1e1b4b", padding: 20, borderRadius: 12, marginBottom: 24 },
  sandboxLabel: { fontSize: 12, color: "#a78bfa", textTransform: "uppercase", fontWeight: "bold", marginBottom: 12 },
  logText: { color: "#ddd6fe", fontFamily: "monospace", fontSize: 13, lineHeight: 22 },
  
  sandboxAction: { backgroundColor: "#fff", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#ddd6fe" },
  actionPrompt: { fontSize: 16, fontWeight: "bold", color: "#be123c", marginBottom: 8 },
  actionNote: { fontSize: 14, color: "#6d28d9", lineHeight: 22 }
});
