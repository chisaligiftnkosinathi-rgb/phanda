import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SelfHealingService } from "../../../src/services/selfHealingService";
import { UIMemoryStateSnapshot } from "../../../src/types/selfHealing.types";

export default function MemoryDriftScreen() {
  const [snapshots, setSnapshots] = useState<UIMemoryStateSnapshot[]>([]);
  const [divergenceScore, setDivergenceScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrift = async () => {
      setLoading(true);
      try {
        const { snapshots, divergenceScore } = await SelfHealingService.analyzeDrift();
        setSnapshots(snapshots);
        setDivergenceScore(divergenceScore);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDrift();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#be123c" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Memory Drift Report</Text>
      <Text style={styles.subtitle}>Tracking meaning divergence over time</Text>
      
      <View style={styles.divergenceCard}>
        <Text style={styles.divLabel}>System Divergence Score</Text>
        <Text style={[styles.divValue, { color: divergenceScore > 0.6 ? '#be123c' : '#15803d' }]}>
          {(divergenceScore * 100).toFixed(1)}%
        </Text>
        <Text style={styles.divNote}>
          {divergenceScore > 0.6 
            ? "High tension: Operational data is diverging from ledger execution truth."
            : "Stable: Operations and transactions are highly correlated."}
        </Text>
      </View>

      <Text style={styles.listTitle}>Temporal State Snapshots</Text>

      {snapshots.map((snap, i) => (
        <View key={snap.snapshotId} style={styles.snapshotCard}>
          <Text style={styles.snapTime}>{new Date(snap.timestamp).toLocaleString()}</Text>
          <View style={styles.hashRow}>
            <Text style={styles.hashLabel}>A (Execution):</Text>
            <Text style={styles.hashValue}>{snap.hashA}</Text>
          </View>
          <View style={styles.hashRow}>
            <Text style={styles.hashLabel}>B (Meaning):</Text>
            <Text style={styles.hashValue}>{snap.hashB}</Text>
          </View>
          <View style={styles.hashRow}>
            <Text style={styles.hashLabel}>C (Intelligence):</Text>
            <Text style={styles.hashValue}>{snap.hashC}</Text>
          </View>
          <View style={styles.hashRow}>
            <Text style={styles.hashLabel}>C+ (Memory):</Text>
            <Text style={styles.hashValue}>{snap.hashCPlus}</Text>
          </View>
        </View>
      ))}

      {snapshots.length === 0 && (
        <Text style={styles.empty}>No state snapshots available to measure drift.</Text>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#fff1f2" },
  header: { fontSize: 26, fontWeight: "bold", color: "#881337" },
  subtitle: { fontSize: 14, color: "#be123c", marginBottom: 24 },
  
  divergenceCard: { backgroundColor: "#fff", padding: 24, borderRadius: 12, alignItems: "center", marginBottom: 32, elevation: 2 },
  divLabel: { fontSize: 14, color: "#9f1239", fontWeight: "bold", textTransform: "uppercase" },
  divValue: { fontSize: 48, fontWeight: "bold", marginVertical: 8 },
  divNote: { fontSize: 13, color: "#4c0519", textAlign: "center", fontStyle: "italic", paddingHorizontal: 16 },

  listTitle: { fontSize: 18, fontWeight: "bold", color: "#881337", marginBottom: 12 },
  
  snapshotCard: { backgroundColor: "#ffe4e6", padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "#fecdd3" },
  snapTime: { fontSize: 14, fontWeight: "bold", color: "#881337", marginBottom: 12 },
  
  hashRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  hashLabel: { fontSize: 12, fontWeight: "bold", color: "#be123c", width: 110 },
  hashValue: { fontSize: 12, color: "#4c0519", fontFamily: "monospace" },
  
  empty: { color: "#e11d48", fontStyle: "italic" }
});
