import React from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useCampaigns } from "../../../src/hooks/useCampaigns";

export default function CampaignFeedScreen() {
  const router = useRouter();
  const { data, loading, refresh } = useCampaigns();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meaning Broadcasts</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/campaigns/${item.id}`)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.type}>{item.type.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
            <View style={styles.metrics}>
              <Text style={styles.metricText}>👁 {item.impressions}</Text>
              <Text style={styles.metricText}>❤️ {item.reactions}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No campaigns broadcasting right now.</Text>
            <TouchableOpacity onPress={refresh} style={styles.refreshBtn}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1, padding: 16, backgroundColor: "#fff1f2" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#9f1239" },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f43f5e",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#881337" },
  type: { fontSize: 12, color: "#fb7185", marginTop: 4, fontWeight: "600" },
  message: { fontSize: 15, color: "#4c0519", marginTop: 12, lineHeight: 22 },
  metrics: { flexDirection: "row", marginTop: 16, gap: 16 },
  metricText: { fontSize: 14, color: "#9f1239" },
  emptyContainer: { alignItems: "center", marginTop: 40 },
  empty: { color: "#9f1239", fontSize: 16 },
  refreshBtn: { marginTop: 12, padding: 12, backgroundColor: "#f43f5e", borderRadius: 8 },
  refreshText: { color: "#fff", fontWeight: "600" }
});
