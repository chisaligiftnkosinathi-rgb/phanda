import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useConstraintProposals } from "../../../src/hooks/useConstraintProposals";

export default function ConstraintGovernanceConsole() {
  const router = useRouter();
  const { proposals, loading } = useConstraintProposals();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Governance Console</Text>
      <Text style={styles.subtitle}>World D: Autonomous Constraint Evolution</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          World D observes physics blocks (A+) and memory contradictions (C++) to simulate safer structural rules. 
          It evaluates ONLY against observable system instability metrics.
        </Text>
      </View>

      <Text style={styles.listTitle}>Proposed Constraint Migrations</Text>
      
      <FlatList
        data={proposals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.proposalCard}
            onPress={() => router.push(`/constraint-evolution/${item.id}`)}
          >
            <View style={styles.propHeader}>
              <Text style={styles.propChange}>{item.proposedChange.replace(/_/g, ' ').toUpperCase()}</Text>
              <View style={styles.riskBadge}>
                <Text style={styles.riskText}>Risk: {(item.riskScore * 100).toFixed(0)}%</Text>
              </View>
            </View>
            
            <View style={styles.propRow}>
              <Text style={styles.propLabel}>Target:</Text>
              <Text style={styles.propValue}>{item.targetConstraintId}</Text>
            </View>
            <View style={styles.propRow}>
              <Text style={styles.propLabel}>Rationale:</Text>
              <Text style={styles.propReason}>{item.rationaleType.replace(/_/g, ' ').toUpperCase()}</Text>
            </View>

            <View style={styles.gainRow}>
              <Text style={styles.gainLabel}>Predicted Stability Gain</Text>
              <Text style={styles.gainValue}>+{(item.simulationOutcome.stabilityDelta * 100).toFixed(1)}%</Text>
            </View>

            <Text style={styles.tracePrompt}>Review Proposal ➔</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No constraint evolutions proposed.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#f5f3ff" },
  header: { fontSize: 26, fontWeight: "bold", color: "#4c1d95" },
  subtitle: { fontSize: 14, color: "#6d28d9", marginBottom: 24 },
  
  infoCard: { backgroundColor: "#ede9fe", padding: 16, borderRadius: 8, marginBottom: 24, borderWidth: 1, borderColor: "#ddd6fe" },
  infoText: { fontSize: 13, color: "#5b21b6", fontStyle: "italic", lineHeight: 20 },

  listTitle: { fontSize: 18, fontWeight: "bold", color: "#4c1d95", marginBottom: 12 },
  
  proposalCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "#ddd6fe", elevation: 2 },
  propHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  propChange: { fontSize: 14, fontWeight: "800", color: "#6d28d9" },
  riskBadge: { backgroundColor: "#fef3c7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  riskText: { fontSize: 11, fontWeight: "bold", color: "#b45309" },
  
  propRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  propLabel: { fontSize: 13, fontWeight: "bold", color: "#7c3aed", width: 80 },
  propValue: { fontSize: 13, color: "#4c1d95", fontFamily: "monospace" },
  propReason: { fontSize: 12, color: "#6d28d9", fontStyle: "italic" },
  
  gainRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#ede9fe" },
  gainLabel: { fontSize: 12, fontWeight: "bold", color: "#4c1d95" },
  gainValue: { fontSize: 16, fontWeight: "bold", color: "#16a34a" },
  
  tracePrompt: { fontSize: 12, color: "#7c3aed", fontWeight: "bold", textAlign: "right", marginTop: 12 },
  empty: { color: "#7c3aed", fontStyle: "italic", marginTop: 12 }
});
