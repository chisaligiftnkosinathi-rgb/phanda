import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useSession } from '@/features/auth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { login: signIn } = useAuth();
  const login = signIn;
    const router = useRouter();

    const handleLogin = async () => {
        setErrorMessage('');

        if (!email.trim() || !password.trim()) {
            setErrorMessage("Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            await login({ email: email.trim(), password: password });
            // Steward Dashboard is the home screen after authentication.
            router.replace('/(steward)/dashboard' as const);
        } catch (error: unknown) {
            console.error("Login Error:", error);

            let rawMsg = "";
            if (error instanceof Error) {
                rawMsg = error.message;
            } else if (typeof error === 'object' && error !== null && 'message' in error) {
                rawMsg = String((error as { message: unknown }).message);
            }

            let friendlyMessage = "An unexpected error occurred. Please try again.";
            const lower = rawMsg.toLowerCase();

            if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
                friendlyMessage = "No account found with this email, or the password entered is incorrect. If you haven't registered yet, please sign up.";
            } else if (lower.includes("email not confirmed")) {
                friendlyMessage = "Please verify your email address before signing in. Check your inbox for the confirmation link.";
            } else if (lower.includes("user not found")) {
                friendlyMessage = "No account found with this email address. Please click 'Sign Up' below to create your account.";
            } else if (lower.includes("network") || lower.includes("fetch")) {
                friendlyMessage = "Unable to connect to the authentication service. Please check your internet connection.";
            } else if (rawMsg) {
                friendlyMessage = rawMsg;
            }

            setErrorMessage(friendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to iPhande</Text>
            <Text style={styles.subtitle}>Township Enterprise ERP & Steward Operating System. Access your timeline, quotes, and trust ledger.</Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.primaryButtonText}>
                    {loading ? "Logging in..." : "Login"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.switchButton}
                onPress={() => router.push('/auth/register')}
            >
                <Text style={styles.switchButtonText}>
                    Don&apos;t have an account? <Text style={styles.switchButtonTextBold}>Sign Up</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        marginBottom: 12,
        color: '#111827',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 32,
        color: '#4B5563',
    },
    form: {
        width: '100%',
        gap: 16,
        marginBottom: 24,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    errorText: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    primaryButton: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#111827',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    switchButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    switchButtonText: {
        color: '#4B5563',
        fontSize: 14,
    },
    switchButtonTextBold: {
        color: '#111827',
        fontWeight: '700',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    eyeIcon: {
        padding: 16,
    },
});

