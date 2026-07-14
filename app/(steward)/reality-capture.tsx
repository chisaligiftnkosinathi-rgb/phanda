import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchWithAuth } from '@/config/api';
import { theme } from '@/config/theme';

export default function RealityCaptureScreen() {
  const router = useRouter();
  const [observationText, setObservationText] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAttachEvidence = () => {
    // Simulates picking or recording evidence file reference
    const mockFileName = `Document_${evidenceFiles.length + 1}.pdf`;
    setEvidenceFiles((prev) => [...prev, mockFileName]);
  };

  const handleCapture = async () => {
    if (!observationText.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Post observation to the Epistemic / Steward Journal API
      const payload = {
        observation: observationText.trim(),
        evidence_urls: evidenceFiles,
        source: 'reality_capture',
        created_at: new Date().toISOString(),
      };

      const res = await fetchWithAuth('/steward/journal', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      Alert.alert(
        'Reality Preserved',
        'Your observation has been indexed into the AXIONYX discovery graph.',
        [
          {
            text: 'View Dashboard',
            onPress: () => router.push('/(steward)/dashboard' as const),
          },
        ]
      );
    } catch (err: unknown) {
      console.error('Reality Capture API failure:', err);
      // Fallback endpoint if journal is structured under /steward/observations
      try {
        await fetchWithAuth('/steward/observations', {
          method: 'POST',
          body: JSON.stringify({
            text: observationText.trim(),
            attachments: evidenceFiles,
          }),
        });
        router.push('/(steward)/dashboard' as const);
      } catch (fallbackErr: unknown) {
        const msg =
          fallbackErr instanceof Error
            ? fallbackErr.message
            : 'Failed to connect to the observation engine.';
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>What would you like to remember?</Text>
      <Text style={styles.subtitle}>Tell me what happened today.</Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder="E.g., The client paid me R1000 for the tender documentation..."
        placeholderTextColor="#9CA3AF"
        value={observationText}
        onChangeText={setObservationText}
      />

      <View style={styles.evidenceSection}>
        <Text style={styles.sectionSubtitle}>Attach Evidence (Optional)</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleAttachEvidence}>
          <Text style={styles.uploadButtonText}>+ Upload Document or Photo</Text>
        </TouchableOpacity>

        {evidenceFiles.map((file, index) => (
          <Text key={index} style={styles.evidenceItem}>
            ✓ {file}
          </Text>
        ))}
      </View>

      {errorMessage && <Text style={styles.errorBanner}>{errorMessage}</Text>}

      <TouchableOpacity
        style={[
          styles.submitButton,
          (observationText.trim().length === 0 || isSubmitting) && styles.submitButtonDisabled,
        ]}
        onPress={handleCapture}
        disabled={observationText.trim().length === 0 || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Preserve Reality</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    height: 150,
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top',
  },
  evidenceSection: {
    marginVertical: 24,
  },
  uploadButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  evidenceItem: {
    marginTop: 6,
    color: theme.colors.navy,
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: theme.colors.navy,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
