import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLead } from "../../../src/hooks/useLead";
import { useLeadAction } from "../../../src/hooks/useLeadAction";
import { Permission } from '@/features/auth';
import { TrustPermissionEngine } from '../../../src/services/guards/permissionEngine';

import { useSession } from '@/features/auth';

export default function LeadDetail({ id }: { id: string }) {
  const { data: lead, loading: leadLoading, error } = useLead(id);
  const { permissions } = useSession();
  const { convertToQuote, convertToInvoice, loading: actionLoading } = useLeadAction(permissions);

  if (leadLoading) {
    return <ActivityIndicator size="large" style={styles.center} />;
  }

  if (error || !lead) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not load lead.</Text>
      </View>
    );
  }

  const canConvert = TrustPermissionEngine.canConvertLead(permissions);

  const handleConvertToQuote = async () => {
    try {
      await convertToQuote(lead.id, { items: [] }); // Dummy payload
      Alert.alert("Success", "Converted to Quote!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to convert.");
    }
  };

  const handleConvertToInvoice = async () => {
    try {
      await convertToInvoice(lead.id, { items: [] }); // Dummy payload
      Alert.alert("Success", "Converted to Invoice!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to convert.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{lead.title}</Text>
      <Text style={styles.status}>Status: {lead.status}</Text>

      {lead.potentialValue && (
        <Text style={styles.value}>
          Potential Value: {lead.potentialValue.amount} {lead.potentialValue.currency}
        </Text>
      )}

      {/* Decision Surface */}
      <View style={styles.actionsContainer}>
        {canConvert && !lead.convertedToQuoteId && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleConvertToQuote}
            disabled={actionLoading}
          >
            <Text style={styles.buttonText}>Convert to Quote</Text>
          </TouchableOpacity>
        )}

        {canConvert && lead.convertedToQuoteId && !lead.convertedToInvoiceId && (
          <TouchableOpacity 
            style={[styles.button, styles.invoiceButton]} 
            onPress={handleConvertToInvoice}
            disabled={actionLoading}
          >
            <Text style={styles.buttonText}>Convert to Invoice</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red" },
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold" },
  status: { fontSize: 16, color: "#666", marginVertical: 8 },
  value: { fontSize: 18, color: "#2E7D32", fontWeight: "600", marginBottom: 24 },
  actionsContainer: { marginTop: 24 },
  button: {
    backgroundColor: "#1976D2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  invoiceButton: {
    backgroundColor: "#388E3C",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  }
});
