import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useExecutionViolations } from "../../../src/hooks/useExecutionViolations";

export default function ExecutionSafetyConsole() {
  const router = useRouter();
  const { violations, loading } = useExecutionViolations();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const integrityScore = violations.length === 0 ? 100 : Math.max(0, 100 - (violations.length * 5));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Execution Safety Console</Text>
      <Text style={styles.subtitle}>World A+ Constraint Physics Engine</Text>

      <View style={styles.integrityCard}>
        <Text style={styles.integrityLabel}>Structural Integrity Score</Text>
        <Text style={[styles.integrityScore, { color: integrityScore > 80 ? '#16a34a' : '#dc2626' }]}>
          {integrityScore}%
        </Text>
        <Text style={styles.integrityNote}>
          This score reflects adherence to the deterministic constraint lattice.
        </Text>
      </View>

      <Text style={styles.listTitle}>Constraint Violations (Blocked Execution)</Text>
      
      <FlatList
        data={violations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.violationCard}
            onPress={() => router.push(`/execution-guard/${item.metadata.entityId || item.entityType}`)}
          >
            <View style={styles.violHeader}>
              <Text style={styles.violEntity}>{item.entityType}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>BLOCKED</Text>
              </View>
            </View>
            
            <View style={styles.violRow}>
              <Text style={styles.violLabel}>Attempted:</Text>
              <Text style={styles.violValue}>{item.attemptedTransition}</Text>
            </View>
            <View style={styles.violRow}>
              <Text style={styles.violLabel}>Reason:</Text>
              <Text style={styles.violReason}>{item.reasonCode.replace(/_/g, ' ').toUpperCase()}</Text>
            </View>

            <Text style={styles.tracePrompt}>Inspect Physics Block ➔</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No structural violations blocked.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#eef2ff" },
  header: { fontSize: 26, fontWeight: "bold", color: "#3730a3" },
  subtitle: { fontSize: 14, color: "#4f46e5", marginBottom: 24 },
  
  integrityCard: { backgroundColor: "#fff", padding: 24, borderRadius: 12, alignItems: "center", marginBottom: 32, elevation: 2, borderWidth: 1, borderColor: "#c7d2fe" },
  integrityLabel: { fontSize: 14, color: "#4338ca", fontWeight: "bold", textTransform: "uppercase" },
  integrityScore: { fontSize: 48, fontWeight: "bold", marginVertical: 8 },
  integrityNote: { fontSize: 12, color: "#6366f1", textAlign: "center", fontStyle: "italic" },

  listTitle: { fontSize: 18, fontWeight: "bold", color: "#3730a3", marginBottom: 12 },
  
  violationCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderLeftWidth: 4, borderColor: "#e0e7ff", borderLeftColor: "#ef4444" },
  violHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  violEntity: { fontSize: 16, fontWeight: "800", color: "#312e81", textTransform: "uppercase" },
  badge: { backgroundColor: "#fee2e2", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: "bold", color: "#dc2626" },
  
  violRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  violLabel: { fontSize: 13, fontWeight: "bold", color: "#4f46e5", width: 80 },
  violValue: { fontSize: 13, color: "#312e81", fontFamily: "monospace" },
  violReason: { fontSize: 13, color: "#dc2626", fontWeight: "bold" },
  
  tracePrompt: { fontSize: 12, color: "#4f46e5", fontWeight: "bold", textAlign: "right", marginTop: 8 },
  empty: { color: "#4f46e5", fontStyle: "italic", marginTop: 12 }
});
