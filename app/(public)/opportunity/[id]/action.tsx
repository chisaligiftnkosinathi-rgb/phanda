import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Linking, Pressable, Text, View } from "react-native";
import { useOpportunityAction } from "../../../../src/hooks/useOpportunityAction";

export default function ActionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [image, setImage] = useState<any>(null);
  
  const { 
    uploading, 
    paymentConfig, 
    loadPaymentConfig, 
    uploadProof, 
    createPayment 
  } = useOpportunityAction(id as string);

  useEffect(() => {
    loadPaymentConfig();
  }, [loadPaymentConfig]);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  }

  async function handleUploadProof() {
    if (!image) return;

    try {
      const res = await uploadProof(image.uri);
      Alert.alert(
        "Success",
        `Proof uploaded\nScore updated\nMedia ID: ${res.data.media_id}`
      );
      router.replace("/feed");
    } catch (e) {
      Alert.alert("Upload failed", "Try again");
    }
  }

  async function handlePayFast() {
    try {
      const response = await createPayment();
      if (response.payment_url) {
        Linking.openURL(response.payment_url);
      } else {
        Alert.alert("Payment failed", "Unable to start PayFast payment.");
      }
    } catch (error) {
      Alert.alert("Payment failed", "Unable to start PayFast payment.");
    }
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Submit Proof of Work
      </Text>

      {paymentConfig && (
        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#ddd",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
            💳 Manual Payment Instructions
          </Text>

          <Text>Bank: {paymentConfig.bank_name}</Text>
          <Text>Account: {paymentConfig.bank_account_number}</Text>
          <Text>
            Reference: {paymentConfig.reference_prefix}-{id}
          </Text>

          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "red", fontWeight: "600" }}>
              ⚠ Payment does NOT confirm completion
            </Text>

            <Text style={{ fontSize: 12, opacity: 0.7 }}>
              Proof of Work upload is still required after acceptance.
            </Text>
          </View>
        </View>
      )}

      <Pressable
        onPress={handlePayFast}
        style={{
          padding: 14,
          backgroundColor: "#0072c6",
          marginBottom: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Pay Online with PayFast
        </Text>
      </Pressable>

      <Pressable
        onPress={pickImage}
        style={{ padding: 14, backgroundColor: "#ddd", marginBottom: 12 }}
      >
        <Text>Select Image</Text>
      </Pressable>

      {image && (
        <Image
          source={{ uri: image.uri }}
          style={{ width: "100%", height: 250, marginTop: 20 }}
        />
      )}

      <Pressable
        onPress={handleUploadProof}
        disabled={uploading}
        style={{
          marginTop: 20,
          backgroundColor: uploading ? "#999" : "#000",
          padding: 14,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          {uploading ? "Uploading..." : "Submit Proof"}
        </Text>
      </Pressable>
    </View>
  );
}
