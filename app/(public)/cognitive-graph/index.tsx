import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useCognitiveGraph } from "../../../src/hooks/useCognitiveGraph";
import { CGNode } from "../../../src/types/cognitiveGraph.types";

export default function CognitiveGraphExplorer() {
  const router = useRouter();
  const { nodes, edges, loading, refresh } = useCognitiveGraph();

  if (loading && nodes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0369a1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cognitive Memory Graph</Text>
      <Text style={styles.subtitle}>Traceable history of meaning and intelligence.</Text>
      
      <View style={styles.statsCard}>
        <Text style={styles.statsText}>Total Nodes (Memory Anchors): {nodes.length}</Text>
        <Text style={styles.statsText}>Total Edges (Causal Links): {edges.length}</Text>
      </View>

      <Text style={styles.listTitle}>Memory Explorer</Text>
      
      <FlatList
        data={nodes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.nodeCard}
            onPress={() => router.push(`/cognitive-graph/trace?nodeId=${item.id}`)}
          >
            <View style={styles.nodeHeader}>
              <Text style={styles.nodeType}>{item.type}</Text>
              <Text style={styles.nodeTime}>{new Date(item.timestamp).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.nodeLabel}>{item.label}</Text>
            <Text style={styles.tracePrompt}>Trace Causal Origin ➔</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>The memory graph is currently empty.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#f0f9ff" },
  header: { fontSize: 26, fontWeight: "bold", color: "#0c4a6e" },
  subtitle: { fontSize: 14, color: "#0284c7", marginBottom: 20 },
  
  statsCard: { backgroundColor: "#e0f2fe", padding: 16, borderRadius: 8, marginBottom: 24, borderWidth: 1, borderColor: "#bae6fd" },
  statsText: { fontSize: 16, color: "#0369a1", fontWeight: "600", marginBottom: 4 },
  
  listTitle: { fontSize: 18, fontWeight: "bold", color: "#0c4a6e", marginBottom: 12 },
  nodeCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#0284c7", elevation: 2 },
  nodeHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  nodeType: { fontSize: 12, fontWeight: "700", color: "#0369a1", textTransform: "uppercase" },
  nodeTime: { fontSize: 12, color: "#94a3b8" },
  nodeLabel: { fontSize: 16, color: "#0f172a", fontWeight: "500", marginBottom: 12 },
  tracePrompt: { fontSize: 13, color: "#0284c7", fontWeight: "bold", textAlign: "right" },
  empty: { color: "#0284c7", fontStyle: "italic", marginTop: 12 }
});
