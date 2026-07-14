import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBusiness } from '../hooks/useBusiness';
import { useUpdateBusiness } from '../hooks/useUpdateBusiness';

const contactsSchema = z.object({
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  website: z.string().url('Valid URL is required').optional().or(z.literal('')),
  supportEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
  supportPhone: z.string().optional(),
});

type ContactsFormData = z.infer<typeof contactsSchema>;

export function BusinessContactsForm() {
  const { business, isLoading } = useBusiness();
  const updateMutation = useUpdateBusiness();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ContactsFormData>({
    resolver: zodResolver(contactsSchema),
    defaultValues: {
      email: '',
      phone: '',
      website: '',
      supportEmail: '',
      supportPhone: '',
    },
  });

  useEffect(() => {
    if (business?.contacts) {
      reset({
        email: business.contacts.email || '',
        phone: business.contacts.phone || '',
        website: business.contacts.website || '',
        supportEmail: business.contacts.supportEmail || '',
        supportPhone: business.contacts.supportPhone || '',
      });
    }
  }, [business, reset]);

  const onSubmit = (data: ContactsFormData) => {
    updateMutation.mutate({ contacts: data });
  };

  if (isLoading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacts & Support</Text>

      {/* Email */}
      <View style={styles.field}>
        <Text style={styles.label}>Primary Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="e.g. hello@business.com"
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
      </View>

      {/* Phone */}
      <View style={styles.field}>
        <Text style={styles.label}>Primary Phone</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="phone-pad"
              placeholder="e.g. +27 82 123 4567"
            />
          )}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
      </View>

      {/* Website */}
      <View style={styles.field}>
        <Text style={styles.label}>Website (Optional)</Text>
        <Controller
          control={control}
          name="website"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.website && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="url"
              autoCapitalize="none"
              placeholder="https://example.com"
            />
          )}
        />
        {errors.website && <Text style={styles.errorText}>{errors.website.message}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, (!isDirty || updateMutation.isPending) && styles.saveBtnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={!isDirty || updateMutation.isPending}
      >
        <Text style={styles.saveBtnText}>
          {updateMutation.isPending ? 'Saving...' : 'Save Contacts'}
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
