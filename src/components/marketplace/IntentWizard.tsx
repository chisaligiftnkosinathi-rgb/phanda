import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import StatsSaLocationPicker, { StatsSaPlace } from '@/components/location/StatsSaLocationPicker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = Math.min(SCREEN_WIDTH, 800);
const PAD = 24;

interface IntentWizardProps {
  titleStep1: string;
  categories: { id: string; label: string; icon?: string }[];
  onComplete: (category: string, location: StatsSaPlace | null) => void;
  resultsView: React.ReactNode;
}

export function IntentWizard({ titleStep1, categories, onComplete, resultsView }: IntentWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<StatsSaPlace | null>(null);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep(2);
  };

  const handleLocationSubmit = () => {
    onComplete(selectedCategory, selectedLocation);
    setStep(3);
  };

  if (step === 3) {
    return <>{resultsView}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>{titleStep1}</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={styles.categoryCard}
                  onPress={() => handleCategorySelect(cat.id)}
                >
                  <Text style={styles.categoryText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>Where?</Text>
            
            <View style={styles.locationContainer}>
              <StatsSaLocationPicker
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  placeholder="Search location..."
              />
            </View>

            <TouchableOpacity 
              style={styles.continueBtn}
              onPress={handleLocationSubmit}
            >
              <Text style={styles.continueBtnText}>
                {selectedLocation ? "Continue" : "Search Nearby"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => setStep(1)}
            >
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
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
    flex: 1,
    maxWidth: CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: PAD,
    paddingTop: 80,
  },
  stepContainer: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 40,
  },
  categoryGrid: {
    gap: 16,
    paddingBottom: 40,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  locationContainer: {
    marginBottom: 40,
    zIndex: 10, // For the dropdown
  },
  continueBtn: {
    backgroundColor: '#111827',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  backBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  }
});
