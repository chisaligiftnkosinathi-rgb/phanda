import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ExecutionBlockDetailScreen() {
  const { entityId } = useLocalSearchParams<{ entityId: string }>();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Physics Block Inspector</Text>
      <Text style={styles.subtitle}>Entity Ref: {entityId}</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          This execution was blocked by the Pre-Integrity Constraint Layer (World A+). 
          The attempted transition violates the deterministic rules of the state machine.
        </Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Structural Reason</Text>
        <Text style={styles.reasonText}>
          The transition was rejected due to a missing dependency or invalid state jump.
          World A+ does not interpret intent—it only enforces invariant physics.
        </Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Dependency Graph State</Text>
        <Text style={styles.graphText}>
          [Entity Hash] - Invalid Link Detected {"\n"}
          Requires valid parent entity connection before proceeding.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#eef2ff" },
  header: { fontSize: 26, fontWeight: "bold", color: "#3730a3" },
  subtitle: { fontSize: 13, color: "#4f46e5", marginBottom: 20, fontFamily: "monospace" },
  
  infoBox: { backgroundColor: "#fee2e2", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "#fca5a5", marginBottom: 24 },
  infoText: { fontSize: 14, color: "#991b1b", lineHeight: 22, fontStyle: "italic", fontWeight: "bold" },

  detailCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#e0e7ff", marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#3730a3", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#eef2ff", paddingBottom: 8 },
  reasonText: { fontSize: 15, color: "#312e81", lineHeight: 24 },
  graphText: { fontSize: 13, color: "#4f46e5", fontFamily: "monospace", lineHeight: 20 }
});
