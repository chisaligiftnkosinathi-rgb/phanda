import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useScriptureAction } from "../../../src/hooks/useScriptureAction";
import { UIScriptureOriginType } from "../../../src/types/scripture.types";

const ORIGIN_TYPES: UIScriptureOriginType[] = ["reflection", "work", "campaign", "giving", "system"];

export default function CreateScriptureScreen() {
  const router = useRouter();
  const { elevate, loading, error } = useScriptureAction();

  const [originType, setOriginType] = useState<UIScriptureOriginType>("reflection");
  const [originId, setOriginId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const handleElevate = async () => {
    try {
      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
      const result = await elevate(originType, originId, title, content, tags);
      router.push(`/scripture/${result.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Elevate to Canon</Text>
      <Text style={styles.subtitle}>Extract meaning from an origin source to freeze it as interpretation law.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Origin Source Type</Text>
        <View style={styles.typeSelector}>
          {ORIGIN_TYPES.map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeBadge, originType === t && styles.typeBadgeActive]}
              onPress={() => setOriginType(t)}
            >
              <Text style={[styles.typeText, originType === t && styles.typeTextActive]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Origin ID (Reference)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. ref_123 or work_456"
          value={originId}
          onChangeText={setOriginId}
        />

        <Text style={styles.label}>Canonical Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. The Value of Patience"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Stabilized Meaning (Content)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What is the eternal truth here?"
          multiline
          numberOfLines={6}
          value={content}
          onChangeText={setContent}
        />
        
        <Text style={styles.label}>Tags (comma-separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. core_value, learning, speed"
          value={tagsInput}
          onChangeText={setTagsInput}
        />

        {error && <Text style={styles.error}>{error.message}</Text>}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleElevate}
          disabled={loading || !title || !content || !originId}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Extract & Stabilize</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fffbeb" },
  header: { fontSize: 28, fontWeight: "bold", color: "#78350f" },
  subtitle: { fontSize: 14, color: "#d97706", marginTop: 4, marginBottom: 24 },
  form: { marginTop: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#92400e", marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: "#fde68a", borderRadius: 8, padding: 12,
    fontSize: 16, backgroundColor: "#fff"
  },
  textArea: { minHeight: 120, textAlignVertical: "top" },
  typeSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeBadge: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: "#fef3c7", borderWidth: 1, borderColor: "#fde68a"
  },
  typeBadgeActive: { backgroundColor: "#f59e0b", borderColor: "#d97706" },
  typeText: { fontSize: 13, color: "#b45309", fontWeight: "600" },
  typeTextActive: { color: "#fff", fontWeight: "bold" },
  button: {
    backgroundColor: "#d97706", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 32
  },
  buttonDisabled: { backgroundColor: "#fcd34d" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  error: { color: "red", marginTop: 8 }
});
