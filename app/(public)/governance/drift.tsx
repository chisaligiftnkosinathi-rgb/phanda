import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useGovernanceConflicts } from "../../../src/hooks/useGovernanceConflicts";

export default function SystemRiskSurfaceScreen() {
  const { conflicts } = useGovernanceConflicts();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>System Risk Surface</Text>
      <Text style={styles.subtitle}>World D Evolution vs World E Human Intent</Text>

      <View style={styles.riskMap}>
        <Text style={styles.riskMapLabel}>Active Drift Conflicts</Text>
        
        {conflicts.map((conflict) => (
          <View key={conflict.id} style={styles.conflictRow}>
            <View style={styles.conflictHeader}>
              <Text style={styles.conflictType}>{conflict.conflictType.replace(/_/g, ' ').toUpperCase()}</Text>
              <Text style={styles.conflictSeverity}>Severity: {(conflict.severity * 100).toFixed(0)}</Text>
            </View>
            <Text style={styles.conflictTrace}>{conflict.explanationTrace}</Text>
            <Text style={styles.conflictLayer}>Affected Layer: {conflict.affectedLayer}</Text>
          </View>
        ))}

        {conflicts.length === 0 && (
          <Text style={styles.emptyRisk}>No structural drift detected. System evolution perfectly aligns with bound human intent.</Text>
        )}
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>World E Observer Rule</Text>
        <Text style={styles.disclaimerText}>
          This surface maps tension between evolution (World D) and human intent (World E). 
          World E cannot auto-correct this drift. It can only signal when the system 
          departs from its intended trajectory.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0fdfa" },
  header: { fontSize: 26, fontWeight: "bold", color: "#115e59" },
  subtitle: { fontSize: 13, color: "#0f766e", marginBottom: 20, fontFamily: "monospace" },
  
  riskMap: { backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#99f6e4", marginBottom: 24 },
  riskMapLabel: { fontSize: 16, fontWeight: "bold", color: "#115e59", marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f0fdfa", paddingBottom: 8 },
  
  conflictRow: { backgroundColor: "#fef2f2", padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "#fecaca" },
  conflictHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  conflictType: { fontSize: 13, fontWeight: "bold", color: "#b91c1c" },
  conflictSeverity: { fontSize: 12, fontWeight: "bold", color: "#991b1b" },
  conflictTrace: { fontSize: 13, color: "#7f1d1d", fontStyle: "italic", marginBottom: 8 },
  conflictLayer: { fontSize: 12, color: "#b91c1c", fontFamily: "monospace" },

  emptyRisk: { fontSize: 14, color: "#0f766e", fontStyle: "italic", textAlign: "center", paddingVertical: 20 },

  disclaimer: { backgroundColor: "#ccfbf1", padding: 20, borderRadius: 12 },
  disclaimerTitle: { fontSize: 14, fontWeight: "bold", color: "#0f766e", marginBottom: 8 },
  disclaimerText: { fontSize: 13, color: "#115e59", lineHeight: 22 }
});
