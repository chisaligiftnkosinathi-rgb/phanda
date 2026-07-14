import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useScripture } from "../../../src/hooks/useScripture";
import { useScriptureAction } from "../../../src/hooks/useScriptureAction";

export default function ScriptureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading: loadingData } = useScripture(id);
  const { lock, loading: locking } = useScriptureAction();

  if (loadingData || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  const handleLock = async () => {
    if (data.locked) return;
    try {
      await lock(data.id);
      // the useScripture hook would ideally refresh, but for now we expect a re-render or reload
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.originType}>{data.originType.toUpperCase()}</Text>
        {data.locked ? (
          <Text style={styles.lockStatus}>🔒 IMMUTABLE</Text>
        ) : (
          <Text style={styles.unlockedStatus}>🔓 EDITABLE</Text>
        )}
      </View>

      <Text style={styles.title}>{data.title}</Text>
      
      <View style={styles.messageBox}>
        <Text style={styles.content}>{data.content}</Text>
      </View>

      <View style={styles.metadataContainer}>
        {data.tags && data.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {data.tags.map(t => (
              <Text key={t} style={styles.tag}>#{t}</Text>
            ))}
          </View>
        )}

        {data.originId && (
          <Text style={styles.originLink}>Source Reference: {data.originId}</Text>
        )}
        
        <Text style={styles.weight}>Canonical Weight: {data.weight}</Text>
      </View>

      {!data.locked && (
        <TouchableOpacity 
          style={[styles.lockBtn, locking && styles.btnDisabled]}
          onPress={handleLock}
          disabled={locking}
        >
          {locking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.lockBtnText}>Freeze Interpretation (Lock)</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1, padding: 16, backgroundColor: "#fffbeb" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  originType: { fontSize: 14, fontWeight: "700", color: "#b45309" },
  lockStatus: { fontSize: 14, fontWeight: "bold", color: "#991b1b" },
  unlockedStatus: { fontSize: 14, fontWeight: "bold", color: "#059669" },
  title: { fontSize: 28, fontWeight: "bold", color: "#78350f", marginBottom: 24 },
  messageBox: {
    backgroundColor: "#fff", padding: 24, borderRadius: 8, 
    borderWidth: 1, borderColor: "#fde68a"
  },
  content: { fontSize: 18, color: "#92400e", lineHeight: 28 },
  metadataContainer: { marginTop: 24 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  tag: { fontSize: 14, color: "#b45309", backgroundColor: "#fef3c7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  originLink: { fontSize: 14, color: "#78350f", fontStyle: "italic", marginBottom: 8 },
  weight: { fontSize: 14, color: "#78350f", fontWeight: "600" },
  lockBtn: {
    backgroundColor: "#991b1b", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 40
  },
  btnDisabled: { backgroundColor: "#fca5a5" },
  lockBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
