import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useExplanation } from "../../../src/hooks/useExplanation";

export default function OriginTracerScreen() {
  const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
  const { explanation, loading } = useExplanation(nodeId);

  if (loading || !explanation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0369a1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Origin Tracer</Text>
      <Text style={styles.subtitle}>Causal explanation for node: {nodeId}</Text>
      
      <View style={styles.explainCard}>
        <Text style={styles.explainHeader}>Why does this exist?</Text>
        <Text style={styles.explainText}>{explanation.explanationText}</Text>
        
        <View style={styles.confidenceRow}>
          <Text style={styles.confidenceLabel}>Trace Confidence</Text>
          <Text style={styles.confidenceValue}>{(explanation.confidence * 100).toFixed(0)}%</Text>
        </View>
      </View>
      
      <Text style={styles.footerNote}>
        This explanation is deterministically compiled from the Memory Graph across Execution (A), Meaning (B), and Cognition (C).
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#f0f9ff" },
  header: { fontSize: 28, fontWeight: "bold", color: "#0c4a6e" },
  subtitle: { fontSize: 13, color: "#0369a1", marginBottom: 24, fontFamily: "monospace" },
  
  explainCard: { backgroundColor: "#fff", padding: 24, borderRadius: 12, borderWidth: 1, borderColor: "#bae6fd", elevation: 2 },
  explainHeader: { fontSize: 18, fontWeight: "bold", color: "#0284c7", marginBottom: 16 },
  explainText: { fontSize: 18, color: "#0f172a", lineHeight: 28, fontStyle: "italic" },
  
  confidenceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#e0f2fe" },
  confidenceLabel: { fontSize: 14, color: "#0369a1", fontWeight: "600", textTransform: "uppercase" },
  confidenceValue: { fontSize: 20, fontWeight: "bold", color: "#0c4a6e" },

  footerNote: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 40, paddingHorizontal: 20 }
});
