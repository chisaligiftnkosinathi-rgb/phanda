import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'expo-router';

export function BusinessSettingsForm() {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout failed', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danger Zone</Text>

      <TouchableOpacity
        style={[styles.dangerButton, isLoggingOut && styles.disabledButton]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#DC2626" />
        ) : (
          <Text style={styles.dangerButtonText}>Sign Out of iPhande</Text>
        )}
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
    borderColor: '#FECACA',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#DC2626',
  },
  dangerButton: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  disabledButton: {
    opacity: 0.6,
  },
  dangerButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
});
