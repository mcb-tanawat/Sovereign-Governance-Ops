import {
  MeeChainMember,
  ExternalAssetSnapshot,
  MCBExchangeRequest,
  TreasuryStats,
  InboundGatewayStatus
} from '../types/index.js';

class MeeChainStore {
  public members: MeeChainMember[] = [
    {
      member_id: 'MCB-UID-001',
      wallet_address: '0x71C8405d2e5Cb3b7253bC6514716a560ec976F26',
      registered_at: '2026-10-15T08:30:00Z',
      verification_status: 'VERIFIED',
      membership_tier: 'VALIDATOR',
      t2p_balance: 145000,
      snapshot_block: 24881020,
      proof_signature: '0x3a4b...89efc1',
      nonce: 'MCB-NONCE-882194',
      exchange_quota_mcb: 47125,
      last_verified_at: '2026-11-10T14:20:00Z',
      notes: 'Genesis Validator / Early T2PRAWANTA backer'
    },
    {
      member_id: 'MCB-UID-002',
      wallet_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      registered_at: '2026-10-22T11:15:00Z',
      verification_status: 'VERIFIED',
      membership_tier: 'CONTRIBUTOR',
      t2p_balance: 42500,
      snapshot_block: 24883490,
      proof_signature: '0x5b1e...27fa90',
      nonce: 'MCB-NONCE-119420',
      exchange_quota_mcb: 12218,
      last_verified_at: '2026-11-09T09:40:00Z',
      notes: 'Active contributor in community mining'
    },
    {
      member_id: 'MCB-UID-003',
      wallet_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      registered_at: '2026-10-28T16:45:00Z',
      verification_status: 'VERIFIED',
      membership_tier: 'STANDARD',
      t2p_balance: 8200,
      snapshot_block: 24886110,
      proof_signature: '0x98ca...4412ab',
      nonce: 'MCB-NONCE-332901',
      exchange_quota_mcb: 2050,
      last_verified_at: '2026-11-08T18:10:00Z',
      notes: 'Standard Tier verified holder'
    },
    {
      member_id: 'MCB-UID-004',
      wallet_address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      registered_at: '2026-11-02T19:00:00Z',
      verification_status: 'VERIFIED',
      membership_tier: 'CONTRIBUTOR',
      t2p_balance: 28000,
      snapshot_block: 24888200,
      proof_signature: '0x10ae...99ac3d',
      nonce: 'MCB-NONCE-440218',
      exchange_quota_mcb: 8050,
      last_verified_at: '2026-11-10T12:00:00Z',
      notes: 'Verified via Inbound RPC Snapshot'
    },
    {
      member_id: 'MCB-UID-005',
      wallet_address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
      registered_at: '2026-11-11T04:20:00Z',
      verification_status: 'PENDING',
      membership_tier: 'UNVERIFIED',
      t2p_balance: 6500,
      snapshot_block: 24890500,
      proof_signature: 'Awaiting Signature Challenge',
      nonce: 'MCB-NONCE-551029',
      exchange_quota_mcb: 0,
      last_verified_at: '2026-11-11T04:20:00Z',
      notes: 'Pending signature verification'
    }
  ];

  public snapshots: ExternalAssetSnapshot[] = [
    {
      snapshot_id: 'SNAP-2026-11-001',
      member_id: 'MCB-UID-001',
      wallet_address: '0x71C8405d2e5Cb3b7253bC6514716a560ec976F26',
      asset_symbol: 'T2PRAWANTA',
      balance_verified: 145000,
      block_height_checked: 24881020,
      verified_at: '2026-11-10T14:20:00Z',
      signature_hash: '0x3a4b51...89efc1',
      rpc_latency_ms: 124,
      is_live_network: true
    },
    {
      snapshot_id: 'SNAP-2026-11-002',
      member_id: 'MCB-UID-002',
      wallet_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      asset_symbol: 'T2PRAWANTA',
      balance_verified: 42500,
      block_height_checked: 24883490,
      verified_at: '2026-11-09T09:40:00Z',
      signature_hash: '0x5b1e89...27fa90',
      rpc_latency_ms: 148,
      is_live_network: true
    },
    {
      snapshot_id: 'SNAP-2026-11-003',
      member_id: 'MCB-UID-003',
      wallet_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      asset_symbol: 'T2PRAWANTA',
      balance_verified: 8200,
      block_height_checked: 24886110,
      verified_at: '2026-11-08T18:10:00Z',
      signature_hash: '0x98ca12...4412ab',
      rpc_latency_ms: 110,
      is_live_network: true
    }
  ];

  public exchangeRequests: MCBExchangeRequest[] = [
    {
      request_id: 'EX-2026-081',
      member_id: 'MCB-UID-001',
      wallet_address: '0x71C8405d2e5Cb3b7253bC6514716a560ec976F26',
      t2p_submitted_amount: 50000,
      mcb_quota_allocated: 16250,
      conversion_ratio: 0.325,
      exchange_status: 'DISTRIBUTED',
      created_at: '2026-10-18T10:00:00Z',
      vesting_end_date: '2026-11-18T10:00:00Z',
      vesting_progress_pct: 100,
      tx_hash_mcb_distribution: '0x88f219...ab401e'
    },
    {
      request_id: 'EX-2026-082',
      member_id: 'MCB-UID-002',
      wallet_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      t2p_submitted_amount: 20000,
      mcb_quota_allocated: 5750,
      conversion_ratio: 0.2875,
      exchange_status: 'VESTING',
      created_at: '2026-10-25T14:30:00Z',
      vesting_end_date: '2026-11-25T14:30:00Z',
      vesting_progress_pct: 55,
      tx_hash_mcb_distribution: '0x44dc19...f89021'
    },
    {
      request_id: 'EX-2026-083',
      member_id: 'MCB-UID-004',
      wallet_address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      t2p_submitted_amount: 15000,
      mcb_quota_allocated: 4312,
      conversion_ratio: 0.2875,
      exchange_status: 'APPROVED',
      created_at: '2026-11-04T08:15:00Z',
      vesting_end_date: '2026-12-04T08:15:00Z',
      vesting_progress_pct: 15
    },
    {
      request_id: 'EX-2026-080',
      member_id: 'MCB-UID-005',
      wallet_address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
      t2p_submitted_amount: 3000,
      mcb_quota_allocated: 750,
      conversion_ratio: 0.25,
      exchange_status: 'REJECTED',
      created_at: '2026-11-01T09:00:00Z',
      vesting_end_date: '2026-12-01T09:00:00Z',
      vesting_progress_pct: 0
    }
  ];

  public treasury: TreasuryStats = {
    mcb_total_supply: 10000000, // 10,000,000 MCB Sovereign Cap
    mcb_in_reserve: 7850000,
    mcb_allocated_exchange: 850000,
    mcb_distributed: 1300000,
    mcb_contribution_mining_pool: 2500000,
    t2p_total_snapshotted: 230200,
    verified_members_count: 4,
    pending_members_count: 1,
    conversion_ratio_t2p_to_mcb: 0.25,
    current_epoch: 12,
    epoch_cap_mcb: 250000,
    vault_health: 'OPTIMAL'
  };

  public gatewayStatus: InboundGatewayStatus = {
    rpc_url: 'https://node1.mintme.com',
    chain_id: 24734,
    network_name: 'MintMe Network',
    is_connected: true,
    current_block: 24891240,
    latency_ms: 118,
    last_sync_timestamp: new Date().toISOString(),
    t2p_contract_address: '0x1276d4948a3f898e4f107bdc2a93b49c7163c467'
  };

  private nonces = new Map<string, { nonce: string; timestamp: number }>();

  public createNonce(walletAddress: string): string {
    const nonce = `MCB-NONCE-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.nonces.set(walletAddress.toLowerCase(), { nonce, timestamp: Date.now() });
    return nonce;
  }

  public getNonce(walletAddress: string): string | null {
    const entry = this.nonces.get(walletAddress.toLowerCase());
    return entry ? entry.nonce : null;
  }

  public upsertMember(member: MeeChainMember) {
    const idx = this.members.findIndex(m => m.wallet_address.toLowerCase() === member.wallet_address.toLowerCase());
    if (idx >= 0) {
      this.members[idx] = { ...this.members[idx], ...member };
    } else {
      this.members.unshift(member);
    }
    this.updateStats();
  }

  public addSnapshot(snapshot: ExternalAssetSnapshot) {
    this.snapshots.unshift(snapshot);
    this.treasury.t2p_total_snapshotted += snapshot.balance_verified;
  }

  public addExchangeRequest(req: MCBExchangeRequest) {
    this.exchangeRequests.unshift(req);
    this.treasury.mcb_allocated_exchange += req.mcb_quota_allocated;
    this.treasury.mcb_in_reserve = Math.max(0, this.treasury.mcb_in_reserve - req.mcb_quota_allocated);
  }

  private updateStats() {
    this.treasury.verified_members_count = this.members.filter(m => m.verification_status === 'VERIFIED').length;
    this.treasury.pending_members_count = this.members.filter(m => m.verification_status === 'PENDING').length;
  }
}

export const meeChainStore = new MeeChainStore();
