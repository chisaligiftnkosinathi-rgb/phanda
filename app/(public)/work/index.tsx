import React from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { useWorks } from "../../../src/hooks/useWorks";
import { useRouter } from "expo-router";

export default function WorkFeedScreen() {
  const { data, loading, error, refresh } = useWorks();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load work: {error.message}</Text>
        <TouchableOpacity onPress={refresh} style={styles.button}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Job Cards / Work Feed</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/work/${item.id}`)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.type.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.status}>Status: {item.status.replace('_', ' ').toUpperCase()}</Text>
            {item.assignedTo && (
              <Text style={styles.detail}>Assigned to: {item.assignedTo}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No work tasks pending.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#111" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "600", color: "#222" },
  subtitle: { fontSize: 12, color: "#666", marginTop: 4 },
  status: { fontSize: 14, fontWeight: "500", marginTop: 8, color: "#444" },
  detail: { fontSize: 14, color: "#555", marginTop: 4 },
  error: { color: "red", marginBottom: 12 },
  empty: { textAlign: "center", color: "#666", marginTop: 24 },
  button: { backgroundColor: "#2563eb", padding: 12, borderRadius: 6 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
