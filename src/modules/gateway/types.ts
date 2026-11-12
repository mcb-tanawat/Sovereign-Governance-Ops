export type MembershipTier = 'STANDARD' | 'CONTRIBUTOR' | 'VALIDATOR' | 'UNVERIFIED';

export interface VerificationResultPayload {
  success: boolean;
  walletAddress: string;
  verifiedBalance: number;
  blockHeight: number;
  tier: MembershipTier;
  exchangeQuotaMcb: number;
  isLiveNetwork?: boolean;
  error?: string;
}
