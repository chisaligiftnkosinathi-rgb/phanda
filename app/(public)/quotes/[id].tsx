import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useQuote } from "../../../src/hooks/useQuote";
import { useQuoteAction } from "../../../src/hooks/useQuoteAction";
import { Permission } from '@/features/auth';
import { TrustPermissionEngine } from '../../../src/services/guards/permissionEngine';

import { useSession } from '@/features/auth';

export default function QuoteDetail({ id }: { id: string }) {
  const { data: quote, loading: quoteLoading, error } = useQuote(id);
  const { permissions } = useSession();
  const { sendQuote, acceptQuote, rejectQuote, loading: actionLoading } = useQuoteAction(permissions);

  if (quoteLoading) {
    return <ActivityIndicator size="large" style={styles.center} />;
  }

  if (error || !quote) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not load quote.</Text>
      </View>
    );
  }

  const canSend = TrustPermissionEngine.canSendQuote(permissions);

  const handleSend = async () => {
    try {
      await sendQuote(quote.id);
      Alert.alert("Success", "Quote Sent!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to send.");
    }
  };

  const handleAccept = async () => {
    try {
      await acceptQuote(quote.id);
      Alert.alert("Success", "Quote Accepted!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to accept.");
    }
  };

  const handleReject = async () => {
    try {
      await rejectQuote(quote.id);
      Alert.alert("Success", "Quote Rejected!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to reject.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quote.title}</Text>
      <Text style={styles.status}>Status: {quote.status}</Text>
      
      <Text style={styles.value}>
        Total: {quote.total.amount} {quote.total.currency}
      </Text>

      {/* Decision Surface */}
      <View style={styles.actionsContainer}>
        {canSend && quote.status === "draft" && (
          <TouchableOpacity 
            style={[styles.button, styles.sendButton]} 
            onPress={handleSend}
            disabled={actionLoading}
          >
            <Text style={styles.buttonText}>Send Quote</Text>
          </TouchableOpacity>
        )}

        {quote.status === "sent" && (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.acceptButton]} 
              onPress={handleAccept}
              disabled={actionLoading}
            >
              <Text style={styles.buttonText}>Accept Quote</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.rejectButton]} 
              onPress={handleReject}
              disabled={actionLoading}
            >
              <Text style={styles.buttonText}>Reject Quote</Text>
            </TouchableOpacity>
          </>
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
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: "#1976D2",
  },
  acceptButton: {
    backgroundColor: "#388E3C",
  },
  rejectButton: {
    backgroundColor: "#D32F2F",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  }
});
