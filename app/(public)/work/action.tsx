import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useWorkAction } from "../../../src/hooks/useWorkAction";
import { useAuth, useSession } from "@/features/auth";

export default function WorkActionScreen() {
  const router = useRouter();
  
  const { permissions } = useSession();
  const { createFromInvoice, loading, error } = useWorkAction(permissions);

  const [invoiceId, setInvoiceId] = useState("");

  const handleCreateWork = async () => {
    if (!invoiceId.trim()) return;

    try {
      const newWork = await createFromInvoice(invoiceId);
      // Navigate to the newly created work details
      router.push(`/work/${newWork.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Initialize Work</Text>
      <Text style={styles.subtitle}>Spawn execution tracking from an approved Invoice.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Source Invoice ID</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. inv_123456"
          value={invoiceId}
          onChangeText={setInvoiceId}
        />

        {error && <Text style={styles.error}>{error.message}</Text>}

        <TouchableOpacity 
          style={[styles.button, (!invoiceId || loading) && styles.buttonDisabled]}
          onPress={handleCreateWork}
          disabled={!invoiceId || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Spawn Work</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", color: "#111" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8, marginBottom: 32 },
  form: { marginTop: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 16,
    fontSize: 16, marginBottom: 24, backgroundColor: "#f9fafb"
  },
  button: {
    backgroundColor: "#10b981", padding: 16, borderRadius: 8, alignItems: "center"
  },
  buttonDisabled: { backgroundColor: "#6ee7b7" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: "red", marginBottom: 16 },
});

