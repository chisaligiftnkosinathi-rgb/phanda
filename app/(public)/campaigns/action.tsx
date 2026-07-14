import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useCampaignAction } from "../../../src/hooks/useCampaignAction";
import { UICampaignType } from "../../../src/types/campaign.types";

const CAMPAIGN_TYPES: UICampaignType[] = [
  "announcement", "gratitude_story", "reflection_share", "service_highlight", "inspiration"
];

export default function CreateCampaignScreen() {
  const router = useRouter();
  const { create, loading, error } = useCampaignAction();

  const [type, setType] = useState<UICampaignType>("announcement");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleBroadcast = async () => {
    try {
      const result = await create({
        ownerId: "test-user", // Mock user
        title,
        type,
        message,
        // Context IDs could be attached here via a picker UI
        reflectionIds: [],
        givingIds: [],
        workIds: []
      });
      router.push(`/campaigns/${result.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Broadcast Meaning</Text>
      <Text style={styles.subtitle}>Distribute narratives without creating obligations.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Campaign Type</Text>
        <View style={styles.typeSelector}>
          {CAMPAIGN_TYPES.map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeBadge, type === t && styles.typeBadgeActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                {t.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. My Journey this Month"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Share your story..."
          multiline
          numberOfLines={6}
          value={message}
          onChangeText={setMessage}
        />

        {error && <Text style={styles.error}>{error.message}</Text>}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleBroadcast}
          disabled={loading || !title || !message}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Publish Broadcast</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff1f2" },
  header: { fontSize: 28, fontWeight: "bold", color: "#881337" },
  subtitle: { fontSize: 14, color: "#9f1239", marginTop: 4, marginBottom: 24 },
  form: { marginTop: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#4c0519", marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: "#fda4af", borderRadius: 8, padding: 12,
    fontSize: 16, backgroundColor: "#fff"
  },
  textArea: { minHeight: 120, textAlignVertical: "top" },
  typeSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeBadge: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: "#ffe4e6", borderWidth: 1, borderColor: "#fecdd3"
  },
  typeBadgeActive: { backgroundColor: "#f43f5e", borderColor: "#e11d48" },
  typeText: { fontSize: 13, color: "#be123c", fontWeight: "600" },
  typeTextActive: { color: "#fff", fontWeight: "bold" },
  button: {
    backgroundColor: "#e11d48", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 32
  },
  buttonDisabled: { backgroundColor: "#fb7185" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  error: { color: "red", marginTop: 8 }
});
