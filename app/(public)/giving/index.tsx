import React from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useGiving } from "../../../src/hooks/useGiving";

export default function GivingFeedScreen() {
  const router = useRouter();
  const userId = "test-user"; // Mocked for now
  const { data, loading, refresh } = useGiving(userId);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Value Expressions</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/giving/${item.id}`)}
          >
            <Text style={styles.title}>{item.type.toUpperCase()}</Text>
            {item.message ? (
              <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            ) : null}
            {item.value && (
              <Text style={styles.symbolicValue}>
                Symbolic Value: {item.value.currency} {item.value.amount}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No giving expressions found.</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: "#faf5ff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#4c1d95" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#a855f7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#6b21a8" },
  message: { fontSize: 14, color: "#4b5563", marginTop: 8 },
  symbolicValue: { fontSize: 14, fontWeight: "600", color: "#059669", marginTop: 8 },
  emptyContainer: { alignItems: "center", marginTop: 40 },
  empty: { color: "#6b7280", fontSize: 16 },
  refreshBtn: { marginTop: 12, padding: 12, backgroundColor: "#a855f7", borderRadius: 8 },
  refreshText: { color: "#fff", fontWeight: "600" }
});
