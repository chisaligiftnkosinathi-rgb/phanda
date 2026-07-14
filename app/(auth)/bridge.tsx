import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useAuthBridgeStore } from '@/state/useAuthBridgeStore';
import { useAuth } from '@/features/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AuthBridgeScreen() {
    const { state, pendingAction, setState, resolveAuth } = useAuthBridgeStore();
    const { register, login } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [contact, setContact] = useState(''); // phone or email
    const [password, setPassword] = useState(''); // Need something minimal for Supabase behind the scenes

    // Fallback if accessed without a trigger
    useEffect(() => {
        if (state === 'IDLE' || !pendingAction) {
            router.back();
        }
    }, [state, pendingAction]);

    const handleSoftGateContinue = () => {
        setState('COLLECTING_MINIMAL_IDENTITY');
    };

    const handleSoftGateLogin = () => {
        // If they already have an account, we could either push them to login, 
        // or just collect email/password here. Let's keep them here.
        router.push('/(auth)/auth/login');
    };

    const handleSubmitIdentity = async () => {
        if (!name || !contact) return;
        setState('AUTHENTICATING');

        try {
            // For now, since Supabase requires email/password, we do a quick signup
            // In a real Identity Compression, we would use passwordless OTP.
            // Using a dummy password for the prototype just to anchor the identity.
            const syntheticPassword = "IdentityAnchor123!"; 
            
            // Assume contact is email for the prototype
            await register({ email: contact, password: syntheticPassword });
            
            setState('RESUMING_INTENT');
            
            // Simulate the pause
            setTimeout(() => {
                resolveAuth(); // This runs pendingAction and transitions state
                router.replace(pendingAction?.returnPath as any);
            }, 1500);

        } catch (error) {
            console.error("Auth bridge failed:", error);
            setState('COLLECTING_MINIMAL_IDENTITY');
        }
    };

    if (state === 'IDLE' || !pendingAction) return null;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                
                {/* PHASE 1: Soft Gate */}
                {(state === 'TRIGGERED' || state === 'AWAITING_AUTH_METHOD') && (
                    <View style={styles.phaseContainer}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="shield-checkmark-outline" size={48} color="#111827" />
                        </View>
                        <Text style={styles.bodyText}>
                            To keep this economy trusted,{"\n"}we need to know who is acting.
                        </Text>
                        
                        <View style={styles.divider} />

                        <Text style={styles.contextLabel}>You are about to:</Text>
                        <Text style={styles.actionLabel}>"{pendingAction.label}"</Text>
                        
                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.primaryBtn} onPress={handleSoftGateContinue}>
                            <Text style={styles.primaryBtnText}>Continue</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtn} onPress={handleSoftGateLogin}>
                            <Text style={styles.secondaryBtnText}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* PHASE 2: Identity Compression */}
                {state === 'COLLECTING_MINIMAL_IDENTITY' && (
                    <View style={styles.phaseContainer}>
                        <Text style={styles.titleText}>Who are we working with?</Text>

                        <View style={styles.divider} />

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="John Doe"
                                placeholderTextColor="#9CA3AF"
                                value={name}
                                onChangeText={setName}
                                autoFocus
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone or Email</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="+27 82 000 0000"
                                placeholderTextColor="#9CA3AF"
                                value={contact}
                                onChangeText={setContact}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity 
                            style={[styles.primaryBtn, (!name || !contact) && styles.disabledBtn]} 
                            onPress={handleSubmitIdentity}
                            disabled={!name || !contact}
                        >
                            <Text style={styles.primaryBtnText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* PHASE 3: Silent Authentication */}
                {state === 'AUTHENTICATING' && (
                    <View style={[styles.phaseContainer, styles.centerPhase]}>
                        <ActivityIndicator size="large" color="#111827" style={{ marginBottom: 24 }} />
                        <Text style={styles.loadingText}>Verifying identity...</Text>
                        <Text style={styles.loadingSubtext}>Linking trust profile...</Text>
                    </View>
                )}

                {/* PHASE 4: Resume Intent */}
                {state === 'RESUMING_INTENT' && (
                    <View style={[styles.phaseContainer, styles.centerPhase]}>
                        <View style={[styles.iconContainer, { backgroundColor: '#F0FDF4' }]}>
                            <Ionicons name="checkmark" size={48} color="#059669" />
                        </View>
                        <Text style={styles.loadingText}>Confirmed.</Text>
                        <Text style={styles.loadingSubtext}>Returning you to your action...</Text>
                    </View>
                )}
                
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(243, 244, 246, 0.95)', // Soft overlay
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    phaseContainer: {
        width: '100%',
    },
    centerPhase: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 24,
    },
    bodyText: {
        fontSize: 18,
        color: '#111827',
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 28,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 24,
    },
    contextLabel: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '500',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 20,
        color: '#111827',
        textAlign: 'center',
        fontWeight: '800',
    },
    primaryBtn: {
        backgroundColor: '#111827',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    secondaryBtn: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#4B5563',
        fontSize: 16,
        fontWeight: '600',
    },
    titleText: {
        fontSize: 24,
        color: '#111827',
        textAlign: 'center',
        fontWeight: '800',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    loadingText: {
        fontSize: 20,
        color: '#111827',
        fontWeight: '700',
        marginBottom: 8,
    },
    loadingSubtext: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
});
