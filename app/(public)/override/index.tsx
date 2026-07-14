import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useHumanOverrides } from "../../../src/hooks/useHumanOverrides";

export default function OverrideConsole() {
  const router = useRouter();
  const { overrides, loading } = useHumanOverrides();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#b91c1c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Human Arbitration Layer</Text>
      <Text style={styles.subtitle}>World F: Conscious Override Release Valve</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          The system can stop itself, but only a human can choose the next continuation path.
          World F does NOT decide anything. It only exposes frozen decision points created elsewhere.
        </Text>
      </View>

      <Text style={styles.listTitle}>System Halt Queue</Text>
      
      <FlatList
        data={overrides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.overrideCard}
            onPress={() => router.push(`/override/${item.id}`)}
          >
            <View style={styles.haltHeader}>
              <Text style={styles.haltTitle}>HALTED STATE: {item.id}</Text>
              <Text style={styles.haltTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </View>
            
            <Text style={styles.haltReason}>{item.haltReason}</Text>
            
            <View style={styles.optionsPrompt}>
              <Text style={styles.optionsCount}>{item.options.length} resolution paths available</Text>
              <Text style={styles.resolvePrompt}>Provide Sovereign Arbitration ➔</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No halted states requiring human arbitration.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#fef2f2" },
  header: { fontSize: 26, fontWeight: "bold", color: "#7f1d1d" },
  subtitle: { fontSize: 14, color: "#b91c1c", marginBottom: 24 },
  
  infoCard: { backgroundColor: "#fee2e2", padding: 16, borderRadius: 8, marginBottom: 24, borderWidth: 1, borderColor: "#fecaca" },
  infoText: { fontSize: 13, color: "#991b1b", fontStyle: "italic", lineHeight: 20, fontWeight: "bold" },

  listTitle: { fontSize: 18, fontWeight: "bold", color: "#991b1b", marginBottom: 12 },
  
  overrideCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "#fecaca", elevation: 2 },
  haltHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  haltTitle: { fontSize: 14, fontWeight: "800", color: "#7f1d1d" },
  haltTime: { fontSize: 12, color: "#991b1b" },
  
  haltReason: { fontSize: 15, color: "#b91c1c", fontWeight: "bold", marginBottom: 16 },
  
  optionsPrompt: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#fee2e2", paddingTop: 12 },
  optionsCount: { fontSize: 13, color: "#991b1b", fontWeight: "600" },
  resolvePrompt: { fontSize: 13, color: "#dc2626", fontWeight: "bold" },
  
  empty: { color: "#b91c1c", fontStyle: "italic", marginTop: 12 }
});
