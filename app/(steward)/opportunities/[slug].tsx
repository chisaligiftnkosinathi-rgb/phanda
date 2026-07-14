import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { OpportunityWorkspaceLayout } from '@/features/opportunity';

export default function OpportunitiesManagementDetail() {
  const { slug } = useLocalSearchParams();
  return <OpportunityWorkspaceLayout slug={slug as string} />;
}
