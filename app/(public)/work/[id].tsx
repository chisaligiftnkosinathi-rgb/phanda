import React, { useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, TextInput, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWork } from "../../../src/hooks/useWork";
import { useWorkAction } from "../../../src/hooks/useWorkAction";
import { useReflectionAction } from "../../../src/hooks/useReflectionAction";
import { useAuth, useSession } from "@/features/auth"; // useAuth from AuthContext

export default function WorkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, error } = useWork(id);
  
  const { permissions } = useSession();
  const { updateStatus, completeWork, loading: actionLoading } = useWorkAction(permissions);
  const { submitReflection, loading: reflectionLoading } = useReflectionAction(permissions);

  const [reflectionText, setReflectionText] = useState("");

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load work details.</Text>
      </View>
    );
  }

  const handleComplete = async () => {
    try {
      await completeWork(id);
      // Status will transition to completed in backend, trigger re-render
      // For now, assume it refreshes or we mutate local state
      // We would ideally call refresh() here from a global cache or returned from hook
    } catch (e) {
      console.error(e);
    }
  };

  const handleReflect = async () => {
    try {
      await submitReflection(id, { content: reflectionText });
    } catch (e) {
      console.error(e);
    }
  };

  const isCompleted = data.status === "completed" || data.status === "reflection_pending";
  const isReflected = data.status === "reflected";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.subtitle}>Type: {data.type.replace('_', ' ').toUpperCase()}</Text>
      <Text style={styles.status}>Current Status: {data.status.replace('_', ' ').toUpperCase()}</Text>
      
      {data.description ? <Text style={styles.desc}>{data.description}</Text> : null}

      {!isCompleted && !isReflected && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.button, actionLoading && styles.buttonDisabled]} 
            onPress={handleComplete}
            disabled={actionLoading}
          >
            <Text style={styles.buttonText}>Complete Work</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* THE REFLECTION PROMPT COMPONENT */}
      {isCompleted && (
        <View style={styles.reflectionCard}>
          <Text style={styles.reflectionTitle}>Work Completed. Please Reflect.</Text>
          <Text style={styles.reflectionDesc}>
            Execution is finished. To close this loop, please share your experience and learning. 
            This feeds directly into your Trust Score.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="What went well? What could improve?"
            multiline
            numberOfLines={4}
            value={reflectionText}
            onChangeText={setReflectionText}
          />
          <TouchableOpacity 
            style={[styles.button, actionLoading && styles.buttonDisabled]}
            onPress={handleReflect}
            disabled={actionLoading || !reflectionText.trim()}
          >
            <Text style={styles.buttonText}>Submit Reflection & Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {isReflected && (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Loop Closed.</Text>
          <Text style={styles.successDesc}>Execution completed and reflection captured.</Text>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111" },
  subtitle: { fontSize: 14, color: "#555", marginTop: 4 },
  status: { fontSize: 16, fontWeight: "600", marginTop: 12, color: "#2563eb" },
  desc: { fontSize: 16, marginTop: 16, color: "#333", lineHeight: 24 },
  actions: { marginTop: 32 },
  button: { backgroundColor: "#2563eb", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 12 },
  buttonDisabled: { backgroundColor: "#93c5fd" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: "red", fontSize: 16 },
  reflectionCard: {
    backgroundColor: "#fff", padding: 20, borderRadius: 12, marginTop: 32,
    borderWidth: 2, borderColor: "#e5e7eb"
  },
  reflectionTitle: { fontSize: 18, fontWeight: "bold", color: "#111" },
  reflectionDesc: { fontSize: 14, color: "#666", marginTop: 8, marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12,
    minHeight: 100, textAlignVertical: "top", marginBottom: 16
  },
  successCard: {
    backgroundColor: "#ecfdf5", padding: 20, borderRadius: 12, marginTop: 32,
    borderWidth: 1, borderColor: "#34d399", alignItems: "center"
  },
  successTitle: { fontSize: 18, fontWeight: "bold", color: "#065f46" },
  successDesc: { fontSize: 14, color: "#047857", marginTop: 4 },
});
