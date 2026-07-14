import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { View, Text, Button, Image, ActivityIndicator, Alert, StyleSheet } from "react-native";

import { mediaApi } from "@/api/media";
import { PageHeader } from '@/components/PageHeader';

type UploadState =
  | "idle"
  | "picking"
  | "uploading"
  | "success"
  | "error";

export default function UploadScreen() {
  const [state, setState] = useState<UploadState>("idle");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);

  const pickImage = async () => {
    setState("picking");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) {
      setState("idle");
      return;
    }

    const uri = result.assets[0].uri;
    setImageUri(uri);
    setState("idle");
  };

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert("No image selected");
      return;
    }

    try {
      setState("uploading");

      const formData = new FormData();

      formData.append("file", {
        uri: imageUri,
        name: "upload.jpg",
        type: "image/jpeg",
      } as any);

      // Token is automatically injected by the apiClient interceptor
      const response = await mediaApi.upload(formData);

      // Expected backend contract:
      // { media_id, file_url, support_trace_id }

      setUploadedUrl(response.file_url);
      setTraceId(response.support_trace_id ?? null);

      setState("success");

      // 🔍 Immediate verification step (VERY IMPORTANT)
      if (response.media_id) {
          await mediaApi.get(response.media_id);
      }

    } catch (err: any) {
      console.log("UPLOAD_ERROR:", err?.response?.data || err.message);

      setState("error");

      Alert.alert(
        "Upload failed",
        err?.response?.data?.detail ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader 
          eyebrow="Steward Tools" 
          title="Media Upload" 
          subtitle="Pilot-safe media upload test." 
      />

      <View style={styles.content}>
          {state === "idle" && (
            <Button title="Pick Image" onPress={pickImage} />
          )}

          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 200, height: 200, marginVertical: 20, alignSelf: 'center', borderRadius: 12 }}
            />
          )}

          {state === "idle" && imageUri && (
            <Button title="Upload Image" onPress={uploadImage} />
          )}

          {state === "uploading" && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#111827" />
              <Text style={{ marginTop: 10 }}>Uploading... please wait</Text>
            </View>
          )}

          {state === "success" && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                Upload successful ✅
              </Text>

              {uploadedUrl && (
                <Text selectable style={styles.infoText}>
                  URL: {uploadedUrl}
                </Text>
              )}

              {traceId && (
                <Text selectable style={styles.infoText}>
                  Trace: {traceId}
                </Text>
              )}
              
              <Button title="Upload Another" onPress={() => {
                  setState("idle");
                  setImageUri(null);
                  setUploadedUrl(null);
                  setTraceId(null);
              }} />
            </View>
          )}

          {state === "error" && (
            <View style={styles.center}>
                <Text style={styles.errorText}>
                  Upload failed. Please retry.
                </Text>
                <Button title="Retry Upload" onPress={uploadImage} color="red" />
            </View>
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        padding: 24,
    },
    center: {
        alignItems: 'center',
        marginVertical: 20,
    },
    successBox: {
        backgroundColor: '#D1FAE5',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    successText: {
        color: '#065F46',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 12,
        color: '#4B5563',
        marginBottom: 5,
        textAlign: 'center',
    },
    errorText: {
        color: '#DC2626',
        fontSize: 16,
        marginBottom: 10,
    },
});
