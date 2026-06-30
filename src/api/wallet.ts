/**
 * Wallet API Module
 *
 * Wallet data (pending, available, paid) is sourced from:
 *   GET /api/v1/dashboard -> response.wallet.data
 *
 * Use dashboardApi.get() to load wallet alongside merchant + trust + notifications
 * in a single request. No separate wallet API calls needed.
 */

export type { WalletInfo } from './dashboard';
export { dashboardApi } from './dashboard';
