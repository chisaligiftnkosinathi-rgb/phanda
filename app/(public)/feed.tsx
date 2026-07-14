import React, { useCallback } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useOpportunities } from "../../src/hooks/useOpportunities";
import { UIOpportunity } from "../../src/services/opportunityService";

export default function FeedScreen() {
  const router = useRouter();
  const { data, loading, error, refresh } = useOpportunities();

  const getBorderColor = useCallback((state: string) => {
    switch (state) {
      case "trusted":
        return "#00C853";
      case "activated":
        return "#2196F3";
      case "registered":
        return "#FFC107";
      default:
        return "#9E9E9E";
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: UIOpportunity }) => (
      <Pressable
        onPress={() => router.push(`/(public)/opportunity/${item.id}` as const)}
        style={[
          styles.card,
          { borderColor: getBorderColor(item.visibility_state) },
        ]}
      >
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardText}>Creator: {item.creator_name}</Text>
        <Text style={styles.cardText}>Trust: {item.creator_trust_score}/100</Text>
        <Text style={styles.cardText}>Feed Score: {item.feed_score}</Text>
        <Text style={styles.cardText}>Proofs: {item.proof_count}</Text>
      </Pressable>
    ),
    [router, getBorderColor]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Trust Feed</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : loading && (!data || data.length === 0) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={refresh}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No opportunities found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  card: {
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 2,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  retryText: {
    color: "#111827",
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 24,
    fontSize: 15,
  },
});