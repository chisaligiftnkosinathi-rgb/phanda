import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LeadsTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leads</Text>
      <Text style={styles.subtitle}>Incoming quote requests and messages.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#6c757d', marginTop: 8 },
});
