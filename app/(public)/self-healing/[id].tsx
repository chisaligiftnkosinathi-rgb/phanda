import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useHealingInsights } from "../../../src/hooks/useHealingInsights";

export default function ConflictDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { suggestions, loading } = useHealingInsights(id);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#be123c" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Truth Tension Inspector</Text>
      <Text style={styles.subtitle}>Conflict ID: {id}</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          The system has detected a memory contradiction. World C++ proposes the following parallel interpretations. 
          None of these will rewrite historical truth.
        </Text>
      </View>

      <Text style={styles.listTitle}>Non-Destructive Healing Strategies</Text>

      {suggestions.map(sugg => (
        <View key={sugg.id} style={styles.suggestionCard}>
          <View style={styles.suggHeader}>
            <Text style={styles.strategyType}>{sugg.strategyType.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.impactBadge}>Scope: {sugg.impactScope}</Text>
          </View>
          
          <Text style={styles.explanation}>{sugg.explanation}</Text>
          
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Interpretation Confidence</Text>
            <Text style={styles.confidenceValue}>{(sugg.confidence * 100).toFixed(0)}%</Text>
          </View>
        </View>
      ))}

      {suggestions.length === 0 && (
        <Text style={styles.empty}>No interpretations generated for this conflict.</Text>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#fff1f2" },
  header: { fontSize: 28, fontWeight: "bold", color: "#881337" },
  subtitle: { fontSize: 13, color: "#be123c", marginBottom: 20, fontFamily: "monospace" },
  
  infoBox: { backgroundColor: "#ffe4e6", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "#fecdd3", marginBottom: 24 },
  infoText: { fontSize: 14, color: "#9f1239", lineHeight: 22, fontStyle: "italic" },

  listTitle: { fontSize: 18, fontWeight: "bold", color: "#881337", marginBottom: 12 },
  
  suggestionCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#fecdd3", marginBottom: 16, elevation: 1 },
  suggHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  strategyType: { fontSize: 14, fontWeight: "700", color: "#e11d48" },
  impactBadge: { fontSize: 11, backgroundColor: "#fecdd3", color: "#881337", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, overflow: 'hidden', fontWeight: "bold" },
  
  explanation: { fontSize: 16, color: "#4c0519", lineHeight: 24, marginBottom: 20 },
  
  confidenceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTopWidth: 1, borderTopColor: "#ffe4e6" },
  confidenceLabel: { fontSize: 12, color: "#9f1239", fontWeight: "600", textTransform: "uppercase" },
  confidenceValue: { fontSize: 18, fontWeight: "bold", color: "#be123c" },
  
  empty: { color: "#e11d48", fontStyle: "italic" }
});
