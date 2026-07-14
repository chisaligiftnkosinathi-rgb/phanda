import { useState, useCallback } from 'react';
import { mediaApi } from '../api/media';
import { paymentApi } from '../api/payments';

export function useOpportunityAction(opportunityId: string) {
  const [uploading, setUploading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);

  const loadPaymentConfig = useCallback(async () => {
    try {
      const config = await paymentApi.getConfig();
      setPaymentConfig(config);
    } catch (e) {
      console.log("Payment config failed", e);
    }
  }, []);

  const uploadProof = useCallback(async (imageUri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: "proof.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("proof_type", "work");
      formData.append("linked_entity_id", opportunityId);

      const res = await mediaApi.upload(formData);
      return res;
    } finally {
      setUploading(false);
    }
  }, [opportunityId]);

  const createPayment = useCallback(async () => {
    try {
      return await paymentApi.createPayfastPayment(opportunityId);
    } catch (error) {
      console.log("PayFast create failed", error);
      throw error;
    }
  }, [opportunityId]);

  return {
    uploading,
    paymentConfig,
    loadPaymentConfig,
    uploadProof,
    createPayment,
  };
}
