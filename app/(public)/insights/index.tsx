import React from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useInsights } from "../../../src/hooks/useInsights";

export default function InsightFeedScreen() {
  const router = useRouter();
  const { data, loading, refresh } = useInsights();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </View>
    );
  }

  const getTrendIcon = (direction: string) => {
    switch(direction) {
      case "improving": return "↗️";
      case "declining": return "↘️";
      default: return "➡️";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>System Intelligence</Text>
      <Text style={styles.subtitle}>Derived patterns across execution and meaning.</Text>
      
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/insights/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.type}>{item.type.replace('_', ' ').toUpperCase()}</Text>
              <Text style={styles.trend}>{getTrendIcon(item.trendDirection)}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            
            <View style={styles.metrics}>
              <Text style={styles.metricText}>Strength: {(item.signalStrength * 100).toFixed(0)}%</Text>
              <Text style={styles.metricText}>Confidence: {(item.confidence * 100).toFixed(0)}%</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No patterns derived yet.</Text>
            <TouchableOpacity onPress={refresh} style={styles.refreshBtn}>
              <Text style={styles.refreshText}>Refresh Insights</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1, padding: 16, backgroundColor: "#f5f3ff" },
  header: { fontSize: 26, fontWeight: "bold", color: "#4c1d95" },
  subtitle: { fontSize: 14, color: "#7c3aed", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  type: { fontSize: 12, fontWeight: "700", color: "#6d28d9" },
  trend: { fontSize: 16 },
  title: { fontSize: 18, fontWeight: "700", color: "#4c1d95", marginTop: 8 },
  desc: { fontSize: 15, color: "#5b21b6", marginTop: 8, lineHeight: 22 },
  metrics: { flexDirection: "row", justifyContent: "flex-start", gap: 16, marginTop: 16 },
  metricText: { fontSize: 13, color: "#7c3aed", fontWeight: "600" },
  emptyContainer: { alignItems: "center", marginTop: 40 },
  empty: { color: "#6d28d9", fontSize: 16 },
  refreshBtn: { marginTop: 12, padding: 12, backgroundColor: "#7c3aed", borderRadius: 8 },
  refreshText: { color: "#fff", fontWeight: "600" }
});
