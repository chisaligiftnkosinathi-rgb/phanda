import React from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useScriptures } from "../../../src/hooks/useScriptures";

export default function ScriptureFeedScreen() {
  const router = useRouter();
  const { data, loading, refresh } = useScriptures();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Canon Feed</Text>
      <Text style={styles.subtitle}>Stabilized interpretations of the system.</Text>
      
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, item.locked && styles.lockedCard]}
            onPress={() => router.push(`/scripture/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.originType}>{item.originType.toUpperCase()}</Text>
              {item.locked && <Text style={styles.lockIcon}>🔒</Text>}
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content} numberOfLines={3}>{item.content}</Text>
            
            {item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.map(t => (
                  <Text key={t} style={styles.tag}>#{t}</Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No truth stabilized yet.</Text>
            <TouchableOpacity onPress={refresh} style={styles.refreshBtn}>
              <Text style={styles.refreshText}>Refresh Canon</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1, padding: 16, backgroundColor: "#fffbeb" },
  header: { fontSize: 26, fontWeight: "bold", color: "#b45309" },
  subtitle: { fontSize: 14, color: "#d97706", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lockedCard: { borderLeftColor: "#b45309" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  originType: { fontSize: 12, fontWeight: "700", color: "#d97706" },
  lockIcon: { fontSize: 14 },
  title: { fontSize: 18, fontWeight: "700", color: "#78350f", marginTop: 8 },
  content: { fontSize: 15, color: "#92400e", marginTop: 8, lineHeight: 22 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  tag: { fontSize: 12, color: "#b45309", backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  emptyContainer: { alignItems: "center", marginTop: 40 },
  empty: { color: "#b45309", fontSize: 16 },
  refreshBtn: { marginTop: 12, padding: 12, backgroundColor: "#d97706", borderRadius: 8 },
  refreshText: { color: "#fff", fontWeight: "600" }
});
