import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateOverview } from '../../hooks';
import type { OpportunityDetailViewModel } from '../../types';

const overviewSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type OverviewFormData = z.infer<typeof overviewSchema>;

export function OpportunityOverviewForm({ opportunity }: { opportunity: OpportunityDetailViewModel }) {
  const updateMutation = useUpdateOverview();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<OverviewFormData>({
    resolver: zodResolver(overviewSchema),
    defaultValues: {
      title: opportunity.title || '',
      description: opportunity.description || '',
    },
  });

  useEffect(() => {
    reset({
      title: opportunity.title || '',
      description: opportunity.description || '',
    });
  }, [opportunity, reset]);

  const onSubmit = (data: OverviewFormData) => {
    updateMutation.mutate({
      opportunityId: opportunity.slug,
      title: data.title,
      description: data.description,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overview</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="E.g. Full-Day Wedding Photography"
            />
          )}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={4}
              placeholder="Describe what is included..."
            />
          )}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
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
  field: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 10,
    fontSize: 14, color: '#111827', backgroundColor: '#F9FAFB',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#111827', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { backgroundColor: '#9CA3AF' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
