import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ResumeSystemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>System Resuming</Text>
      
      <View style={styles.resumeBox}>
        <Text style={styles.successText}>
          Human arbitration received and logged for halt state: {id}
        </Text>
        <Text style={styles.resumeLog}>
          [F] Branch selected.{"\n"}
          [F] Audit trace signed.{"\n"}
          [F] Releasing execution lock...{"\n"}
          [A+] Physics engine resuming.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.btn}
        onPress={() => router.push("/override")}
      >
        <Text style={styles.btnText}>Return to Arbitration Queue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fef2f2", justifyContent: "center" },
  header: { fontSize: 26, fontWeight: "bold", color: "#7f1d1d", textAlign: "center", marginBottom: 24 },
  
  resumeBox: { backgroundColor: "#1e1b4b", padding: 20, borderRadius: 12, marginBottom: 24 },
  successText: { fontSize: 14, color: "#4ade80", fontWeight: "bold", marginBottom: 16 },
  resumeLog: { color: "#ddd6fe", fontFamily: "monospace", fontSize: 13, lineHeight: 22 },
  
  btn: { backgroundColor: "#b91c1c", padding: 16, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});
