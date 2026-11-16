import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
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
  Award,
  TrendingDown,
  Filter,
  XCircle
} from 'lucide-react';
import { MeeChainMember, MCBExchangeRequest } from '../types/index.js';

interface ExchangeProgramProps {
  members: MeeChainMember[];
  exchangeRequests: MCBExchangeRequest[];
  initialWallet?: string;
  onRefreshData: () => void;
}

interface VestingDataPoint {
  day: number;
  date: Date;
  dateStr: string;
  remainingMcb: number;
  unlockedMcb: number;
  unlockPct: number;
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

  // D3 Chart States & Refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartSvgRef = useRef<SVGSVGElement>(null);
  const [selectedChartRequestId, setSelectedChartRequestId] = useState<string>('ALL');
  const [hoveredVestingPoint, setHoveredVestingPoint] = useState<VestingDataPoint | null>(null);

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

  // ================= PROGRAM SUMMARY METRICS (PENDING, COMPLETED, REJECTED) =================
  const programSummary = useMemo(() => {
    const pendingList = exchangeRequests.filter(
      (r) => (r.exchange_status === 'VESTING' || r.exchange_status === 'APPROVED' || r.exchange_status === 'QUEUED') && r.vesting_progress_pct < 100
    );
    const completedList = exchangeRequests.filter(
      (r) => r.exchange_status === 'DISTRIBUTED' || r.vesting_progress_pct >= 100
    );
    const rejectedList = exchangeRequests.filter(
      (r) => r.exchange_status === 'REJECTED'
    );

    const pendingMcb = pendingList.reduce((sum, r) => sum + r.mcb_quota_allocated, 0);
    const completedMcb = completedList.reduce((sum, r) => sum + r.mcb_quota_allocated, 0);
    const rejectedMcb = rejectedList.reduce((sum, r) => sum + r.mcb_quota_allocated, 0);
    const totalRequests = exchangeRequests.length;
    const totalVolumeMcb = pendingMcb + completedMcb + rejectedMcb;
    const completionRate = totalRequests > 0 ? Math.round((completedList.length / totalRequests) * 100) : 0;

    return {
      pendingCount: pendingList.length,
      pendingMcb,
      completedCount: completedList.length,
      completedMcb,
      rejectedCount: rejectedList.length,
      rejectedMcb,
      totalRequests,
      totalVolumeMcb,
      completionRate
    };
  }, [exchangeRequests]);

  // ================= D3 LINE CHART CALCULATIONS =================

  // 1. Filter pending allocations from exchangeRequests array
  const pendingRequests = useMemo(() => {
    return exchangeRequests.filter(
      (r) => r.exchange_status === 'VESTING' || r.exchange_status === 'APPROVED' || r.vesting_progress_pct < 100
    );
  }, [exchangeRequests]);

  const activeAllocations = useMemo(() => {
    if (selectedChartRequestId === 'ALL') {
      return pendingRequests.length > 0 ? pendingRequests : exchangeRequests;
    }
    return exchangeRequests.filter((r) => r.request_id === selectedChartRequestId);
  }, [selectedChartRequestId, pendingRequests, exchangeRequests]);

  // Aggregate numbers
  const totalAllocatedMcb = useMemo(() => {
    return activeAllocations.reduce((acc, r) => acc + r.mcb_quota_allocated, 0);
  }, [activeAllocations]);

  const currentUnlockedMcb = useMemo(() => {
    return activeAllocations.reduce((acc, r) => acc + (r.mcb_quota_allocated * (r.vesting_progress_pct / 100)), 0);
  }, [activeAllocations]);

  const remainingMcbNow = Math.max(0, totalAllocatedMcb - currentUnlockedMcb);

  // Generate 31 day trajectory data points for the 30-day linear vesting curve
  const vestingScheduleData: VestingDataPoint[] = useMemo(() => {
    const points: VestingDataPoint[] = [];
    const now = new Date();
    const daysTotal = 30;

    for (let day = 0; day <= daysTotal; day++) {
      const pointDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      const progressRatio = day / daysTotal;
      const remaining = Math.max(0, remainingMcbNow * (1 - progressRatio));
      const unlocked = totalAllocatedMcb - remaining;
      const unlockPct = totalAllocatedMcb > 0 ? (unlocked / totalAllocatedMcb) * 100 : 0;

      points.push({
        day,
        date: pointDate,
        dateStr: pointDate.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
        remainingMcb: Math.round(remaining),
        unlockedMcb: Math.round(unlocked),
        unlockPct: Math.round(unlockPct)
      });
    }

    return points;
  }, [remainingMcbNow, totalAllocatedMcb]);

  // 2. D3 Render Effect
  useEffect(() => {
    if (!chartSvgRef.current || !chartContainerRef.current || vestingScheduleData.length === 0) return;

    const svg = d3.select(chartSvgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const containerWidth = chartContainerRef.current.clientWidth || 700;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradients Definition
    const defs = svg.append('defs');

    // Area Gradient (Emerald-Cyan glow fading to dark slate)
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'mcb-vesting-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.38);

    areaGradient
      .append('stop')
      .attr('offset', '70%')
      .attr('stop-color', '#06b6d4')
      .attr('stop-opacity', 0.12);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0f172a')
      .attr('stop-opacity', 0.0);

    // Stroke Line Gradient
    const lineGradient = defs
      .append('linearGradient')
      .attr('id', 'mcb-vesting-line-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    lineGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981');

    lineGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#06b6d4');

    // D3 Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, 30])
      .range([0, width]);

    const yMax = d3.max(vestingScheduleData, (d) => d.remainingMcb) || 1000;
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.ceil(yMax * 1.15)])
      .range([innerHeight, 0])
      .nice();

    // Horizontal Grid Lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-opacity', 0.7);

    g.select('.grid .domain').remove();

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => `Day +${d}`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    g.selectAll('.tick line').attr('stroke', '#334155');
    g.select('.domain').attr('stroke', '#334155');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d3.format('~s')(d)}`);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    // Y Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('fill', '#64748b')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace')
      .text('Remaining Locked MCB');

    // D3 Area Generator
    const areaGen = d3
      .area<VestingDataPoint>()
      .x((d) => xScale(d.day))
      .y0(innerHeight)
      .y1((d) => yScale(d.remainingMcb))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(vestingScheduleData)
      .attr('fill', 'url(#mcb-vesting-area-gradient)')
      .attr('d', areaGen);

    // D3 Line Generator
    const lineGen = d3
      .line<VestingDataPoint>()
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.remainingMcb))
      .curve(d3.curveMonotoneX);

    const path = g
      .append('path')
      .datum(vestingScheduleData)
      .attr('fill', 'none')
      .attr('stroke', 'url(#mcb-vesting-line-gradient)')
      .attr('stroke-width', 2.5)
      .attr('d', lineGen);

    // Animated Path Drawing
    const pathEl = path.node();
    if (pathEl) {
      const totalLength = pathEl.getTotalLength();
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(850)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Milestone Dots (Day 0, Day 10, Day 20, Day 30)
    const milestoneDays = [0, 10, 20, 30];
    const milestones = vestingScheduleData.filter((d) => milestoneDays.includes(d.day));

    g.selectAll('.milestone-dot')
      .data(milestones)
      .enter()
      .append('circle')
      .attr('class', 'milestone-dot')
      .attr('cx', (d) => xScale(d.day))
      .attr('cy', (d) => yScale(d.remainingMcb))
      .attr('r', 4.5)
      .attr('fill', '#0f172a')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2);

    // Crosshair Line & Indicator Dot
    const focusLine = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#38bdf8')
      .attr('stroke-dasharray', '2,2')
      .attr('stroke-width', 1.5)
      .style('opacity', 0);

    const focusCircle = g
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#38bdf8')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    // Bisector for interactive mouse hover
    const bisect = d3.bisector<VestingDataPoint, number>((d) => d.day).center;

    // Interactive Overlay capturing pointer events
    g.append('rect')
      .attr('width', width)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', (event: MouseEvent) => {
        const [xPos] = d3.pointer(event);
        const dayVal = xScale.invert(xPos);
        const idx = bisect(vestingScheduleData, dayVal);
        const d = vestingScheduleData[idx] || vestingScheduleData[0];

        const cx = xScale(d.day);
        const cy = yScale(d.remainingMcb);

        focusLine.attr('x1', cx).attr('x2', cx).style('opacity', 1);
        focusCircle.attr('cx', cx).attr('cy', cy).style('opacity', 1);

        setHoveredVestingPoint(d);
      })
      .on('mouseleave', () => {
        focusLine.style('opacity', 0);
        focusCircle.style('opacity', 0);
        setHoveredVestingPoint(null);
      });
  }, [vestingScheduleData]);

  const dailyReleaseRate = remainingMcbNow > 0 ? (remainingMcbNow / 30).toFixed(1) : '0';

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

      {/* ================= SUMMARY CARDS: PENDING, COMPLETED, REJECTED ================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>ภาพรวมสถานะคำขอแลกเปลี่ยน (Exchange Program Overview)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              สรุปยอดคำขอที่กำลังรอรับสิทธิ์ (Pending), สำเร็จแล้ว (Completed), และถูกปฏิเสธ (Rejected)
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            รวมคำขอทั้งหมด: <strong className="text-white">{programSummary.totalRequests}</strong> รายการ · สำเร็จแล้ว {programSummary.completionRate}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Pending Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Pending Allocations</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                รอดำเนินการ
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {programSummary.pendingCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                คำขอ ({programSummary.totalRequests > 0 ? Math.round((programSummary.pendingCount / programSummary.totalRequests) * 100) : 0}%)
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">มูลค่าคงค้าง:</span>
              <span className="font-bold text-amber-400">{programSummary.pendingMcb.toLocaleString()} MCB</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">อยู่ในกระบวนการ Linear 30-Day Vesting</p>
          </div>

          {/* 2. Completed Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed Exchanges</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                สำเร็จ / จ่ายแล้ว
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {programSummary.completedCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                คำขอ ({programSummary.totalRequests > 0 ? Math.round((programSummary.completedCount / programSummary.totalRequests) * 100) : 0}%)
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">จ่ายเหรียญสำเร็จ:</span>
              <span className="font-bold text-emerald-400">{programSummary.completedMcb.toLocaleString()} MCB</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">ปลดล็อก 100% และโอนสิทธิ์เรียบร้อย</p>
          </div>

          {/* 3. Rejected Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-lg relative overflow-hidden group hover:border-rose-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>Rejected Requests</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                ปฏิเสธคำขอ
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {programSummary.rejectedCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                คำขอ ({programSummary.totalRequests > 0 ? Math.round((programSummary.rejectedCount / programSummary.totalRequests) * 100) : 0}%)
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">มูลค่าที่ปฏิเสธ:</span>
              <span className="font-bold text-rose-400">{programSummary.rejectedMcb.toLocaleString()} MCB</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">ไม่ผ่านเกณฑ์ Snapshot หรือ Sybil Guard</p>
          </div>
        </div>
      </div>

      {/* ================= D3 LINE CHART SECTION ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                D3 Remaining Vesting Schedule (Pending MCB Allocations)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              แผนภูมิเส้นแสดงภาพกำหนดการได้รับสิทธิ์คงค้างของเหรียญ MCB (Linear 30-Day Vesting Trajectory) โดยคำนวณจากอาร์เรย์คำขอแลกเปลี่ยน (exchangeRequests)
            </p>
          </div>

          {/* Filter Dropdown for Pending Allocations */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedChartRequestId}
              onChange={(e) => setSelectedChartRequestId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">
                รวมทุกคำขอที่รอปลดล็อก ({pendingRequests.length} รายการจากคำขอทั้งหมด)
              </option>
              {exchangeRequests.map((r) => (
                <option key={r.request_id} value={r.request_id}>
                  {r.request_id} ({r.mcb_quota_allocated.toLocaleString()} MCB · {r.vesting_progress_pct}% ปลดล็อกแล้ว)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vesting KPI Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block font-sans text-[11px]">ยอดคงเหลือรอปลดล็อก</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">
              {remainingMcbNow.toLocaleString()} MCB
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Remaining in Vault</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block font-sans text-[11px]">อัตราปลดล็อกเฉลี่ย</span>
            <span className="text-base font-bold text-cyan-400 mt-0.5 block">
              ~{dailyReleaseRate} MCB/วัน
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Linear Release Rate</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block font-sans text-[11px]">ปลดล็อกแล้วสะสม</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {Math.round(currentUnlockedMcb).toLocaleString()} MCB
            </span>
            <span className="text-[10px] text-emerald-400 font-sans">
              ({totalAllocatedMcb > 0 ? ((currentUnlockedMcb / totalAllocatedMcb) * 100).toFixed(1) : 0}%)
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block font-sans text-[11px]">วันสิ้นสุด Vesting</span>
            <span className="text-xs font-bold text-amber-400 mt-1 block font-mono">
              {vestingScheduleData[30]?.dateStr || '+30 วัน'}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Final Settlement</span>
          </div>
        </div>

        {/* D3 SVG Canvas & Tooltip */}
        <div ref={chartContainerRef} className="relative w-full overflow-hidden">
          <svg ref={chartSvgRef} className="w-full h-auto overflow-visible" />

          {/* Floating Tooltip */}
          {hoveredVestingPoint && (
            <div className="absolute top-2 right-4 bg-slate-950/95 border border-cyan-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-none text-xs font-mono space-y-1">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-white">
                  Day +{hoveredVestingPoint.day} ({hoveredVestingPoint.dateStr})
                </span>
              </div>
              <div className="flex justify-between gap-4 text-slate-400">
                <span>Remaining Locked:</span>
                <span className="font-bold text-emerald-400">
                  {hoveredVestingPoint.remainingMcb.toLocaleString()} MCB
                </span>
              </div>
              <div className="flex justify-between gap-4 text-slate-400">
                <span>Cumulative Unlocked:</span>
                <span className="font-bold text-white">
                  {hoveredVestingPoint.unlockedMcb.toLocaleString()} MCB
                </span>
              </div>
              <div className="flex justify-between gap-4 text-slate-400">
                <span>Vesting Progress:</span>
                <span className="font-bold text-cyan-400">
                  {hoveredVestingPoint.unlockPct}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 inline-block" />
              <span>เส้นทางปลดล็อกคงเหลือ (Remaining Vesting Trajectory)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border border-emerald-400 bg-slate-950 inline-block" />
              <span>หมุดระยะ 10 วัน (Milestones)</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>เลื่อนเมาส์บนกราฟเพื่อดูสถิติรายวัน</span>
          </div>
        </div>
      </div>

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
                        : req.exchange_status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300'
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
