import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BusinessOverviewForm } from './BusinessOverviewForm';
import { BusinessContactsForm } from './BusinessContactsForm';
import { BusinessSettingsForm } from './BusinessSettingsForm';
import { useSession } from '@/features/auth/hooks/useAuth';

export function BusinessManagementScreen() {
  const { selectedBusiness } = useSession();

  if (!selectedBusiness) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No business selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Business Management</Text>
        <Text style={styles.subtitle}>Manage details for {selectedBusiness.displayName}</Text>
      </View>

      <BusinessOverviewForm />
      <BusinessContactsForm />
      <BusinessSettingsForm />
      
      <View style={styles.footerSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  footerSpace: {
    height: 40,
  },
});
