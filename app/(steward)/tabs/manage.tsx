import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ManageTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage</Text>
      <Text style={styles.subtitle}>Products, services, media, and inventory.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#6c757d', marginTop: 8 },
});
