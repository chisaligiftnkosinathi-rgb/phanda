import React from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSubmitLead } from '@/features/lead';

// ─── SCHEMA ──────────────────────────────────────────────────────────────────

const leadSchema = z.object({
  name:             z.string().min(2, 'Your name is required'),
  phone:            z.string().min(9, 'A valid phone number is required'),
  service_needed:   z.string().optional(),
  customer_location:z.string().optional(),
  message:          z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

// ─── SCREEN ──────────────────────────────────────────────────────────────────

export default function LeadSubmissionScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const submitLead = useSubmitLead();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      phone: '',
      service_needed: '',
      customer_location: '',
      message: '',
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    if (!slug) {
      Alert.alert('Error', 'Could not identify the opportunity. Please go back and try again.');
      return;
    }

    try {
      await submitLead.mutateAsync({
        profile_slug: slug,
        name: data.name,
        phone: data.phone,
        service_needed: data.service_needed || undefined,
        customer_location: data.customer_location || undefined,
        message: data.message || undefined,
        source: 'app',
      });

      router.replace({
        pathname: '/(public)/leads/action' as any,
        params: { state: 'submitted' },
      });
    } catch (err: any) {
      Alert.alert('Could not submit', err.message || 'Please try again.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Opportunity</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Express Interest</Text>
        <Text style={styles.subheading}>
          Tell the business what you need and they'll be in touch.
        </Text>
      </View>

      {/* ── Form ── */}
      <View style={styles.form}>
        <Field label="Your name *" error={errors.name?.message}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="e.g. Thabo Nkosi"
                placeholderTextColor="#9CA3AF"
                accessibilityLabel="Your name"
              />
            )}
          />
        </Field>

        <Field label="Phone number *" error={errors.phone?.message}>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="e.g. 082 123 4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                accessibilityLabel="Phone number"
              />
            )}
          />
        </Field>

        <Field label="What do you need?" error={undefined}>
          <Controller
            control={control}
            name="service_needed"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="e.g. Plumbing repair"
                placeholderTextColor="#9CA3AF"
                accessibilityLabel="Service needed"
              />
            )}
          />
        </Field>

        <Field label="Your location" error={undefined}>
          <Controller
            control={control}
            name="customer_location"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="e.g. Bellville, Cape Town"
                placeholderTextColor="#9CA3AF"
                accessibilityLabel="Your location"
              />
            )}
          />
        </Field>

        <Field label="Message (optional)" error={undefined}>
          <Controller
            control={control}
            name="message"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Any additional details..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Message"
              />
            )}
          />
        </Field>

        <TouchableOpacity
          style={[styles.submitButton, submitLead.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={submitLead.isPending}
          accessibilityLabel="Submit lead"
        >
          {submitLead.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Send Interest</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Your details are shared only with this business and are not publicly visible.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── FIELD WRAPPER ───────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingBottom: 60 },

  header: {
    backgroundColor: '#111827', padding: 24, paddingTop: 52, paddingBottom: 28,
  },
  backRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 6 },
  backArrow: { fontSize: 18, color: '#9CA3AF' },
  backLabel: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  heading:   { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  subheading:{ fontSize: 15, color: '#9CA3AF', lineHeight: 22 },

  form:  { padding: 24, gap: 4 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },

  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB',
    borderRadius: 10, padding: 14, fontSize: 16, color: '#111827',
  },
  inputError: { borderColor: '#EF4444' },
  textArea:   { minHeight: 110 },
  errorText:  { color: '#EF4444', fontSize: 12, marginTop: 4 },

  submitButton: {
    backgroundColor: '#111827', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 8,
  },
  submitButtonDisabled: { backgroundColor: '#9CA3AF' },
  submitButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },

  privacyNote: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16, lineHeight: 18 },
});
