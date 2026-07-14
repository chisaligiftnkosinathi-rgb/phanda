import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";

import { useLeadAction } from "../../../src/hooks/useLeadAction";
import { Permission } from '@/features/auth';
import { TrustPermissionEngine } from '../../../src/services/guards/permissionEngine';

import { useSession } from '@/features/auth';

export default function LeadAction() {
  const { permissions } = useSession();
  const { createLead, loading } = useLeadAction(permissions);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const canCreate = TrustPermissionEngine.canCreateLead(permissions);

  const handleSubmit = async () => {
    if (!title) return Alert.alert("Validation", "Title is required.");
    
    try {
      await createLead({ title, description });
      Alert.alert("Success", "Lead created successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create lead.");
    }
  };

  if (!canCreate) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>You are not authorized to create leads.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create New Lead</Text>

      <TextInput
        style={styles.input}
        placeholder="Lead Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Lead</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 16 },
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#1976D2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  }
});
