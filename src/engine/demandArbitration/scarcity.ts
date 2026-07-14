import { mockPeople } from '@/mocks/publicEconomy';

/**
 * Computes dynamic skill scarcity based on real-time availability in the economy.
 * 
 * scarcity(skill) = 1 - (availableWorkersWithSkill / totalWorkers)
 * Clamped between 0.1 and 0.95 to maintain mathematical stability in arbitration.
 */
export function computeSkillScarcity(requiredSkill: string): number {
  if (mockPeople.length === 0) return 0.95; // Max scarcity if no one exists

  const totalWorkers = mockPeople.length;
  
  const availableWorkersWithSkill = mockPeople.filter(person => {
    // Only count active workers with the capability
    const isActive = (person.visibility.activeStatus ?? '').toLowerCase().includes('active');
    const hasSkill = person.variantData.capabilities.some(
      cap => cap.toLowerCase() === requiredSkill.toLowerCase()
    );
    return isActive && hasSkill;
  }).length;

  const rawScarcity = 1 - (availableWorkersWithSkill / totalWorkers);

  return Math.max(0.1, Math.min(0.95, rawScarcity));
}
