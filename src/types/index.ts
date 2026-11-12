export type MembershipTier = 'STANDARD' | 'CONTRIBUTOR' | 'VALIDATOR' | 'UNVERIFIED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
export type ExchangeStatus = 'QUEUED' | 'APPROVED' | 'VESTING' | 'DISTRIBUTED' | 'REJECTED';

export interface MeeChainMember {
  member_id: string;               // e.g., MCB-UID-8831
  wallet_address: string;          // MintMe / EVM address
  registered_at: string;           // ISO Timestamp
  verification_status: VerificationStatus;
  membership_tier: MembershipTier;
  t2p_balance: number;
  snapshot_block: number;
  proof_signature: string;
  nonce: string;
  exchange_quota_mcb: number;
  last_verified_at: string;
  notes?: string;
}

export interface ExternalAssetSnapshot {
  snapshot_id: string;
  member_id: string;
  wallet_address: string;
  asset_symbol: 'T2PRAWANTA';
  balance_verified: number;
  block_height_checked: number;
  verified_at: string;
  signature_hash: string;
  rpc_latency_ms: number;
  is_live_network: boolean;
}

export interface MCBExchangeRequest {
  request_id: string;
  member_id: string;
  wallet_address: string;
  t2p_submitted_amount: number;
  mcb_quota_allocated: number;
  conversion_ratio: number; // e.g. 1 T2P = 0.25 MCB
  exchange_status: ExchangeStatus;
  created_at: string;
  vesting_end_date: string;
  vesting_progress_pct: number;
  tx_hash_mcb_distribution?: string;
}

export interface TreasuryStats {
  mcb_total_supply: number;
  mcb_in_reserve: number;
  mcb_allocated_exchange: number;
  mcb_distributed: number;
  mcb_contribution_mining_pool: number;
  t2p_total_snapshotted: number;
  verified_members_count: number;
  pending_members_count: number;
  conversion_ratio_t2p_to_mcb: number;
  current_epoch: number;
  epoch_cap_mcb: number;
  vault_health: 'OPTIMAL' | 'DEGRADED' | 'WARNING';
}

export interface InboundGatewayStatus {
  rpc_url: string;
  chain_id: number;
  network_name: string;
  is_connected: boolean;
  current_block: number;
  latency_ms: number;
  last_sync_timestamp: string;
  t2p_contract_address: string;
}
