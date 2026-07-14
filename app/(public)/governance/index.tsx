import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useGovernanceIntents } from "../../../src/hooks/useGovernanceIntents";
import { useGovernanceHealth } from "../../../src/hooks/useGovernanceHealth";

export default function GovernanceAlignmentConsole() {
  const router = useRouter();
  const { intents, loading: intentsLoading } = useGovernanceIntents();
  const { health, loading: healthLoading } = useGovernanceHealth();

  if (intentsLoading || healthLoading || !health) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "aligned": return "#15803d";
      case "drifting": return "#ca8a04";
      case "critical_misalignment": return "#b91c1c";
      default: return "#0f766e";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Governance Alignment</Text>
          <Text style={styles.subtitle}>World E: Human Intent Binding Layer</Text>
        </View>
        <TouchableOpacity style={styles.driftBtn} onPress={() => router.push("/governance/drift")}>
          <Text style={styles.driftText}>System Risk Surface</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.healthCard, { borderLeftColor: getHealthColor(health.status) }]}>
        <Text style={styles.healthLabel}>System-Wide Alignment</Text>
        <Text style={[styles.healthStatus, { color: getHealthColor(health.status) }]}>
          {health.status.replace(/_/g, " ").toUpperCase()}
        </Text>
        <Text style={styles.driftNote}>
          Drift Score: {(health.driftScore * 100).toFixed(1)}% | Active Conflicts: {health.activeConflictsCount}
        </Text>
      </View>

      <Text style={styles.listTitle}>Human Intent Registry</Text>
      <Text style={styles.listSubtitle}>Measured reference signals bounding system evolution.</Text>

      <FlatList
        data={intents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.intentCard}
            onPress={() => router.push(`/governance/${item.id}`)}
          >
            <View style={styles.intentHeader}>
              <Text style={styles.intentType}>{item.intentType.replace(/_/g, ' ').toUpperCase()}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: item.priorityLevel === 'hard' ? '#fee2e2' : '#fef3c7' }]}>
                <Text style={[styles.priorityText, { color: item.priorityLevel === 'hard' ? '#b91c1c' : '#b45309' }]}>
                  {item.priorityLevel.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.intentStatement}>"{item.intentStatement}"</Text>

            <View style={styles.scopeRow}>
              <Text style={styles.scopeLabel}>Bound Scope:</Text>
              <Text style={styles.scopeValue}>{item.scope}</Text>
            </View>

            <Text style={styles.tracePrompt}>Deep Trace Alignment ➔</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No human intents registered.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#f0fdfa" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  header: { fontSize: 26, fontWeight: "bold", color: "#115e59" },
  subtitle: { fontSize: 14, color: "#0f766e" },
  driftBtn: { backgroundColor: "#ccfbf1", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: "#99f6e4" },
  driftText: { color: "#115e59", fontWeight: "bold", fontSize: 12 },
  
  healthCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 24, borderLeftWidth: 6, elevation: 2 },
  healthLabel: { fontSize: 12, color: "#0f766e", fontWeight: "bold", textTransform: "uppercase", marginBottom: 4 },
  healthStatus: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  driftNote: { fontSize: 13, color: "#475569", fontStyle: "italic" },
  
  listTitle: { fontSize: 18, fontWeight: "bold", color: "#115e59" },
  listSubtitle: { fontSize: 13, color: "#0f766e", marginBottom: 12, fontStyle: "italic" },
  
  intentCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "#99f6e4" },
  intentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  intentType: { fontSize: 12, fontWeight: "700", color: "#0f766e" },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  priorityText: { fontSize: 11, fontWeight: "bold" },
  
  intentStatement: { fontSize: 16, color: "#134e4a", fontWeight: "500", marginBottom: 16, fontStyle: "italic" },
  
  scopeRow: { flexDirection: "row", alignItems: "center" },
  scopeLabel: { fontSize: 12, fontWeight: "bold", color: "#0d9488", width: 90 },
  scopeValue: { fontSize: 12, color: "#115e59", fontFamily: "monospace" },
  
  tracePrompt: { fontSize: 12, color: "#0f766e", fontWeight: "bold", textAlign: "right", marginTop: 8 },
  empty: { color: "#0d9488", fontStyle: "italic", marginTop: 12 }
});
