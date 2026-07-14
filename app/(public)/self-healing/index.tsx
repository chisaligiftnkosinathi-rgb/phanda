import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSelfHealing } from "../../../src/hooks/useSelfHealing";
import { useMemoryConflicts } from "../../../src/hooks/useMemoryConflicts";

export default function TruthTensionDashboard() {
  const router = useRouter();
  const { healthStatus, loading: healthLoading } = useSelfHealing();
  const { conflicts, loading: conflictsLoading } = useMemoryConflicts();

  if (healthLoading || conflictsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#be123c" />
      </View>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy": return "#15803d";
      case "unstable_meaning": return "#d97706";
      case "execution_meaning_divergence": return "#be123c";
      default: return "#be123c";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Truth Tension Layer</Text>
          <Text style={styles.subtitle}>Self-Healing Memory Logic (World C++)</Text>
        </View>
        <TouchableOpacity style={styles.driftBtn} onPress={() => router.push("/self-healing/drift")}>
          <Text style={styles.driftText}>View Drift Report</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.healthCard, { borderLeftColor: getHealthColor(healthStatus) }]}>
        <Text style={styles.healthLabel}>System Health Status</Text>
        <Text style={[styles.healthStatus, { color: getHealthColor(healthStatus) }]}>
          {healthStatus.replace(/_/g, " ").toUpperCase()}
        </Text>
      </View>

      <Text style={styles.listTitle}>Memory Conflicts (Contradiction Feed)</Text>
      
      <FlatList
        data={conflicts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.conflictCard}
            onPress={() => router.push(`/self-healing/${item.id}`)}
          >
            <View style={styles.conflictHeader}>
              <Text style={styles.conflictType}>{item.conflictType.replace('_', ' ').toUpperCase()}</Text>
              <View style={[styles.severityBadge, { backgroundColor: item.severityScore > 0.7 ? '#ffe4e6' : '#fef3c7' }]}>
                <Text style={[styles.severityText, { color: item.severityScore > 0.7 ? '#be123c' : '#b45309' }]}>
                  Sev {(item.severityScore * 100).toFixed(0)}
                </Text>
              </View>
            </View>
            
            <View style={styles.sourceRow}>
              <Text style={styles.sourceLabel}>A:</Text>
              <Text style={styles.sourceValue}>{item.sourceA}</Text>
            </View>
            <View style={styles.sourceRow}>
              <Text style={styles.sourceLabel}>B:</Text>
              <Text style={styles.sourceValue}>{item.sourceB}</Text>
            </View>

            <Text style={styles.tracePrompt}>Inspect Tension ➔</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No structural contradictions detected.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#fff1f2" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  header: { fontSize: 26, fontWeight: "bold", color: "#881337" },
  subtitle: { fontSize: 14, color: "#be123c" },
  driftBtn: { backgroundColor: "#fda4af", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  driftText: { color: "#881337", fontWeight: "bold", fontSize: 12 },
  
  healthCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 24, borderLeftWidth: 6, elevation: 2 },
  healthLabel: { fontSize: 12, color: "#9f1239", fontWeight: "bold", textTransform: "uppercase", marginBottom: 4 },
  healthStatus: { fontSize: 20, fontWeight: "bold" },
  
  listTitle: { fontSize: 18, fontWeight: "bold", color: "#881337", marginBottom: 12 },
  
  conflictCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "#fecdd3" },
  conflictHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  conflictType: { fontSize: 13, fontWeight: "700", color: "#be123c" },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  severityText: { fontSize: 11, fontWeight: "bold" },
  
  sourceRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  sourceLabel: { fontSize: 13, fontWeight: "bold", color: "#e11d48", width: 24 },
  sourceValue: { fontSize: 13, color: "#4c0519", fontFamily: "monospace" },
  
  tracePrompt: { fontSize: 13, color: "#e11d48", fontWeight: "bold", textAlign: "right", marginTop: 8 },
  empty: { color: "#e11d48", fontStyle: "italic", marginTop: 12 }
});
