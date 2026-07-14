import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdatePricing } from '../../hooks';
import type { OpportunityDetailViewModel } from '../../types';

const pricingSchema = z.object({
  estimatedValue: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Must be a valid positive number',
  }),
  currency: z.string().min(3).max(3),
});

type PricingFormData = z.infer<typeof pricingSchema>;

export function OpportunityPricingForm({ opportunity }: { opportunity: OpportunityDetailViewModel }) {
  const updateMutation = useUpdatePricing();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      estimatedValue: opportunity.priceDisplay.replace(/[^0-9.]/g, ''),
      currency: opportunity.priceDisplay.replace(/[^A-Z]/g, '') || 'ZAR',
    },
  });

  useEffect(() => {
    reset({
      estimatedValue: opportunity.priceDisplay.replace(/[^0-9.]/g, ''),
      currency: opportunity.priceDisplay.replace(/[^A-Z]/g, '') || 'ZAR',
    });
  }, [opportunity, reset]);

  const onSubmit = (data: PricingFormData) => {
    updateMutation.mutate({
      opportunityId: opportunity.slug,
      estimatedValue: Number(data.estimatedValue),
      currency: data.currency,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pricing & Value</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Estimated Value</Text>
        <Controller
          control={control}
          name="estimatedValue"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.estimatedValue && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numeric"
              placeholder="e.g. 1500"
            />
          )}
        />
        {errors.estimatedValue && <Text style={styles.errorText}>{errors.estimatedValue.message}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Currency</Text>
        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.currency && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="ZAR"
              maxLength={3}
              autoCapitalize="characters"
            />
          )}
        />
        {errors.currency && <Text style={styles.errorText}>{errors.currency.message}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, (!isDirty || updateMutation.isPending) && styles.saveBtnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={!isDirty || updateMutation.isPending}
      >
        <Text style={styles.saveBtnText}>
          {updateMutation.isPending ? 'Saving...' : 'Save Pricing'}
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
  field: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 10,
    fontSize: 14, color: '#111827', backgroundColor: '#F9FAFB',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  saveBtn: { backgroundColor: '#111827', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { backgroundColor: '#9CA3AF' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
