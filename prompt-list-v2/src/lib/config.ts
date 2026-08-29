/**
 * Master Feature Flag Configuration
 * 
 * ENABLE_MONETIZATION:
 * When set to false:
 * - Hides all pricing navigation links, PRO badges, and subscription tiers from the UI.
 * - Sets all newly uploaded creations to 'free' by default without showing gating selectors.
 * - Unlocks all existing vaults and bypasses ad requirements across the platform.
 * - Replaces the /pricing page with a celebratory notice explaining that Olin is 100% free until reaching 100 monthly active users.
 * 
 * To activate the full Whop subscription monetization engine when ready, simply change this flag to true!
 */
export const ENABLE_MONETIZATION = true;

/**
 * ENABLE_ADS:
 * When set to false:
 * - No ad scripts, containers, service workers, or tracking listeners execute.
 * - Legacy "ad_supported" posts are treated as free content.
 * - Payout calculation functions and backend schemas remain intact for potential re-enablement.
 */
export const ENABLE_ADS = false;
