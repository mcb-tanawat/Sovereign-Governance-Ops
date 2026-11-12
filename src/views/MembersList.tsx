import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  Clock, 
  X,
  ChevronDown,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { MeeChainMember, MembershipTier, VerificationStatus } from '../types/index.js';

interface MembersListProps {
  members: MeeChainMember[];
  onSelectMemberForExchange: (walletAddress: string) => void;
  onNavigateToRegister: () => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  members,
  onSelectMemberForExchange,
  onNavigateToRegister
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [selectedPrefix, setSelectedPrefix] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedMember, setSelectedMember] = useState<MeeChainMember | null>(null);

  // Extract unique 4-character address prefixes (e.g. "0x71", "0x3C") for quick dropdown selection
  const availablePrefixes = useMemo(() => {
    const prefixes = new Set<string>();
    members.forEach((m) => {
      if (m.wallet_address.startsWith('0x') && m.wallet_address.length >= 6) {
        prefixes.add(m.wallet_address.slice(0, 6).toLowerCase());
      }
    });
    return Array.from(prefixes).sort();
  }, [members]);

  // Combined filtering logic
  const filtered = useMemo(() => {
    return members.filter((m) => {
      const query = searchTerm.trim().toLowerCase();

      // Search bar matches: member_id, wallet_address prefix or substring
      const matchesSearch =
        query === '' ||
        m.member_id.toLowerCase().includes(query) ||
        m.wallet_address.toLowerCase().startsWith(query) ||
        m.wallet_address.toLowerCase().includes(query);

      // Status filter dropdown (Active/Verified vs Pending)
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'VERIFIED' && m.verification_status === 'VERIFIED') ||
        (statusFilter === 'PENDING' && m.verification_status === 'PENDING');

      // Prefix filter dropdown
      const matchesPrefix =
        selectedPrefix === 'ALL' ||
        m.wallet_address.toLowerCase().startsWith(selectedPrefix.toLowerCase());

      // Tier filter
      const matchesTier =
        selectedTier === 'ALL' || m.membership_tier === selectedTier;

      return matchesSearch && matchesStatus && matchesPrefix && matchesTier;
    });
  }, [members, searchTerm, statusFilter, selectedPrefix, selectedTier]);

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'ALL' ||
    selectedPrefix !== 'ALL' ||
    selectedTier !== 'ALL';

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSelectedPrefix('ALL');
    setSelectedTier('ALL');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>MeeChain Membership &amp; Eligibility Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ทะเบียนสมาชิกและสิทธิ์การเข้าถึง MCB Economy อิงตามหลักฐาน Inbound T2PRAWANTA Snapshot
          </p>
        </div>
        <button
          onClick={onNavigateToRegister}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>+ ลงทะเบียนสมาชิกใหม่</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* 1. Search Bar (Search by Member ID or Address Prefix) */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ค้นหาด้วย Wallet Address, Address Prefix (เช่น 0x71...), หรือ Member ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                title="ล้างข้อความค้นหา"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 2. Status Filter Dropdown (Active/Verified vs Pending) */}
          <div className="sm:col-span-3 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors pr-8"
            >
              <option value="ALL">สถานะสมาชิกทั้งหมด (All Status)</option>
              <option value="VERIFIED">✓ Active / Verified เท่านั้น</option>
              <option value="PENDING">⏳ Pending / รอการตรวจสอบ</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* 3. Address Prefix Filter Dropdown */}
          <div className="sm:col-span-3 relative">
            <select
              value={selectedPrefix}
              onChange={(e) => setSelectedPrefix(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors pr-8"
            >
              <option value="ALL">Prefix กระเป๋าทั้งหมด (Any Prefix)</option>
              {availablePrefixes.map((pfx) => (
                <option key={pfx} value={pfx}>
                  Prefix: {pfx}...
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Tier Chips Row & Quick Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Tier:
            </span>
            {['ALL', 'VALIDATOR', 'CONTRIBUTOR', 'STANDARD', 'UNVERIFIED'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedTier === tier
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              พบ <strong className="text-emerald-400">{filtered.length}</strong> จาก {members.length} สมาชิก
            </span>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                title="ล้างตัวกรองทั้งหมด"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ล้างตัวกรอง</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Wallet Address (MintMe)</th>
                <th className="py-3 px-4">Membership Tier</th>
                <th className="py-3 px-4">T2P Verified Balance</th>
                <th className="py-3 px-4">MCB Quota</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((member) => (
                <tr
                  key={member.member_id}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  <td className="py-3.5 px-4 font-bold text-white">
                    {member.member_id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="hidden sm:inline font-mono">{member.wallet_address}</span>
                    <span className="sm:hidden font-mono">{member.wallet_address.slice(0, 8)}...{member.wallet_address.slice(-6)}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      member.membership_tier === 'VALIDATOR'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : member.membership_tier === 'CONTRIBUTOR'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : member.membership_tier === 'STANDARD'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {member.membership_tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">
                    {member.t2p_balance.toLocaleString()} T2P
                  </td>
                  <td className="py-3.5 px-4 font-bold text-cyan-400">
                    {member.exchange_quota_mcb.toLocaleString()} MCB
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    {member.verification_status === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active / Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMemberForExchange(member.wallet_address);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      แลก MCB
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-slate-400">ไม่พบสมาชิกตามเงื่อนไขที่เลือก</p>
                      <p className="text-xs text-slate-600">
                        ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "ล้างตัวกรอง" เพื่อแสดงรายชื่อทั้งหมด
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          ล้างตัวกรองทั้งหมด
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Modal / Drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400">{selectedMember.member_id}</span>
                <h3 className="text-lg font-bold text-white">รายละเอียดสิทธิ์สมาชิก MeeChain</h3>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl font-mono space-y-1.5 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Wallet:</span>
                  <span className="text-slate-200 break-all">{selectedMember.wallet_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={selectedMember.verification_status === 'VERIFIED' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {selectedMember.verification_status === 'VERIFIED' ? 'ACTIVE / VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tier:</span>
                  <span className="text-emerald-400 font-bold">{selectedMember.membership_tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified Balance:</span>
                  <span className="text-amber-400 font-bold">{selectedMember.t2p_balance.toLocaleString()} T2P</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Snapshot Block:</span>
                  <span className="text-slate-300">MintMe #{selectedMember.snapshot_block.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Proof Signature:</span>
                  <span className="text-slate-400">{selectedMember.proof_signature}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Challenge Nonce:</span>
                  <span className="text-slate-400">{selectedMember.nonce}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block">สิทธิ์โควตาแลก MCB ปัจจุบัน</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    {selectedMember.exchange_quota_mcb.toLocaleString()} MCB
                  </span>
                </div>
                <button
                  onClick={() => {
                    const addr = selectedMember.wallet_address;
                    setSelectedMember(null);
                    onSelectMemberForExchange(addr);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  เปิดแบบฟอร์มแลก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
