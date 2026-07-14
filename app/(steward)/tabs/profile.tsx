import { profileApi } from "@/api/profile";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
import { storage } from "@/utils/storage";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProfile = async () => {
    try {
      setLoading(true);

      const res = await profileApi.getMe();
      setProfile(res.data);

    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load profile";

      Alert.alert("Profile Error", message);

    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await storage.removeToken();
    router.replace('/auth/login');
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No profile found</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pilot Profile</Text>
      
      <View style={styles.card}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{profile.email}</Text>
          
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{profile.id}</Text>
          
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{profile.status || "active"}</Text>
      </View>

      <TouchableOpacity style={[styles.button, { marginTop: 24 }]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        paddingTop: 56,
        backgroundColor: '#F9FAFB',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
        color: '#111827',
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    value: {
        fontSize: 18,
        color: '#111827',
        marginBottom: 16,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    errorText: {
        fontSize: 18,
        color: '#DC2626',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#111827',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
