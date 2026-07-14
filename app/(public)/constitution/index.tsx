import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useConstitution } from "../../../src/hooks/useConstitution";

export default function ConstitutionConsole() {
  const router = useRouter();
  const { constitution, loading } = useConstitution();

  if (loading || !constitution) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e1b4b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>The Constitution</Text>
          <Text style={styles.subtitle}>World G: Immutable Principles {constitution.version}</Text>
        </View>
        <TouchableOpacity style={styles.amendBtn} onPress={() => router.push("/constitution/amendments")}>
          <Text style={styles.amendText}>Amendments</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.preambleCard}>
        <Text style={styles.preambleTitle}>Preamble</Text>
        <Text style={styles.preambleText}>{constitution.preamble}</Text>
      </View>

      <Text style={styles.listTitle}>Constitutional Articles</Text>
      
      <FlatList
        data={constitution.articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.articleCard}
            onPress={() => router.push(`/constitution/${item.id}`)}
          >
            <View style={styles.articleHeader}>
              <Text style={styles.articleId}>{item.id.replace('_', ' ')}</Text>
            </View>
            <Text style={styles.articleTitle}>{item.title}</Text>
            <Text style={styles.tracePrompt}>View Clauses & Violations ➔</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#e0e7ff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  header: { fontSize: 26, fontWeight: "bold", color: "#1e3a8a" },
  subtitle: { fontSize: 14, color: "#3730a3", fontWeight: "bold" },
  amendBtn: { backgroundColor: "#c7d2fe", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: "#a5b4fc" },
  amendText: { color: "#312e81", fontWeight: "bold", fontSize: 12 },
  
  preambleCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 24, borderLeftWidth: 6, borderLeftColor: "#312e81", elevation: 2 },
  preambleTitle: { fontSize: 14, color: "#312e81", fontWeight: "bold", textTransform: "uppercase", marginBottom: 8 },
  preambleText: { fontSize: 13, color: "#4f46e5", fontStyle: "italic", lineHeight: 20 },
  
  listTitle: { fontSize: 18, fontWeight: "bold", color: "#1e3a8a", marginBottom: 12 },
  
  articleCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "#a5b4fc" },
  articleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  articleId: { fontSize: 12, fontWeight: "700", color: "#4f46e5" },
  
  articleTitle: { fontSize: 18, color: "#1e3a8a", fontWeight: "bold", marginBottom: 12 },
  
  tracePrompt: { fontSize: 12, color: "#4338ca", fontWeight: "bold", textAlign: "right" }
});
