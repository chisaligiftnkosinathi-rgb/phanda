import React from 'react';
import { View, ScrollView, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useOpportunityDetail } from '../../hooks';
import { OpportunityOverviewForm } from './OpportunityOverviewForm';
import { OpportunityPricingForm } from './OpportunityPricingForm';
import { OpportunityVisibilityForm } from './OpportunityVisibilityForm';
import { OpportunityTimeline } from './OpportunityTimeline';

export function OpportunityWorkspaceLayout({ slug }: { slug: string }) {
  const { data: opportunity, isLoading, isError } = useOpportunityDetail(slug);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (isError || !opportunity) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load opportunity workspace</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Opportunity Workspace</Text>
      <Text style={styles.subHeader}>Manage your offering</Text>

      <View style={styles.grid}>
        <View style={styles.mainColumn}>
          <OpportunityOverviewForm opportunity={opportunity} />
          <OpportunityPricingForm opportunity={opportunity} />
          {/* Capacity and Media would go here */}
        </View>

        <View style={styles.sideColumn}>
          <OpportunityVisibilityForm opportunity={opportunity} />
          <OpportunityTimeline opportunityId={opportunity.slug} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 24,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subHeader: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  mainColumn: {
    flex: 1,
    minWidth: 300,
  },
  sideColumn: {
    width: 350,
    minWidth: 300,
  }
});
