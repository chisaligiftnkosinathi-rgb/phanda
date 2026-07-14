import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function IntentDeepTraceScreen() {
  const { intentId } = useLocalSearchParams<{ intentId: string }>();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Intent Deep Trace</Text>
      <Text style={styles.subtitle}>Intent Ref: {intentId}</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          World E measures the alignment distance of this human intent across all lower layers.
          It flags drift without executing corrective commands.
        </Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Alignment Trace (Cross-Layer)</Text>
        
        <View style={styles.layerRow}>
          <Text style={styles.layerName}>World A+ (Physics)</Text>
          <Text style={styles.layerStatusAligned}>ALIGNED</Text>
        </View>
        <Text style={styles.layerNote}>Constraint execution strictly honors intent boundaries.</Text>

        <View style={styles.layerRow}>
          <Text style={styles.layerName}>World C++ (Contradiction)</Text>
          <Text style={styles.layerStatusAligned}>ALIGNED</Text>
        </View>
        <Text style={styles.layerNote}>No truth tension detected violating this intent.</Text>

        <View style={styles.layerRow}>
          <Text style={styles.layerName}>World D (Evolution)</Text>
          <Text style={styles.layerStatusDrifting}>DRIFTING</Text>
        </View>
        <Text style={styles.layerNote}>Recent proposals suggest relaxing constraints bounded by this intent.</Text>
      </View>

      <View style={styles.enforcementCard}>
        <Text style={styles.enforcementTitle}>Rule Binding Configuration</Text>
        <Text style={styles.enforcementText}>
          Enforcement Mode: <Text style={{fontWeight: 'bold', color: '#b91c1c'}}>ADVISORY</Text>{"\n"}
          This intent acts as a scoring reference rather than a hard execution block.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0fdfa" },
  header: { fontSize: 26, fontWeight: "bold", color: "#115e59" },
  subtitle: { fontSize: 13, color: "#0f766e", marginBottom: 20, fontFamily: "monospace" },
  
  infoBox: { backgroundColor: "#ccfbf1", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "#99f6e4", marginBottom: 24 },
  infoText: { fontSize: 14, color: "#0f766e", lineHeight: 22, fontStyle: "italic", fontWeight: "bold" },

  detailCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#99f6e4", marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#115e59", marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f0fdfa", paddingBottom: 8 },
  
  layerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  layerName: { fontSize: 15, fontWeight: "bold", color: "#134e4a" },
  layerStatusAligned: { fontSize: 13, fontWeight: "bold", color: "#15803d" },
  layerStatusDrifting: { fontSize: 13, fontWeight: "bold", color: "#ca8a04" },
  layerNote: { fontSize: 13, color: "#0f766e", marginTop: 4, fontStyle: "italic", marginBottom: 8 },

  enforcementCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#fecaca", marginTop: 8 },
  enforcementTitle: { fontSize: 14, fontWeight: "bold", color: "#991b1b", marginBottom: 8 },
  enforcementText: { fontSize: 14, color: "#7f1d1d", lineHeight: 22 }
});
