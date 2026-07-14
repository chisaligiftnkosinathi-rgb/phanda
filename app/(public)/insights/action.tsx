import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useInsightAction } from "../../../src/hooks/useInsightAction";

export default function RecomputeInsightScreen() {
  const router = useRouter();
  const { recompute, loading, error } = useInsightAction();

  const handleRecompute = async () => {
    try {
      await recompute();
      // On success, go back to the feed
      router.push("/insights");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Recompute Intelligence</Text>
      <Text style={styles.subtitle}>Trigger the meta-cognition layer to sweep World A and World B for new patterns.</Text>

      <View style={styles.form}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            This action will analyze all uncomputed Execution (Work, Leads, Invoices) and Meaning (Reflections, Campaigns, Giving, Scripture) data to derive new System Insights.
          </Text>
          <Text style={[styles.infoText, { marginTop: 16, fontWeight: "bold", color: "#4c1d95" }]}>
            It will NOT modify any origin data.
          </Text>
        </View>

        {error && <Text style={styles.error}>{error.message}</Text>}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRecompute}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Run Pattern Derivation Pipeline</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f3ff" },
  header: { fontSize: 28, fontWeight: "bold", color: "#4c1d95" },
  subtitle: { fontSize: 14, color: "#7c3aed", marginTop: 4, marginBottom: 24 },
  form: { marginTop: 8 },
  infoBox: { backgroundColor: "#ede9fe", padding: 20, borderRadius: 8, borderWidth: 1, borderColor: "#ddd6fe" },
  infoText: { fontSize: 15, color: "#5b21b6", lineHeight: 22 },
  button: {
    backgroundColor: "#6d28d9", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 40
  },
  buttonDisabled: { backgroundColor: "#a78bfa" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  error: { color: "red", marginTop: 16, textAlign: "center" }
});
