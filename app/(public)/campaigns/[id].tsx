import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCampaign } from "../../../src/hooks/useCampaign";

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useCampaign(id);

  if (loading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.type}>{data.type.replace('_', ' ').toUpperCase()}</Text>
      <Text style={styles.title}>{data.title}</Text>
      
      <View style={styles.messageBox}>
        <Text style={styles.message}>{data.message}</Text>
      </View>

      <View style={styles.metrics}>
        <Text style={styles.metricText}>👁 {data.impressions} Views</Text>
        <Text style={styles.metricText}>❤️ {data.reactions} Reactions</Text>
      </View>

      <View style={styles.contextContainer}>
        <Text style={styles.contextHeader}>Attached Context (Read-Only)</Text>
        
        {data.workIds && data.workIds.length > 0 && (
          <Text style={styles.contextItem}>Execution Trace: {data.workIds.join(", ")}</Text>
        )}
        
        {data.reflectionIds && data.reflectionIds.length > 0 && (
          <Text style={styles.contextItem}>Observation Trace: {data.reflectionIds.join(", ")}</Text>
        )}
        
        {data.givingIds && data.givingIds.length > 0 && (
          <Text style={styles.contextItem}>Value Trace: {data.givingIds.join(", ")}</Text>
        )}

        {(!data.workIds?.length && !data.reflectionIds?.length && !data.givingIds?.length) && (
          <Text style={styles.emptyContext}>No context attached.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1, padding: 16, backgroundColor: "#fff1f2" },
  type: { fontSize: 12, fontWeight: "700", color: "#f43f5e", marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "bold", color: "#881337", marginBottom: 24 },
  messageBox: {
    backgroundColor: "#fff", padding: 24, borderRadius: 12, 
    borderWidth: 1, borderColor: "#fecdd3"
  },
  message: { fontSize: 18, color: "#4c0519", lineHeight: 28 },
  metrics: { flexDirection: "row", marginTop: 24, gap: 24, paddingHorizontal: 8 },
  metricText: { fontSize: 16, color: "#be123c", fontWeight: "600" },
  
  contextContainer: { marginTop: 40, paddingHorizontal: 8 },
  contextHeader: { fontSize: 16, fontWeight: "bold", color: "#881337", marginBottom: 12 },
  contextItem: { fontSize: 14, color: "#9f1239", marginBottom: 6 },
  emptyContext: { fontSize: 14, color: "#fda4af", fontStyle: "italic" }
});
