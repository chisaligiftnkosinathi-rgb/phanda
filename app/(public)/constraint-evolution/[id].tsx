import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useConstraintSimulation } from "../../../src/hooks/useConstraintSimulation";

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { simulation, loading } = useConstraintSimulation(id);

  if (loading || !simulation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Proposal Inspector</Text>
      <Text style={styles.subtitle}>Proposal Ref: {id}</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          World D has generated a dry simulation. The metrics below represent the forecasted 
          impact if this constraint migration is approved.
        </Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Simulation Outcome</Text>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Predicted A+ Violations Change</Text>
          <Text style={[styles.metricValue, { color: simulation.predictedViolationsDelta < 0 ? '#16a34a' : '#dc2626' }]}>
            {simulation.predictedViolationsDelta > 0 ? '+' : ''}{simulation.predictedViolationsDelta}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Predicted System Stability Delta</Text>
          <Text style={[styles.metricValue, { color: simulation.stabilityDelta > 0 ? '#16a34a' : '#dc2626' }]}>
            {simulation.stabilityDelta > 0 ? '+' : ''}{(simulation.stabilityDelta * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>C++ Contradiction Risk Shift</Text>
          <Text style={[styles.metricValue, { color: simulation.contradictionRiskIncrease < 0 ? '#16a34a' : '#dc2626' }]}>
            {simulation.contradictionRiskIncrease > 0 ? '+' : ''}{(simulation.contradictionRiskIncrease * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Affected Execution Workflows</Text>
        {simulation.affectedEntities.map((entity, idx) => (
          <Text key={idx} style={styles.entityItem}>• {entity}</Text>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.sandboxBtn}
        onPress={() => router.push(`/constraint-evolution/simulation?id=${id}`)}
      >
        <Text style={styles.sandboxBtnText}>Open Interactive Sandbox</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#f5f3ff" },
  header: { fontSize: 26, fontWeight: "bold", color: "#4c1d95" },
  subtitle: { fontSize: 13, color: "#6d28d9", marginBottom: 20, fontFamily: "monospace" },
  
  infoBox: { backgroundColor: "#ede9fe", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "#ddd6fe", marginBottom: 24 },
  infoText: { fontSize: 14, color: "#5b21b6", lineHeight: 22, fontStyle: "italic", fontWeight: "bold" },

  detailCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#ddd6fe", marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#4c1d95", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f5f3ff", paddingBottom: 8 },
  
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  metricLabel: { fontSize: 14, color: "#4c1d95", fontWeight: "600" },
  metricValue: { fontSize: 16, fontWeight: "bold" },
  
  entityItem: { fontSize: 14, color: "#6d28d9", marginBottom: 4, fontFamily: "monospace" },
  
  sandboxBtn: { backgroundColor: "#6d28d9", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 12 },
  sandboxBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});
