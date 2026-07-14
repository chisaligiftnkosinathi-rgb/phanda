import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useConstitution } from "../../../src/hooks/useConstitution";
import { useConstitutionViolations } from "../../../src/hooks/useConstitutionViolations";

export default function ArticleDetailScreen() {
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const { constitution, loading } = useConstitution();
  const { violations } = useConstitutionViolations();

  if (loading || !constitution) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e1b4b" />
      </View>
    );
  }

  const article = constitution.articles.find(a => a.id === articleId);
  const articleViolations = violations.filter(v => v.violatedArticleId === articleId);

  if (!article) {
    return (
      <View style={styles.center}>
        <Text>Article not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{article.id.replace('_', ' ')}</Text>
      <Text style={styles.subtitle}>{article.title}</Text>
      
      <View style={styles.clausesCard}>
        <Text style={styles.sectionTitle}>Enforceable Clauses</Text>
        {article.clauses.map((c, idx) => (
          <Text key={c.id} style={styles.clauseText}>
            {idx + 1}. {c.text}
          </Text>
        ))}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Violation Log</Text>
        
        {articleViolations.length === 0 ? (
          <Text style={styles.empty}>No violations recorded against this article.</Text>
        ) : (
          articleViolations.map(v => (
            <View key={v.id} style={styles.violationRow}>
              <View style={styles.vHeader}>
                <Text style={styles.vSource}>Source: World {v.sourceLayer}</Text>
                <Text style={styles.vTime}>{new Date(v.timestamp).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.vDesc}>{v.description}</Text>
            </View>
          ))
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#e0e7ff" },
  header: { fontSize: 26, fontWeight: "bold", color: "#1e3a8a" },
  subtitle: { fontSize: 20, color: "#3730a3", marginBottom: 20 },
  
  clausesCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#a5b4fc", marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#312e81", marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#e0e7ff", paddingBottom: 8 },
  clauseText: { fontSize: 15, color: "#1e3a8a", marginBottom: 12, lineHeight: 22 },

  detailCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#a5b4fc", marginBottom: 16 },
  
  violationRow: { backgroundColor: "#fee2e2", padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#fecaca" },
  vHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  vSource: { fontSize: 12, fontWeight: "bold", color: "#b91c1c" },
  vTime: { fontSize: 12, color: "#991b1b" },
  vDesc: { fontSize: 14, color: "#7f1d1d", fontStyle: "italic" },

  empty: { fontSize: 14, color: "#4338ca", fontStyle: "italic" }
});
