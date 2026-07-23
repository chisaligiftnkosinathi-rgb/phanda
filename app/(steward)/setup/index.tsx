import React from 'react';
import { View, StyleSheet, ScrollView, Text, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function SetupWizard() {
  const router = useRouter();

  const completeSetup = () => {
    // In the real app, this would submit the form and the backend would return a new bootstrap payload with stage='ACTIVE'
    // For now, we'll just redirect to home
    router.replace('/(steward)/tabs/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Business Setup</Text>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
        <Text style={styles.progressText}>Step 2 of 5</Text>

        <View style={styles.card}>
          <Text style={styles.questionTitle}>What is your Business Category?</Text>
          <Text style={styles.questionDesc}>This helps customers find you.</Text>
          
          <View style={styles.placeholderInput} />
          <View style={styles.placeholderInput} />
        </View>

        <View style={styles.btn}><Button title="Continue" onPress={completeSetup} /></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212529', marginBottom: 24 },
  progressContainer: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  progressDot: { flex: 1, height: 6, backgroundColor: '#e9ecef', borderRadius: 3 },
  progressDotActive: { backgroundColor: '#2A9D8F' },
  progressText: { fontSize: 14, color: '#6c757d', marginBottom: 32 },
  card: { padding: 20, borderRadius: 16, marginBottom: 32, backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  questionTitle: { fontSize: 20, fontWeight: 'bold', color: '#212529', marginBottom: 8 },
  questionDesc: { fontSize: 14, color: '#6c757d', marginBottom: 24 },
  placeholderInput: { height: 50, backgroundColor: '#f1f3f5', borderRadius: 8, marginBottom: 12 },
  btn: { marginTop: 'auto' },
});
