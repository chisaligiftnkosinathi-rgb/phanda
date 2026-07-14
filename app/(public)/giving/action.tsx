import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useGiveAction } from "../../../src/hooks/useGiveAction";
import { UIGiveType } from "../../../src/types/giving.types";

const GIVE_TYPES: UIGiveType[] = ["appreciation", "gratitude", "support", "blessing", "gift"];

export default function CreateGivingScreen() {
  const router = useRouter();
  const { submitGive, loading, error } = useGiveAction();

  const [type, setType] = useState<UIGiveType>("appreciation");
  const [message, setMessage] = useState("");
  const [receiverId, setReceiverId] = useState("");

  const handleGive = async () => {
    try {
      const result = await submitGive({
        giverId: "test-user", // Mock user
        receiverId,
        type,
        message,
      });
      router.push(`/giving/${result.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Express Value</Text>
      <Text style={styles.subtitle}>Emit a voluntary expression. This creates no obligations.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Receiver ID (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. user_456"
          value={receiverId}
          onChangeText={setReceiverId}
        />

        <Text style={styles.label}>Type of Expression</Text>
        <View style={styles.typeSelector}>
          {GIVE_TYPES.map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeBadge, type === t && styles.typeBadgeActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Why are you giving this?"
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={setMessage}
        />

        {error && <Text style={styles.error}>{error.message}</Text>}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGive}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Express Value</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#faf5ff" },
  header: { fontSize: 28, fontWeight: "bold", color: "#4c1d95" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4, marginBottom: 24 },
  form: { marginTop: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: "#d8b4fe", borderRadius: 8, padding: 12,
    fontSize: 16, backgroundColor: "#fff"
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  typeSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeBadge: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: "#f3e8ff", borderWidth: 1, borderColor: "#e9d5ff"
  },
  typeBadgeActive: { backgroundColor: "#a855f7", borderColor: "#9333ea" },
  typeText: { fontSize: 14, color: "#6b21a8", fontWeight: "500" },
  typeTextActive: { color: "#fff", fontWeight: "bold" },
  button: {
    backgroundColor: "#9333ea", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 32
  },
  buttonDisabled: { backgroundColor: "#c084fc" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  error: { color: "red", marginTop: 8 }
});
