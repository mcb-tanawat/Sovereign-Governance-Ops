import React from 'react';
import { 
  Users, 
  Coins, 
  Vault, 
  Activity, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Zap,
  ArrowRight,
  Database
} from 'lucide-react';
import { TreasuryStats, InboundGatewayStatus, MeeChainMember, ExternalAssetSnapshot } from '../types/index.js';

interface DashboardOverviewProps {
  treasury: TreasuryStats | null;
  gatewayStatus: InboundGatewayStatus | null;
  members: MeeChainMember[];
  snapshots: ExternalAssetSnapshot[];
  onNavigate: (tab: string) => void;
  onRefreshAll: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  treasury,
  gatewayStatus,
  members,
  snapshots,
  onNavigate,
  onRefreshAll
}) => {
  const verifiedCount = members.filter(m => m.verification_status === 'VERIFIED').length;
  const pendingCount = members.filter(m => m.verification_status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Sovereign Welcome & Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            MeeChain Sovereign Protocol · Epoch #{treasury?.current_epoch || 12}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            MeeChain Sovereign Governance &amp; Ops
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            ระบบเศรษฐกิจและระบบสมาชิกแยกอิสระจาก MintMe DEX โดยสมบูรณ์ โดยเชื่อมต่อข้อมูล T2PRAWANTA 
            ผ่าน <span className="text-emerald-400 font-semibold">Inbound Snapshot Gateway</span> เพื่อประเมินสิทธิ์และควบคุมคลังเหรียญ MCB
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('registration')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>เปิดฟอร์มลงทะเบียนสมาชิก</span>
            </button>
            <button
              onClick={() => onNavigate('exchange')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-all border border-slate-700 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>MCB Exchange Program</span>
            </button>
            <button
              onClick={() => onNavigate('governance')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs flex items-center gap-2 transition-all border border-slate-800 cursor-pointer"
            >
              <span>อ่านข้อกำหนด Governance v1.0</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">สมาชิกที่ยืนยันแล้ว</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{verifiedCount}</span>
            <span className="text-xs text-slate-400">/ {members.length} Total</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{pendingCount} คำขอรออนุมัติ</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">T2PRAWANTA Snapshotted</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {(treasury?.t2p_total_snapshotted || 230200).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">T2P</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>จาก MintMe Chain ID 24734</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">MCB Treasury Reserve</span>
            <Vault className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {((treasury?.mcb_in_reserve || 7850000) / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs text-slate-400">/ 10M Cap</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Vault Health: {treasury?.vault_health || 'OPTIMAL'}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Inbound RPC Block</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              #{gatewayStatus?.current_block?.toLocaleString() || '24,891,240'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>MintMe Node Latency: {gatewayStatus?.latency_ms || 118}ms</span>
          </div>
        </div>
      </div>

      {/* System Architecture Flow Diagram */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <span>โครงสร้างสถาปัตยกรรมระบบ (Sovereign Architecture Flow)</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          การแบ่งหน้าที่ระหว่าง External Market (MintMe) และ Sovereign Engine (MeeChain)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Box 1 */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 relative">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              External Layer
            </span>
            <h3 className="text-sm font-bold text-white mt-2 mb-1">MintMe DEX (T2PRAWANTA)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ตลาดซื้อขายเดิมภายนอก เป็นแหล่งอ้างอิงข้อมูล Read-Only ไม่มีอำนาจในระบบ Treasury ของ MeeChain
            </p>
            <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] font-mono text-slate-500">
              Chain ID: 24734 · RPC Node
            </div>
          </div>

          {/* Box 2 */}
          <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/30 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Inbound Gateway
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-white mt-2 mb-1">Membership &amp; Eligibility</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ตรวจสอบ Cryptographic Signature และคำนวณ Snapshot ยอดถือครองเพื่อจัดระดับสมาชิก (Standard / Contributor / Validator)
            </p>
            <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] font-mono text-emerald-400">
              Zero-Trust Proof · EIP-191
            </div>
          </div>

          {/* Box 3 */}
          <div className="p-5 rounded-xl bg-slate-950 border border-cyan-500/30 relative">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
              Sovereign Core
            </span>
            <h3 className="text-sm font-bold text-white mt-2 mb-1">MCB Economic Engine &amp; Treasury</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              บริหารคลังเหรียญ MCB, สิทธิ์แลกเปลี่ยน, Contribution Mining, และการควบคุม Vesting ป้องกันการเทขาย
            </p>
            <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] font-mono text-cyan-400">
              10,000,000 MCB Reserve Vault
            </div>
          </div>
        </div>
      </div>

      {/* Recent Members & Latest Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Members */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">สมาชิกที่ลงทะเบียนล่าสุด</h3>
              <p className="text-xs text-slate-400">ประวัติการยืนยันสิทธิ์สมาชิก MeeChain</p>
            </div>
            <button
              onClick={() => onNavigate('members')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {members.slice(0, 4).map((m) => (
              <div key={m.member_id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{m.member_id}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      m.membership_tier === 'VALIDATOR'
                        ? 'bg-purple-500/20 text-purple-300'
                        : m.membership_tier === 'CONTRIBUTOR'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {m.membership_tier}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    {m.wallet_address.slice(0, 8)}...{m.wallet_address.slice(-6)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-white">
                    {m.t2p_balance.toLocaleString()} T2P
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    โควตา: {m.exchange_quota_mcb.toLocaleString()} MCB
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Latest Snapshots */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Inbound Snapshots Audit Feed</h3>
              <p className="text-xs text-slate-400">หลักฐานการตรวจสอบจากบล็อกเชน MintMe</p>
            </div>
            <button
              onClick={onRefreshAll}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              รีเฟรช
            </button>
          </div>

          <div className="space-y-3">
            {snapshots.slice(0, 4).map((s) => (
              <div key={s.snapshot_id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 font-semibold">{s.snapshot_id}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Block #{s.block_height_checked.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    {s.wallet_address.slice(0, 10)}...
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {s.balance_verified.toLocaleString()} T2P
                  </span>
                  <span className="block text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Proof Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
