import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { ShadowExecutor } from '../adapters/shadow/ShadowExecutor';

export type BucketName = 'profile-logos' | 'business-documents' | 'proof-of-work' | 'payment-proofs' | 'opportunity-images' | 'advertisement-images';

export interface UploadOptions {
    bucketName: BucketName;
    filePath: string; // Local URI from picker
    fileName: string;
    mimeType: string;
}

/**
 * Uploads a file directly to Supabase Storage.
 * Must be used by an authenticated identity.
 */
export async function uploadToSupabaseStorage({ bucketName, filePath, fileName, mimeType }: UploadOptions): Promise<string> {
    return ShadowExecutor.execute({
        capability: "Media Evidence Ingestion",
        request: { bucketName, filePath, fileName, mimeType },
        legacyHandler: async () => {
            try {
                const base64 = await FileSystem.readAsStringAsync(filePath, { encoding: FileSystem.EncodingType.Base64 });
                const arrayBuffer = decode(base64);

                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, arrayBuffer, {
                        contentType: mimeType,
                        upsert: false,
                    });

                if (error) {
                    console.error('Supabase upload error:', error);
                    throw new Error(`Failed to upload to Supabase: ${error.message}`);
                }

                const { data: publicUrlData } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(data.path);

                return publicUrlData.publicUrl;
            } catch (e) {
                console.error('Upload utility error:', e);
                throw e;
            }
        },
        evidenceFactory: (publicUrl: string | undefined) => ({
            id: `evi_media_${Date.now()}`,
            sourceId: "phanda_media_upload",
            timestamp: new Date().toISOString(),
            payload: { bucketName, fileName, mimeType, publicUrl: publicUrl ?? '' },
            signatures: ["shadow-mode"]
        })
    });
}
