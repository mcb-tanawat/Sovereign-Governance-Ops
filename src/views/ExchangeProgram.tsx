import React, { useState } from 'react';
import { 
  Repeat, 
  Coins, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Percent, 
  Sparkles,
  Award
} from 'lucide-react';
import { MeeChainMember, MCBExchangeRequest } from '../types/index.js';
import { VestingScheduleChart } from '../components/VestingScheduleChart.js';

interface ExchangeProgramProps {
  members: MeeChainMember[];
  exchangeRequests: MCBExchangeRequest[];
  initialWallet?: string;
  onRefreshData: () => void;
}

export const ExchangeProgram: React.FC<ExchangeProgramProps> = ({
  members,
  exchangeRequests,
  initialWallet = '',
  onRefreshData
}) => {
  const verifiedMembers = members.filter(m => m.verification_status === 'VERIFIED');
  
  const [selectedWallet, setSelectedWallet] = useState<string>(
    initialWallet || (verifiedMembers[0]?.wallet_address || '')
  );
  const [t2pAmount, setT2pAmount] = useState<number>(10000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentMember = verifiedMembers.find(
    m => m.wallet_address.toLowerCase() === selectedWallet.toLowerCase()
  );

  // Calculate Conversion Ratio and MCB outcome
  const getMultiplier = (tier?: string) => {
    if (tier === 'VALIDATOR') return { ratio: 0.325, bonus: '+30% (Validator VIP)' };
    if (tier === 'CONTRIBUTOR') return { ratio: 0.2875, bonus: '+15% (Contributor)' };
    return { ratio: 0.25, bonus: 'Standard 1:0.25' };
  };

  const { ratio, bonus } = getMultiplier(currentMember?.membership_tier);
  const estimatedMcb = Math.floor(t2pAmount * ratio);

  const handleSubmitExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) {
      setSubmitError('กรุณาเลือกสมาชิกที่ผ่านการยืนยันสิทธิ์แล้ว');
      return;
    }

    if (t2pAmount > currentMember.t2p_balance) {
      setSubmitError(`จำนวนที่ระบุเกินกว่ายอดคงเหลือที่บันทึกไว้ (${currentMember.t2p_balance.toLocaleString()} T2P)`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch('/api/v1/exchange/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: currentMember.wallet_address,
          t2pAmount
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Exchange submission failed');
      }

      setSubmitSuccess(`ส่งคำขอแลกเปลี่ยนสำเร็จ! รหัสคำขอ: ${data.data.request_id} (จำนวน ${data.data.mcb_quota_allocated.toLocaleString()} MCB พร้อมกำหนดการ Vesting 30 วัน)`);
      onRefreshData();
    } catch (err: any) {
      setSubmitError(err.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <Repeat className="w-3.5 h-3.5" />
          MeeChain Sovereign Exchange
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          MCB Exchange Program &amp; Vesting Schedule
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          ระบบแลกเปลี่ยนสินทรัพย์ T2PRAWANTA เป็นเหรียญประจำเครือข่าย MeeChain (MCB) 
          พร้อมกลไก Linear Vesting เพื่อรักษาสมดุลและเสถียรภาพเศรษฐกิจของ Treasury
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Exchange Form & Calculator (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <span>คำนวณและส่งคำขอแลกเปลี่ยน (MCB Allocation)</span>
          </h2>

          <form onSubmit={handleSubmitExchange} className="space-y-5">
            {/* Wallet Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                เลือกสมาชิกที่มีสิทธิ์ (Verified Member Wallet)
              </label>
              {verifiedMembers.length === 0 ? (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
                  ยังไม่มีสมาชิกที่ยืนยันสิทธิ์ กรุณาไปที่หน้าฟอร์มลงทะเบียนเพื่อยืนยันสิทธิ์ก่อน
                </div>
              ) : (
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {verifiedMembers.map((m) => (
                    <option key={m.member_id} value={m.wallet_address}>
                      {m.member_id} — {m.wallet_address.slice(0, 10)}... ({m.membership_tier} | {m.t2p_balance.toLocaleString()} T2P)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Member Snapshot Summary */}
            {currentMember && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Tier สมาชิก</span>
                  <span className="font-bold text-emerald-400 font-mono">{currentMember.membership_tier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">T2P ใน Snapshot</span>
                  <span className="font-bold text-amber-400 font-mono">{currentMember.t2p_balance.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">อัตราแลกเปลี่ยน</span>
                  <span className="font-bold text-cyan-400 font-mono">{ratio} ({bonus})</span>
                </div>
              </div>
            )}

            {/* T2P Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  จำนวน T2PRAWANTA ที่ต้องการส่งแลก
                </label>
                {currentMember && (
                  <button
                    type="button"
                    onClick={() => setT2pAmount(currentMember.t2p_balance)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer font-mono"
                  >
                    สูงสุด (Max: {currentMember.t2p_balance.toLocaleString()})
                  </button>
                )}
              </div>
              <input
                type="number"
                min={100}
                max={currentMember ? currentMember.t2p_balance : 1000000}
                value={t2pAmount}
                onChange={(e) => setT2pAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Conversion Result Box */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/30 to-cyan-950/30 border border-emerald-500/30">
              <span className="text-[11px] text-slate-400 block mb-1">ผลลัพธ์เหรียญที่จะได้รับ (Estimated Allocation):</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {estimatedMcb.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-emerald-400">MCB</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Linear Vesting Schedule: ปลดล็อกเป็นรายวันครบใน 30 วัน</span>
              </p>
            </div>

            {submitError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-700 rounded-xl text-emerald-300 text-xs">
                {submitSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !currentMember}
              className="w-full py-3.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังส่งคำขอไปยัง Treasury...' : 'ยืนยันและส่งคำขอแลกเปลี่ยน MCB'}
            </button>
          </form>
        </div>

        {/* Rules & Policy Reference (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>กติกาการจัดสรรโควตา (Conversion Matrix)</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-emerald-400 block">STANDARD TIER</strong>
                  <span className="text-[11px] text-slate-400">ถือครอง 1,000 - 9,999 T2P</span>
                </div>
                <span className="font-mono font-bold text-white">1 : 0.2500</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-cyan-400 block">CONTRIBUTOR TIER</strong>
                  <span className="text-[11px] text-slate-400">ถือครอง 10,000 - 99,999 T2P</span>
                </div>
                <span className="font-mono font-bold text-white">1 : 0.2875 (+15%)</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-purple-400 block">VALIDATOR TIER</strong>
                  <span className="text-[11px] text-slate-400">ถือครอง 100,000+ T2P</span>
                </div>
                <span className="font-mono font-bold text-white">1 : 0.3250 (+30%)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              มาตรการรักษาสมดุล Treasury (Anti-Dumping)
            </h4>
            <p className="leading-relaxed">
              • การแลกเปลี่ยนเป็นระบบสิทธิ์ภายในของ MeeChain ไม่ใช่การ Swap อัตโนมัติบน MintMe DEX
            </p>
            <p className="leading-relaxed">
              • ควบคุมเพดานโควตารวม (Cap per Epoch) ที่ 250,000 MCB ต่อรอบเพื่อรักษาเสถียรภาพมูลค่า
            </p>
          </div>
        </div>
      </div>

      {/* D3-based Vesting Schedule Chart for Pending MCB Allocations */}
      <VestingScheduleChart exchangeRequests={exchangeRequests} />

      {/* Active Exchange Requests Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">
          ประวัติคำขอและสถานะการปลดล็อก (Vesting Queue)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Request ID</th>
                <th className="py-2.5 px-4">Wallet</th>
                <th className="py-2.5 px-4">T2P Submitted</th>
                <th className="py-2.5 px-4">MCB Allocated</th>
                <th className="py-2.5 px-4">Ratio</th>
                <th className="py-2.5 px-4">Vesting Progress</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {exchangeRequests.map((req) => (
                <tr key={req.request_id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 text-emerald-400 font-bold">{req.request_id}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {req.wallet_address.slice(0, 8)}...{req.wallet_address.slice(-6)}
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-400">
                    {req.t2p_submitted_amount.toLocaleString()} T2P
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {req.mcb_quota_allocated.toLocaleString()} MCB
                  </td>
                  <td className="py-3 px-4 text-slate-400">{req.conversion_ratio}</td>
                  <td className="py-3 px-4 w-48 font-sans">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-1.5 rounded-full"
                          style={{ width: `${req.vesting_progress_pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {req.vesting_progress_pct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.exchange_status === 'DISTRIBUTED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : req.exchange_status === 'VESTING'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {req.exchange_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
