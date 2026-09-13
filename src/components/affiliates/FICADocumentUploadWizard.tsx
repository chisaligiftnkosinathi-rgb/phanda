import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import {
  useRequestDocumentUploadIntentApiV1AffiliatesLeadsLeadIdDocumentsUploadIntentPost,
  useConfirmDocumentUploadApiV1AffiliatesLeadsLeadIdDocumentsDocumentIdConfirmPost,
} from '@/generated/api';
import { FICADocumentType } from '@/generated/models/fICADocumentType';

interface DocumentSlot {
  type: FICADocumentType;
  label: string;
  description: string;
  required: boolean;
}

const FICA_SLOTS: DocumentSlot[] = [
  {
    type: FICADocumentType.SA_ID_DOCUMENT,
    label: 'SA Identity Document',
    description: 'Smart ID Card (front & back) or green barcoded ID book',
    required: true,
  },
  {
    type: FICADocumentType.PROOF_OF_RESIDENCE,
    label: 'Proof of Residence',
    description: 'Utility bill, municipal account, or lease (< 3 months old)',
    required: true,
  },
  {
    type: FICADocumentType.BANK_STATEMENTS_3MO,
    label: '3-Month Bank Statements',
    description: 'Official bank stamped or e-certified PDF statements',
    required: true,
  },
  {
    type: FICADocumentType.DRIVERS_LICENSE,
    label: "Driver's License",
    description: 'Valid South African Code B / EB driver card',
    required: true,
  },
];

interface FICADocumentUploadWizardProps {
  leadId: string;
  onAllCompleted?: () => void;
}

export function FICADocumentUploadWizard({
  leadId,
  onAllCompleted,
}: FICADocumentUploadWizardProps) {
  const [completedDocs, setCompletedDocs] = useState<Record<string, boolean>>({});
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  const requestIntentMutation =
    useRequestDocumentUploadIntentApiV1AffiliatesLeadsLeadIdDocumentsUploadIntentPost();
  const confirmMutation =
    useConfirmDocumentUploadApiV1AffiliatesLeadsLeadIdDocumentsDocumentIdConfirmPost();

  const handlePickAndUpload = async (slot: DocumentSlot) => {
    try {
      const pickResult = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (pickResult.canceled || !pickResult.assets || pickResult.assets.length === 0) {
        return;
      }

      const asset = pickResult.assets[0];
      setUploadingSlot(slot.type);

      // 1. Calculate client-side SHA-256 digest on the binary payload
      const fileBytes = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Digest the file using expo-crypto
      const sha256Checksum = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        fileBytes
      );

      // 2. Request pre-signed direct upload intent slot
      const intentResponse = await requestIntentMutation.mutateAsync({
        leadId,
        data: {
          document_type: slot.type,
          file_name: asset.name,
          file_size_bytes: asset.size ?? 1024,
          mime_type: asset.mimeType ?? 'application/pdf',
        },
      });

      // 3. Upload directly to pre-signed URL
      const uploadResp = await fetch(intentResponse.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': asset.mimeType ?? 'application/octet-stream',
        },
        body: fileBytes,
      });

      if (!uploadResp.ok && uploadResp.status !== 200) {
        throw new Error(`Direct storage upload returned HTTP ${uploadResp.status}`);
      }

      // 4. Confirm upload with SHA-256 integrity hash
      await confirmMutation.mutateAsync({
        leadId,
        documentId: intentResponse.document_id,
        data: {
          sha256_checksum: sha256Checksum,
        },
      });

      setCompletedDocs((prev) => {
        const next = { ...prev, [slot.type]: true };
        if (FICA_SLOTS.every((s) => next[s.type])) {
          onAllCompleted?.();
        }
        return next;
      });

      Alert.alert('Upload Successful', `${slot.label} has been securely verified and vaulted.`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Upload failed. Please retry.';
      Alert.alert('Upload Error', msg);
    } finally {
      setUploadingSlot(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield" size={20} color="#0D9488" />
        <Text style={styles.headerTitle}>FICA Statutory Document Vault</Text>
      </View>
      <Text style={styles.headerSub}>
        Direct client-to-storage AES-256 encrypted uploads. All files purged after 90 days.
      </Text>

      <View style={styles.slotList}>
        {FICA_SLOTS.map((slot) => {
          const isDone = completedDocs[slot.type];
          const isBusy = uploadingSlot === slot.type;

          return (
            <View key={slot.type} style={[styles.slotCard, isDone && styles.slotCardDone]}>
              <View style={styles.slotInfo}>
                <View style={styles.slotTitleRow}>
                  <Text style={styles.slotLabel}>{slot.label}</Text>
                  {isDone && (
                    <View style={styles.verifiedPill}>
                      <Ionicons name="checkmark-circle" size={14} color="#0D9488" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.slotDescription}>{slot.description}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  isDone && styles.uploadBtnDone,
                  isBusy && styles.uploadBtnBusy,
                ]}
                disabled={isBusy}
                onPress={() => handlePickAndUpload(slot)}
              >
                {isBusy ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name={isDone ? 'refresh' : 'cloud-upload-outline'}
                      size={16}
                      color={isDone ? '#4B5563' : '#FFFFFF'}
                    />
                    <Text style={[styles.uploadBtnText, isDone && styles.uploadBtnTextDone]}>
                      {isDone ? 'Replace' : 'Upload'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  slotList: {
    gap: 12,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  slotCardDone: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  slotInfo: {
    flex: 1,
    paddingRight: 10,
  },
  slotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D9488',
  },
  slotDescription: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  uploadBtnDone: {
    backgroundColor: '#E5E7EB',
  },
  uploadBtnBusy: {
    opacity: 0.7,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  uploadBtnTextDone: {
    color: '#374151',
  },
});
