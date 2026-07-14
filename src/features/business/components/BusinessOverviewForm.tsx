import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBusiness } from '../hooks/useBusiness';
import { useUpdateBusiness } from '../hooks/useUpdateBusiness';

const overviewSchema = z.object({
  legalName: z.string().min(2, 'Legal name is required'),
  tradingName: z.string().min(2, 'Trading name is required'),
  registrationNumber: z.string().optional(),
  taxNumber: z.string().optional(),
  description: z.string().optional(),
});

type OverviewFormData = z.infer<typeof overviewSchema>;

export function BusinessOverviewForm() {
  const { business, isLoading } = useBusiness();
  const updateMutation = useUpdateBusiness();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<OverviewFormData>({
    resolver: zodResolver(overviewSchema),
    defaultValues: {
      legalName: '',
      tradingName: '',
      registrationNumber: '',
      taxNumber: '',
      description: '',
    },
  });

  // Sync form when data loads
  useEffect(() => {
    if (business?.overview) {
      reset({
        legalName: business.overview.legalName || '',
        tradingName: business.overview.tradingName || '',
        registrationNumber: business.overview.registrationNumber || '',
        taxNumber: business.overview.taxNumber || '',
        description: business.overview.description || '',
      });
    }
  }, [business, reset]);

  const onSubmit = (data: OverviewFormData) => {
    updateMutation.mutate({ overview: data });
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#4CAF50" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overview</Text>

      {/* Legal Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Legal Name</Text>
        <Controller
          control={control}
          name="legalName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.legalName && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. Phanda Holdings (Pty) Ltd"
            />
          )}
        />
        {errors.legalName && <Text style={styles.errorText}>{errors.legalName.message}</Text>}
      </View>

      {/* Trading Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Trading Name</Text>
        <Controller
          control={control}
          name="tradingName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.tradingName && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. Phanda"
            />
          )}
        />
        {errors.tradingName && <Text style={styles.errorText}>{errors.tradingName.message}</Text>}
      </View>

      {/* Registration Number */}
      <View style={styles.field}>
        <Text style={styles.label}>Registration Number</Text>
        <Controller
          control={control}
          name="registrationNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Optional"
            />
          )}
        />
      </View>

      {/* Description */}
      <View style={styles.field}>
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
              placeholder="Tell us about your business"
            />
          )}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, (!isDirty || updateMutation.isPending) && styles.saveBtnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={!isDirty || updateMutation.isPending}
      >
        <Text style={styles.saveBtnText}>
          {updateMutation.isPending ? 'Saving...' : 'Save Overview'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
