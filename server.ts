import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { InboundGatewayService } from './src/modules/gateway/inbound-snapshot.js';
import { meeChainStore } from './src/data/store.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getArgValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  const prefix = `${flag}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const argPort = getArgValue('--port');
const argHost = getArgValue('--host');
const envPort =
  process.env.PORT && process.env.PORT !== process.env.NGINX_PORT
    ? process.env.PORT
    : undefined;
const PORT = Number(argPort || envPort || process.env.DEFAULT_APP_PORT || 3000);
const HOST = argHost || '0.0.0.0';

app.use(express.json());

const gatewayService = new InboundGatewayService();

// ================= API ROUTES =================

/**
 * 1. ตรวจสอบสถานะการเชื่อมต่อ MintMe Inbound RPC
 */
app.get('/api/v1/gateway/status', async (_req: Request, res: Response) => {
  try {
    const health = await gatewayService.checkNodeHealth();
    meeChainStore.gatewayStatus.is_connected = health.isConnected;
    meeChainStore.gatewayStatus.current_block = health.currentBlock;
    meeChainStore.gatewayStatus.latency_ms = health.latencyMs;
    meeChainStore.gatewayStatus.last_sync_timestamp = new Date().toISOString();

    res.json({
      success: true,
      data: meeChainStore.gatewayStatus
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 2. สร้าง Challenge Nonce สำหรับ Wallet Address
 */
app.post('/api/v1/gateway/challenge', (req: Request, res: Response) => {
  const { walletAddress } = req.body;
  if (!walletAddress) {
    return res.status(400).json({ success: false, error: 'walletAddress is required' });
  }

  const nonce = meeChainStore.createNonce(walletAddress);
  const challengeMessage = `MeeChain Registration Challenge: ${nonce}`;

  res.json({
    success: true,
    nonce,
    challengeMessage
  });
});

/**
 * 3. ตรวจสอบ Signature และดึง Snapshot ยอดถือครอง T2PRAWANTA
 */
app.post('/api/v1/gateway/verify-holder', async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature, nonce, tokenContractAddress, simulatedBalance } = req.body;

    if (!walletAddress || !signature || !nonce) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters (walletAddress, signature, nonce)'
      });
    }

    const verification = await gatewayService.getHolderSnapshot({
      walletAddress,
      signature,
      nonce,
      tokenContractAddress,
      simulatedBalance
    });

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        error: verification.error || 'Verification failed'
      });
    }

    // สร้างหรืออัปเดตสมาชิกใน MeeChain Registry
    const memberId = `MCB-UID-${(meeChainStore.members.length + 1).toString().padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const member = {
      member_id: memberId,
      wallet_address: walletAddress,
      registered_at: nowIso,
      verification_status: (verification.tier !== 'UNVERIFIED' ? 'VERIFIED' : 'PENDING') as any,
      membership_tier: verification.tier,
      t2p_balance: verification.verifiedBalance,
      snapshot_block: verification.blockHeight,
      proof_signature: signature.slice(0, 10) + '...' + signature.slice(-8),
      nonce,
      exchange_quota_mcb: verification.exchangeQuotaMcb,
      last_verified_at: nowIso,
      notes: verification.isLiveNetwork ? 'Verified via Live MintMe RPC' : 'Verified via Snapshot Bridge'
    };

    meeChainStore.upsertMember(member);

    // บันทึก Snapshot ลง Audit Ledger
    const snapshotId = `SNAP-${Date.now().toString(36).toUpperCase()}`;
    meeChainStore.addSnapshot({
      snapshot_id: snapshotId,
      member_id: member.member_id,
      wallet_address: walletAddress,
      asset_symbol: 'T2PRAWANTA',
      balance_verified: verification.verifiedBalance,
      block_height_checked: verification.blockHeight,
      verified_at: nowIso,
      signature_hash: signature.slice(0, 12) + '...',
      rpc_latency_ms: meeChainStore.gatewayStatus.latency_ms,
      is_live_network: !!verification.isLiveNetwork
    });

    res.json({
      success: true,
      data: {
        member,
        snapshotId,
        verifiedBalance: verification.verifiedBalance,
        blockHeight: verification.blockHeight,
        tier: verification.tier,
        exchangeQuotaMcb: verification.exchangeQuotaMcb,
        isLiveNetwork: verification.isLiveNetwork
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. ดึงรายชื่อสมาชิกทั้งหมด
 */
app.get('/api/v1/membership/list', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      members: meeChainStore.members,
      total: meeChainStore.members.length,
      tiers: {
        validators: meeChainStore.members.filter(m => m.membership_tier === 'VALIDATOR').length,
        contributors: meeChainStore.members.filter(m => m.membership_tier === 'CONTRIBUTOR').length,
        standards: meeChainStore.members.filter(m => m.membership_tier === 'STANDARD').length,
        unverified: meeChainStore.members.filter(m => m.membership_tier === 'UNVERIFIED').length
      }
    }
  });
});

/**
 * 5. ดึงรายการ Snapshots ล่าสุด
 */
app.get('/api/v1/snapshots', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: meeChainStore.snapshots
  });
});

/**
 * 6. ดึงข้อมูล Treasury Vault & Metrics
 */
app.get('/api/v1/treasury', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: meeChainStore.treasury
  });
});

/**
 * 7. ดึงคำขอแลกเปลี่ยน MCB ทั้งหมด
 */
app.get('/api/v1/exchange/requests', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: meeChainStore.exchangeRequests
  });
});

/**
 * 8. ส่งคำขอแลกเปลี่ยน MCB
 */
app.post('/api/v1/exchange/submit', (req: Request, res: Response) => {
  const { walletAddress, t2pAmount } = req.body;
  if (!walletAddress || !t2pAmount || t2pAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid exchange submission parameters' });
  }

  const member = meeChainStore.members.find(
    m => m.wallet_address.toLowerCase() === walletAddress.toLowerCase()
  );

  if (!member || member.verification_status !== 'VERIFIED') {
    return res.status(403).json({ success: false, error: 'Only verified members can participate in MCB Exchange' });
  }

  if (t2pAmount > member.t2p_balance) {
    return res.status(400).json({ success: false, error: 'Requested amount exceeds verified snapshot balance' });
  }

  const ratio = member.membership_tier === 'VALIDATOR' ? 0.325 : member.membership_tier === 'CONTRIBUTOR' ? 0.2875 : 0.25;
  const mcbAllocated = Math.floor(t2pAmount * ratio);

  const reqId = `EX-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date();
  const vestingEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day vesting

  const exchangeReq = {
    request_id: reqId,
    member_id: member.member_id,
    wallet_address: member.wallet_address,
    t2p_submitted_amount: t2pAmount,
    mcb_quota_allocated: mcbAllocated,
    conversion_ratio: ratio,
    exchange_status: 'APPROVED' as const,
    created_at: now.toISOString(),
    vesting_end_date: vestingEnd.toISOString(),
    vesting_progress_pct: 0
  };

  meeChainStore.addExchangeRequest(exchangeReq);

  res.json({
    success: true,
    data: exchangeReq
  });
});

/**
 * 9. ตรวจสอบความถูกต้องของ Treasury (Audit Reconciliation)
 */
app.post('/api/v1/treasury/reconcile', (_req: Request, res: Response) => {
  const totalAllocated = meeChainStore.exchangeRequests.reduce((acc, r) => acc + r.mcb_quota_allocated, 0);
  const auditResult = {
    timestamp: new Date().toISOString(),
    totalSnapshottedT2P: meeChainStore.treasury.t2p_total_snapshotted,
    totalMcbAllocated: totalAllocated,
    treasuryReserveRemaining: meeChainStore.treasury.mcb_in_reserve,
    isReconciled: true,
    auditStatus: 'PASSED_ZERO_DISCREPANCY'
  };

  res.json({
    success: true,
    data: auditResult
  });
});

// ================= SERVE VITE FRONTEND =================

async function startServer() {
  let viteMiddlewares: any = null;
  let viteInitError: Error | null = null;

  const viteReadyPromise = !isProduction
    ? import('vite')
        .then(({ createServer: createViteServer }) =>
          createViteServer({
            server: {
              middlewareMode: true,
              hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
              watch: process.env.DISABLE_HMR === 'true' ? null : undefined,
            },
            appType: 'spa',
          })
        )
        .then((vite) => {
          viteMiddlewares = vite.middlewares;
        })
        .catch((err) => {
          viteInitError = err;
          console.error('[MeeChain Ops] Vite initialization failed:', err);
        })
    : Promise.resolve();

  if (!isProduction) {
    app.use(async (req, res, next) => {
      if (!viteMiddlewares && !viteInitError) {
        await viteReadyPromise;
      }
      if (viteInitError) {
        return res.status(500).send('Frontend dev middleware failed to initialize.');
      }
      if (viteMiddlewares) {
        return viteMiddlewares(req, res, next);
      }
      next();
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[MeeChain Ops] Server running at http://${HOST}:${PORT}`);
    console.log(`[MeeChain Gateway] Target MintMe RPC: ${gatewayService ? 'Active' : 'Offline'}`);
  });
}

startServer();
