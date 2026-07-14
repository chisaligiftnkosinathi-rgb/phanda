import React from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useQuotes } from "../../../src/hooks/useQuotes";
import { UIQuote } from "../../../src/types/quote.types";

export default function QuotesScreen() {
  const { data, loading, error, refresh } = useQuotes();

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
        <Text style={styles.errorText}>Error loading quotes.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: UIQuote }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.value}>
        Total: {item.total.amount} {item.total.currency}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onRefresh={refresh}
        refreshing={loading}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red" },
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  list: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "600" },
  status: { color: "#666", marginTop: 4 },
  value: { color: "#2E7D32", fontWeight: "500", marginTop: 8 },
});
