import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from '@/features/auth';
import { useCreateOpportunity } from '@/features/opportunity';

const createOpportunitySchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  serviceNeeded: z.string().min(2, 'Service needed is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  contactPhone: z.string().min(10, 'Contact phone is required'),
  budgetAmount: z.string().optional(),
  categoryKey: z.string().optional(),
  // Location
  province: z.string(),
  townOrCity: z.string(),
});

type CreateOpportunityFormData = z.infer<typeof createOpportunitySchema>;

export default function NewOpportunityScreen() {
  const router = useRouter();
  const { identity } = useSession();
  const createMutation = useCreateOpportunity();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOpportunityFormData>({
    resolver: zodResolver(createOpportunitySchema),
    defaultValues: {
      title: '',
      description: '',
      serviceNeeded: '',
      contactName: '',
      contactPhone: '',
      budgetAmount: '',
      categoryKey: 'GENERAL',
      province: 'Western Cape',
      townOrCity: 'Cape Town',
    },
  });

  const onSubmit = async (data: CreateOpportunityFormData) => {
    if (!identity?.id) {
      Alert.alert('Authentication required', 'You must be signed in.');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        created_by_profile_id: identity.id,
        title: data.title,
        description: data.description,
        service_needed: data.serviceNeeded,
        contact_name: data.contactName,
        contact_phone: data.contactPhone,
        budget_amount: data.budgetAmount,
        category_key: data.categoryKey || 'GENERAL',
        province: data.province,
        town_or_city: data.townOrCity,
      });

      // Navigate to the newly created workspace
      router.replace(`/(steward)/opportunities/${result.id}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create opportunity');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Post an Opportunity</Text>
      <Text style={styles.headerSubtitle}>Describe what you need and let the community find you.</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Title *</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. Need a plumber for a leaking pipe"
            />
          )}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Service Needed *</Text>
        <Controller
          control={control}
          name="serviceNeeded"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.serviceNeeded && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. Plumbing"
            />
          )}
        />
        {errors.serviceNeeded && <Text style={styles.errorText}>{errors.serviceNeeded.message}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={4}
              placeholder="Describe the job in detail..."
            />
          )}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Budget Amount</Text>
        <Controller
          control={control}
          name="budgetAmount"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. 500"
              keyboardType="numeric"
            />
          )}
        />
      </View>

      <Text style={styles.sectionTitle}>Contact Information</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact Name *</Text>
        <Controller
          control={control}
          name="contactName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.contactName && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Your Name"
            />
          )}
        />
        {errors.contactName && <Text style={styles.errorText}>{errors.contactName.message}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact Phone *</Text>
        <Controller
          control={control}
          name="contactPhone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.contactPhone && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. 082 123 4567"
              keyboardType="phone-pad"
            />
          )}
        />
        {errors.contactPhone && <Text style={styles.errorText}>{errors.contactPhone.message}</Text>}
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]} 
        onPress={handleSubmit(onSubmit)}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Create Workspace</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 24, paddingBottom: 80, maxWidth: 800, marginHorizontal: 'auto', width: '100%' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: '#4B5563', marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#111827', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  submitButtonDisabled: { backgroundColor: '#9CA3AF' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
