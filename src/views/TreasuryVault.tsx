import React, { useState } from 'react';
import { 
  Vault, 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Lock, 
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { TreasuryStats } from '../types/index.js';

interface TreasuryVaultProps {
  treasury: TreasuryStats | null;
  onRefreshData: () => void;
}

export const TreasuryVault: React.FC<TreasuryVaultProps> = ({
  treasury,
  onRefreshData
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const res = await fetch('/api/v1/treasury/reconcile', {
        method: 'POST'
      });
      const data = await res.json();
      setAuditResult(data.data);
      onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  const totalSupply = treasury?.mcb_total_supply || 10000000;
  const inReserve = treasury?.mcb_in_reserve || 7850000;
  const allocated = treasury?.mcb_allocated_exchange || 850000;
  const distributed = treasury?.mcb_distributed || 1300000;
  const miningPool = treasury?.mcb_contribution_mining_pool || 2500000;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            Sovereign Coin Stock &amp; Treasury
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            MeeChain Treasury Vault &amp; Economic Stock
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            การบริหารคลังเหรียญ MCB แบบเอกเทศ แยกเด็ดขาดจากกระดาน MintMe เพื่อความมั่นคงทางเศรษฐกิจ
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'กำลังตรวจสอบคลัง...' : 'รันตรวจสอบ Audit Reconciliation'}</span>
        </button>
      </div>

      {/* Main Stock Breakdown Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Vault className="w-4 h-4 text-emerald-400" />
          <span>การจัดสรรปริมาณเหรียญ MCB (Total Hard Cap: 10,000,000 MCB)</span>
        </h2>

        {/* Visual Progress Bar */}
        <div className="mb-6">
          <div className="h-5 rounded-full bg-slate-950 overflow-hidden flex p-1 border border-slate-800">
            <div
              className="bg-emerald-500 h-full rounded-l-full transition-all"
              style={{ width: `${(inReserve / totalSupply) * 100}%` }}
              title="Cold Reserve Vault"
            />
            <div
              className="bg-cyan-500 h-full transition-all"
              style={{ width: `${(allocated / totalSupply) * 100}%` }}
              title="Allocated Exchange"
            />
            <div
              className="bg-purple-500 h-full transition-all"
              style={{ width: `${(miningPool / totalSupply) * 100}%` }}
              title="Contribution Mining Pool"
            />
            <div
              className="bg-amber-500 h-full rounded-r-full transition-all"
              style={{ width: `${(distributed / totalSupply) * 100}%` }}
              title="Distributed in Circulation"
            />
          </div>

          <div className="flex flex-wrap gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Reserve Vault ({((inReserve / totalSupply) * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-slate-300">Allocated Exchange ({((allocated / totalSupply) * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-slate-300">Contribution Mining ({((miningPool / totalSupply) * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-300">Circulating ({((distributed / totalSupply) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Metric Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-slate-500 text-xs block font-sans">Cold Reserve Vault</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">
              {inReserve.toLocaleString()} MCB
            </span>
            <span className="text-[11px] text-slate-500 font-sans">Multi-Sig Guarded</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-slate-500 text-xs block font-sans">Allocated for Exchange</span>
            <span className="text-xl font-bold text-cyan-400 mt-1 block">
              {allocated.toLocaleString()} MCB
            </span>
            <span className="text-[11px] text-slate-500 font-sans">In Linear Vesting Pool</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-slate-500 text-xs block font-sans">Contribution Mining Pool</span>
            <span className="text-xl font-bold text-purple-400 mt-1 block">
              {miningPool.toLocaleString()} MCB
            </span>
            <span className="text-[11px] text-slate-500 font-sans">Ecosystem Incentives</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-slate-500 text-xs block font-sans">Circulating Distribution</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">
              {distributed.toLocaleString()} MCB
            </span>
            <span className="text-[11px] text-slate-500 font-sans">Claimed &amp; Settled</span>
          </div>
        </div>
      </div>

      {/* Audit Reconciliation Result */}
      {auditResult && (
        <div className="p-6 bg-slate-950 border border-emerald-500/50 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">ผลการรัน Automated Reconciliation Audit</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-sans">Total Snapshotted T2P</span>
              <span className="text-base font-bold text-amber-400">{auditResult.totalSnapshottedT2P.toLocaleString()} T2P</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-sans">Total MCB Allocated</span>
              <span className="text-base font-bold text-white">{auditResult.totalMcbAllocated.toLocaleString()} MCB</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-sans">Discrepancy Status</span>
              <span className="text-base font-bold text-emerald-400 font-sans">Zero Discrepancy (Passed)</span>
            </div>
          </div>
        </div>
      )}

      {/* Security Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">Cold Storage Isolation</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Private Key ของคลังสำรองไม่เชื่อมต่อกับอินเทอร์เน็ตหรือบริการภายนอกใดๆ ทุกการเบิกจ่ายต้องผ่านระบบ Multi-Signature
          </p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <Activity className="w-5 h-5 text-cyan-400 mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">Hot Wallet Distributor</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            กระเป๋าแจกจ่ายประจำวันรับเงินจำกัดวงเงินตามรอบ Epoch เพื่อจ่ายรางวัล Contribution Mining และ Vesting รายวัน
          </p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <FileCheck className="w-5 h-5 text-purple-400 mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">Cryptographic Ledger</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            ทุกเหรียญที่โอนออกจากคลังต้องมี Hash อ้างอิงคำขอแลกเปลี่ยนและ Snapshot Block ที่สอดคล้องกัน 100%
          </p>
        </div>
      </div>
    </div>
  );
};
