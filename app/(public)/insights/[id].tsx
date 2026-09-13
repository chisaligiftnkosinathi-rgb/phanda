import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useInsight } from "../../../src/hooks/useInsight";

export default function InsightDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useInsight(id);

  if (loading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </View>
    );
  }

  const getTrendIcon = (direction: string) => {
    switch(direction) {
      case "improving": return "↗️ Improving";
      case "declining": return "↘️ Declining";
      default: return "➡️ Stable";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.type}>{data.type.replace('_', ' ').toUpperCase()}</Text>
        <Text style={styles.trend}>{getTrendIcon(data.trendDirection)}</Text>
      </View>

      <Text style={styles.title}>{data.title}</Text>
      
      <View style={styles.messageBox}>
        <Text style={styles.desc}>{data.description}</Text>
      </View>

      <View style={styles.metricsBox}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Signal Strength</Text>
          <Text style={styles.metricValue}>{(data.signalStrength * 100).toFixed(0)}%</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Confidence</Text>
          <Text style={styles.metricValue}>{(data.confidence * 100).toFixed(0)}%</Text>
        </View>
      </View>

      <View style={styles.sourceContainer}>
        <Text style={styles.sourceHeader}>Contributing Entity Graph</Text>
        <Text style={styles.sourceSub}>These sources were observed to compute this insight.</Text>
        
        {data.sources.workIds && data.sources.workIds.length > 0 && (
          <Text style={styles.sourceItem}>Execution (Work): {data.sources.workIds.length} items</Text>
        )}
        {data.sources.leadIds && data.sources.leadIds.length > 0 && (
          <Text style={styles.sourceItem}>Opportunities (Leads): {data.sources.leadIds.length} items</Text>
        )}
        {data.sources.campaignIds && data.sources.campaignIds.length > 0 && (
          <Text style={styles.sourceItem}>Broadcasts (Campaigns): {data.sources.campaignIds.length} items</Text>
        )}

        {Object.values(data.sources).every(arr => !arr || arr.length === 0) && (
          <Text style={styles.emptySource}>No explicit sources mapped.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1, padding: 16, backgroundColor: "#f5f3ff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  type: { fontSize: 14, fontWeight: "700", color: "#6d28d9" },
  trend: { fontSize: 14, fontWeight: "bold", color: "#4c1d95" },
  title: { fontSize: 28, fontWeight: "bold", color: "#4c1d95", marginBottom: 24 },
  messageBox: {
    backgroundColor: "#fff", padding: 24, borderRadius: 8, 
    borderWidth: 1, borderColor: "#ddd6fe"
  },
  desc: { fontSize: 18, color: "#5b21b6", lineHeight: 28 },
  metricsBox: { flexDirection: "row", justifyContent: "space-around", marginTop: 24, padding: 16, backgroundColor: "#ede9fe", borderRadius: 8 },
  metricItem: { alignItems: "center" },
  metricLabel: { fontSize: 12, color: "#6d28d9", fontWeight: "600", textTransform: "uppercase" },
  metricValue: { fontSize: 24, fontWeight: "bold", color: "#4c1d95", marginTop: 4 },
  sourceContainer: { marginTop: 40, paddingHorizontal: 8, paddingBottom: 40 },
  sourceHeader: { fontSize: 16, fontWeight: "bold", color: "#4c1d95" },
  sourceSub: { fontSize: 13, color: "#7c3aed", marginBottom: 16 },
  sourceItem: { fontSize: 14, color: "#5b21b6", marginBottom: 8, backgroundColor: "#ede9fe", padding: 8, borderRadius: 4 },
  emptySource: { fontSize: 14, color: "#a78bfa", fontStyle: "italic" }
});
