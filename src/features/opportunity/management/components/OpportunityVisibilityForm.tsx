import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { usePublishOpportunity, useArchiveOpportunity } from '../../hooks';
import type { OpportunityDetailViewModel } from '../../types';

export function OpportunityVisibilityForm({ opportunity }: { opportunity: OpportunityDetailViewModel }) {
  const publishMutation = usePublishOpportunity();
  const archiveMutation = useArchiveOpportunity();

  const isPublished = opportunity.state === 'Published' || opportunity.state === 'Visible';
  const isArchived = opportunity.state === 'Archived';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visibility & Lifecycle</Text>

      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Publish to Discovery</Text>
          <Text style={styles.description}>Make this opportunity visible to the public feed.</Text>
        </View>
        <Switch
          value={isPublished}
          onValueChange={(val) => {
            if (val) publishMutation.mutate({ opportunityId: opportunity.slug });
            // If turning off, we would ideally transition to Draft or Hidden. 
            // The backend needs a way to un-publish without archiving.
          }}
          disabled={publishMutation.isPending || isArchived}
        />
      </View>

      {!isArchived && (
        <TouchableOpacity
          style={styles.archiveBtn}
          onPress={() => archiveMutation.mutate({ opportunityId: opportunity.slug })}
          disabled={archiveMutation.isPending}
        >
          <Text style={styles.archiveBtnText}>
            {archiveMutation.isPending ? 'Archiving...' : 'Archive Opportunity'}
          </Text>
        </TouchableOpacity>
      )}

      {isArchived && (
        <Text style={styles.archivedLabel}>This opportunity is archived and read-only.</Text>
      )}
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
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
  description: { fontSize: 12, color: '#6B7280' },
  archiveBtn: {
    borderWidth: 1, borderColor: '#EF4444', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 8
  },
  archiveBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  archivedLabel: {
    color: '#EF4444', fontStyle: 'italic', marginTop: 8, textAlign: 'center'
  }
});
