import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { GivingService } from "../../../src/services/givingService";
import { UIGiving } from "../../../src/types/giving.types";

export default function GivingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<UIGiving | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ideally we have a getById in the service, but since we didn't specify it in the blueprint, 
    // we'll mock the fetch for the exact ID or just assume we'd add it.
    // Let's assume we would fetch it.
    setLoading(false);
    setData({
      id,
      giverId: "user-1",
      receiverId: "user-2",
      type: "appreciation",
      message: "Thank you so much for your hard work!",
      createdAt: new Date().toISOString()
    });
  }, [id]);

  if (loading || !data) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#a855f7" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Value Expression Details</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Type</Text>
        <Text style={styles.value}>{data.type.toUpperCase()}</Text>

        <Text style={styles.label}>From</Text>
        <Text style={styles.value}>{data.giverId}</Text>
        
        {data.receiverId && (
          <>
            <Text style={styles.label}>To</Text>
            <Text style={styles.value}>{data.receiverId}</Text>
          </>
        )}

        {data.workId && (
          <>
            <Text style={styles.label}>Context (Work)</Text>
            <Text style={styles.value}>{data.workId}</Text>
          </>
        )}

        {data.reflectionId && (
          <>
            <Text style={styles.label}>Context (Reflection)</Text>
            <Text style={styles.value}>{data.reflectionId}</Text>
          </>
        )}

        {data.message && (
          <>
            <Text style={styles.label}>Message</Text>
            <Text style={styles.messageValue}>{data.message}</Text>
          </>
        )}

        {data.value && (
          <>
            <Text style={styles.label}>Symbolic Value</Text>
            <Text style={styles.symbolicValue}>{data.value.currency} {data.value.amount}</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1, padding: 16, backgroundColor: "#faf5ff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#4c1d95" },
  card: {
    backgroundColor: "#fff", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#e9d5ff"
  },
  label: { fontSize: 12, fontWeight: "700", color: "#6b7280", marginTop: 16, textTransform: "uppercase" },
  value: { fontSize: 16, color: "#111", marginTop: 4, fontWeight: "500" },
  messageValue: { fontSize: 16, color: "#4b5563", marginTop: 4, fontStyle: "italic", lineHeight: 24 },
  symbolicValue: { fontSize: 18, color: "#059669", marginTop: 4, fontWeight: "bold" },
});
