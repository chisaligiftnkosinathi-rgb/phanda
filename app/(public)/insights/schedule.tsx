import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Switch } from "react-native";
import { useInsightSchedule } from "../../../src/hooks/useInsightSchedule";
import { UISweepRhythm } from "../../../src/types/insightScheduler.types";

const RHYTHMS: { label: string, value: UISweepRhythm }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Continuous (Bounded)", value: "continuous_bounded" },
];

export default function TemporalCognitionScreen() {
  const { config, history, loading, error, updateConfig, simulateCronSweep } = useInsightSchedule();

  if (loading && !config) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const handleToggleActive = (value: boolean) => {
    updateConfig({ active: value });
  };

  const handleRhythmChange = (rhythm: UISweepRhythm) => {
    updateConfig({ rhythm });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Temporal Cognition Config</Text>
      <Text style={styles.subtitle}>Configure World C's chronometer of meaning and action evolution.</Text>

      {error && <Text style={styles.error}>{error.message}</Text>}

      <View style={styles.configCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Automated Cognitive Sweeps</Text>
          <Switch
            value={config?.active}
            onValueChange={handleToggleActive}
            trackColor={{ false: "#cbd5e1", true: "#818cf8" }}
            thumbColor={config?.active ? "#4f46e5" : "#f1f5f9"}
          />
        </View>

        <Text style={styles.label}>Sweep Rhythm</Text>
        <View style={styles.rhythmSelector}>
          {RHYTHMS.map(r => (
            <TouchableOpacity 
              key={r.value}
              style={[styles.rhythmBadge, config?.rhythm === r.value && styles.rhythmBadgeActive]}
              onPress={() => handleRhythmChange(r.value)}
              disabled={!config?.active}
            >
              <Text style={[styles.rhythmText, config?.rhythm === r.value && styles.rhythmTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.simulateBtn} onPress={simulateCronSweep}>
          <Text style={styles.simulateText}>Force Trigger Sweep (Simulate Cron)</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.historyHeader}>Temporal Memory (Sweep History)</Text>
      
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <View style={styles.historyRow}>
              <Text style={styles.timestamp}>{new Date(item.sweepTimestamp).toLocaleString()}</Text>
              <Text style={styles.status}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={styles.statsText}>Rhythm: {item.rhythm.replace('_', ' ')}</Text>
            <Text style={styles.statsText}>Insights Generated/Updated: {item.insightsGenerated}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No cognitive sweeps have occurred yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#eef2ff" },
  header: { fontSize: 26, fontWeight: "bold", color: "#3730a3" },
  subtitle: { fontSize: 14, color: "#4f46e5", marginBottom: 20 },
  error: { color: "red", marginBottom: 12 },
  
  configCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, marginBottom: 24, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  label: { fontSize: 16, fontWeight: "bold", color: "#312e81", marginBottom: 12 },
  
  rhythmSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  rhythmBadge: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: "#e0e7ff", borderWidth: 1, borderColor: "#c7d2fe" },
  rhythmBadgeActive: { backgroundColor: "#4f46e5", borderColor: "#3730a3" },
  rhythmText: { fontSize: 13, color: "#4f46e5", fontWeight: "600" },
  rhythmTextActive: { color: "#fff", fontWeight: "bold" },
  
  simulateBtn: { marginTop: 24, padding: 12, backgroundColor: "#10b981", borderRadius: 8, alignItems: "center" },
  simulateText: { color: "#fff", fontWeight: "bold" },

  historyHeader: { fontSize: 18, fontWeight: "bold", color: "#312e81", marginBottom: 12 },
  historyCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#4f46e5" },
  historyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  timestamp: { fontSize: 14, fontWeight: "600", color: "#3730a3" },
  status: { fontSize: 12, fontWeight: "bold", color: "#10b981" },
  statsText: { fontSize: 14, color: "#4f46e5", marginTop: 4 },
  empty: { color: "#6366f1", fontStyle: "italic", marginTop: 12 }
});
