import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Dashboard widget identifiers.
 * Each corresponds to one card on the Steward Dashboard.
 */
export type WidgetId =
  | 'trust'
  | 'wallet'
  | 'work'
  | 'notifications'
  | 'systemStatus'
  | 'pinnedObservations';

export const WIDGET_LABELS: Record<WidgetId, string> = {
  trust: 'Trust Status',
  wallet: 'Wallet',
  work: 'Opportunities & Jobs',
  notifications: 'Notifications',
  systemStatus: 'System Status',
  pinnedObservations: 'Pinned Observations',
};

/**
 * Doctrine: Widgets are presentation.
 * Hiding a widget never touches the underlying data.
 * The data layer (ledger, API) is always intact and unaware of widget state.
 */
interface DashboardStoreState {
  hiddenWidgets: WidgetId[];

  /** Remove a widget from the dashboard view. Data is unaffected. */
  hideWidget: (id: WidgetId) => void;

  /** Restore a previously hidden widget to the dashboard. */
  showWidget: (id: WidgetId) => void;

  /** Returns true if the widget should be rendered. */
  isVisible: (id: WidgetId) => boolean;

  /** Restore all widgets at once. */
  showAllWidgets: () => void;
}

export const useDashboardStore = create<DashboardStoreState>()(
  persist(
    (set, get) => ({
      hiddenWidgets: [],

      hideWidget: (id) =>
        set((state) => ({
          hiddenWidgets: state.hiddenWidgets.includes(id)
            ? state.hiddenWidgets
            : [...state.hiddenWidgets, id],
        })),

      showWidget: (id) =>
        set((state) => ({
          hiddenWidgets: state.hiddenWidgets.filter((w) => w !== id),
        })),

      isVisible: (id) => !get().hiddenWidgets.includes(id),

      showAllWidgets: () => set({ hiddenWidgets: [] }),
    }),
    {
      name: 'phanda-dashboard-widgets',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
