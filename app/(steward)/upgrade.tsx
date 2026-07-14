import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchWithAuth } from '@/config/api';
import { theme } from '@/config/theme';

export default function UpgradeScreen() {
  const router = useRouter();
  const { feature, pack } = useLocalSearchParams<{ feature?: string; pack?: string }>();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const requestUpgrade = async (planKey: string) => {
    setLoadingPlan(planKey);
    try {
      // Dispatch upgrade request to the backend payment handler
      const res = await fetchWithAuth('/payments/upgrade-request', {
        method: 'POST',
        body: JSON.stringify({
          plan: planKey,
          feature_context: feature || null,
          pack_context: pack || null,
          requested_at: new Date().toISOString(),
        }),
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      Alert.alert(
        'Upgrade Requested',
        `Your request for the ${planKey.toUpperCase()} tier has been submitted. An admin will review and activate your access.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: unknown) {
      console.warn('Primary upgrade route failed, attempting profile fallback...', err);
      try {
        await fetchWithAuth('/profiles/me/upgrades', {
          method: 'POST',
          body: JSON.stringify({ plan: planKey }),
        });
        Alert.alert('Upgrade Submitted', 'Your request has been received.');
        router.back();
      } catch (fallbackErr: unknown) {
        const msg =
          fallbackErr instanceof Error
            ? fallbackErr.message
            : 'Failed to request upgrade. Please try again.';
        Alert.alert('Error', msg);
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {feature && (
        <View style={styles.contextBox}>
          <Text style={styles.contextTitle}>You discovered {feature}!</Text>
          <Text style={styles.contextText}>
            {feature} is part of the {pack || 'premium'} pack. Upgrade to unlock this tool.
          </Text>
        </View>
      )}

      <Text style={styles.mainTitle}>iPhande Plans</Text>
      <Text style={styles.subtitle}>Choose the right tools for your business</Text>

      {/* Verified Steward Plan */}
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Verified Steward</Text>
          <Text style={styles.planPrice}>
            R120 <Text style={styles.planPriceSub}>once-off</Text>
          </Text>
        </View>
        <Text style={styles.planDesc}>Build trust and stand out in the community.</Text>
        <Text style={styles.featureItem}>✓ Verified Badge</Text>
        <Text style={styles.featureItem}>✓ Trust Status</Text>
        <Text style={styles.featureItem}>✓ Higher Ranking in Search</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => requestUpgrade('verified_once_off')}
          disabled={loadingPlan !== null}
        >
          {loadingPlan === 'verified_once_off' ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Get Verified</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Documents Pack */}
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Documents Pack</Text>
          <Text style={styles.planPrice}>
            R49 <Text style={styles.planPriceSub}>/mo</Text>
          </Text>
        </View>
        <Text style={styles.planDesc}>Send professional prices to customers.</Text>
        <Text style={styles.featureItem}>✓ Quotes</Text>
        <Text style={styles.featureItem}>✓ Invoices</Text>
        <Text style={styles.featureItem}>✓ Receipts</Text>
        <Text style={styles.featureItem}>✓ PDF Downloads with Logo</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => requestUpgrade('documents')}
          disabled={loadingPlan !== null}
        >
          {loadingPlan === 'documents' ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Unlock Documents</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Continuity Pack */}
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Continuity Pack</Text>
          <Text style={styles.planPrice}>
            R99 <Text style={styles.planPriceSub}>/mo</Text>
          </Text>
        </View>
        <Text style={styles.planDesc}>Prove your work history to anyone.</Text>
        <Text style={styles.featureItem}>✓ Proof of Work</Text>
        <Text style={styles.featureItem}>✓ Official Timeline Evidence</Text>
        <Text style={styles.featureItem}>✓ Replay History</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => requestUpgrade('continuity')}
          disabled={loadingPlan !== null}
        >
          {loadingPlan === 'continuity' ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Unlock Continuity</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Business Pack */}
      <View style={[styles.planCard, styles.businessCard]}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Full Business</Text>
          <Text style={styles.planPrice}>
            R199 <Text style={styles.planPriceSub}>/mo</Text>
          </Text>
        </View>
        <Text style={styles.planDesc}>Everything you need to run your business.</Text>
        <Text style={styles.featureItem}>✓ All Documents</Text>
        <Text style={styles.featureItem}>✓ All Continuity Features</Text>
        <Text style={styles.featureItem}>✓ Expenses &amp; Inventory</Text>
        <Text style={styles.featureItem}>✓ Business Reports &amp; Export</Text>
        <TouchableOpacity
          style={[styles.button, styles.businessButton]}
          onPress={() => requestUpgrade('business')}
          disabled={loadingPlan !== null}
        >
          {loadingPlan === 'business' ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <Text style={[styles.buttonText, { color: '#000000' }]}>Get Business Pack</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 24,
    backgroundColor: '#F9FAFB',
    flexGrow: 1,
  },
  contextBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  contextTitle: {
    color: '#1E40AF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contextText: {
    color: '#1E3A8A',
    fontSize: 14,
    lineHeight: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  businessCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  planPriceSub: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: 'normal',
  },
  planDesc: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  button: {
    backgroundColor: theme.colors.navy,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  businessButton: {
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  backButtonText: {
    color: '#4B5563',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
