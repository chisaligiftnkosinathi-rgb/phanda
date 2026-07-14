import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGetTimelineApiV1OpportunitiesOpportunityIdTimelineGet } from '@/generated/api';

export function OpportunityTimeline({ opportunityId }: { opportunityId: string }) {
  const { data: timelineEvents, isLoading, isError } = useGetTimelineApiV1OpportunitiesOpportunityIdTimelineGet(opportunityId, {
    query: {
      enabled: !!opportunityId,
    }
  });

  if (isLoading) return <ActivityIndicator size="small" color="#4CAF50" />;
  if (isError) return <Text style={styles.error}>Failed to load timeline events</Text>;
  if (!timelineEvents || timelineEvents.length === 0) return <Text style={styles.empty}>No events recorded yet.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Replay Timeline</Text>
      
      <View style={styles.timelineList}>
        {timelineEvents.map((event, index) => (
          <View key={event.id} style={styles.eventRow}>
            <View style={styles.lineColumn}>
              <View style={styles.dot} />
              {index !== timelineEvents.length - 1 && <View style={styles.line} />}
            </View>
            
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Text style={styles.command}>{event.event_type}</Text>
                <Text style={styles.timestamp}>
                  {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {event.description && <Text style={styles.description}>{event.description}</Text>}
            </View>
          </View>
        ))}
      </View>
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
  error: { color: '#EF4444', padding: 16 },
  empty: { color: '#6B7280', padding: 16, fontStyle: 'italic' },
  timelineList: {
    marginTop: 8,
  },
  eventRow: {
    flexDirection: 'row',
  },
  lineColumn: {
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: 4,
  },
  eventContent: {
    flex: 1,
    paddingBottom: 24,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  command: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
  }
});
