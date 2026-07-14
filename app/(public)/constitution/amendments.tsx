import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useAmendments } from "../../../src/hooks/useAmendments";

export default function AmendmentsScreen() {
  const { amendments, loading } = useAmendments();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e1b4b" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Constitutional Amendments</Text>
      <Text style={styles.subtitle}>Formal Evolution Process</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          The Constitution may only evolve through explicit constitutional amendment. 
          World G defines the immutable rules protecting the OS. No proposal from lower worlds 
          may violate these articles without an approved amendment shown below.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Amendment History</Text>

      {amendments.length === 0 ? (
        <Text style={styles.empty}>No amendments have been proposed or ratified.</Text>
      ) : (
        amendments.map((a) => (
          <View key={a.id} style={styles.amendCard}>
            <View style={styles.aHeader}>
              <Text style={styles.aId}>Ref: {a.id}</Text>
              <Text style={[styles.aStatus, 
                { color: a.status === 'approved' ? '#15803d' : a.status === 'rejected' ? '#b91c1c' : '#ca8a04' }
              ]}>
                {a.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.aTarget}>Targeting: {a.targetArticleId.replace('_', ' ')}</Text>
            
            <View style={styles.clauseBox}>
              <Text style={styles.clauseLabel}>Proposed Clauses:</Text>
              {a.proposedClauses.map((c, idx) => (
                <Text key={idx} style={styles.clauseText}>• {c.text}</Text>
              ))}
            </View>

            <Text style={styles.aJustification}>Justification: {a.justification}</Text>
          </View>
        ))
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#e0e7ff" },
  header: { fontSize: 26, fontWeight: "bold", color: "#1e3a8a" },
  subtitle: { fontSize: 13, color: "#3730a3", marginBottom: 20, fontFamily: "monospace" },
  
  infoBox: { backgroundColor: "#c7d2fe", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "#a5b4fc", marginBottom: 24 },
  infoText: { fontSize: 14, color: "#312e81", lineHeight: 22, fontStyle: "italic", fontWeight: "bold" },

  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1e3a8a", marginBottom: 12 },
  
  amendCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#a5b4fc", marginBottom: 16 },
  aHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  aId: { fontSize: 12, fontWeight: "bold", color: "#4f46e5" },
  aStatus: { fontSize: 12, fontWeight: "bold" },
  
  aTarget: { fontSize: 15, fontWeight: "bold", color: "#1e3a8a", marginBottom: 12 },
  
  clauseBox: { backgroundColor: "#f8fafc", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 12 },
  clauseLabel: { fontSize: 13, fontWeight: "bold", color: "#334155", marginBottom: 6 },
  clauseText: { fontSize: 13, color: "#475569", marginBottom: 4 },
  
  aJustification: { fontSize: 13, color: "#4338ca", fontStyle: "italic" },

  empty: { fontSize: 14, color: "#4338ca", fontStyle: "italic", marginTop: 12 }
});
