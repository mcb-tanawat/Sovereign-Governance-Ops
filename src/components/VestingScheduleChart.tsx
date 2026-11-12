import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { MCBExchangeRequest } from '../types/index.js';
import { Calendar, TrendingDown, Clock, ShieldCheck, Sparkles, Filter } from 'lucide-react';

interface VestingScheduleChartProps {
  exchangeRequests: MCBExchangeRequest[];
}

interface VestingDataPoint {
  day: number;
  date: Date;
  dateStr: string;
  remainingMcb: number;
  unlockedMcb: number;
  unlockPct: number;
}

export const VestingScheduleChart: React.FC<VestingScheduleChartProps> = ({
  exchangeRequests
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [selectedRequestId, setSelectedRequestId] = useState<string>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<VestingDataPoint | null>(null);

  // Filter pending allocations (status 'APPROVED' or 'VESTING', or progress < 100)
  const pendingRequests = useMemo(() => {
    return exchangeRequests.filter(
      (r) => r.exchange_status === 'VESTING' || r.exchange_status === 'APPROVED' || r.vesting_progress_pct < 100
    );
  }, [exchangeRequests]);

  // Compute total and selected allocation
  const activeRequests = useMemo(() => {
    if (selectedRequestId === 'ALL') {
      return pendingRequests.length > 0 ? pendingRequests : exchangeRequests;
    }
    return exchangeRequests.filter((r) => r.request_id === selectedRequestId);
  }, [selectedRequestId, pendingRequests, exchangeRequests]);

  const totalAllocatedMcb = useMemo(() => {
    return activeRequests.reduce((acc, r) => acc + r.mcb_quota_allocated, 0);
  }, [activeRequests]);

  const currentUnlockedMcb = useMemo(() => {
    return activeRequests.reduce((acc, r) => acc + (r.mcb_quota_allocated * (r.vesting_progress_pct / 100)), 0);
  }, [activeRequests]);

  const remainingMcbNow = Math.max(0, totalAllocatedMcb - currentUnlockedMcb);

  // Generate 31 data points representing the 30-day linear vesting trajectory
  const scheduleData: VestingDataPoint[] = useMemo(() => {
    const points: VestingDataPoint[] = [];
    const now = new Date();
    const daysTotal = 30;

    for (let day = 0; day <= daysTotal; day++) {
      const pointDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      
      // Calculate remaining MCB over the remaining 30 days linear schedule
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

  // D3 Rendering Hook
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || scheduleData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear prior render

    const containerWidth = containerRef.current.clientWidth || 700;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define Gradients
    const defs = svg.append('defs');

    // Area Gradient (Emerald / Cyan glow)
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'vesting-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.35);

    areaGradient
      .append('stop')
      .attr('offset', '70%')
      .attr('stop-color', '#06b6d4')
      .attr('stop-opacity', 0.1);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0f172a')
      .attr('stop-opacity', 0.0);

    // Line Gradient
    const lineGradient = defs
      .append('linearGradient')
      .attr('id', 'vesting-line-gradient')
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

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, 30])
      .range([0, width]);

    const yMax = d3.max(scheduleData, (d) => d.remainingMcb) || 1000;
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

    // Area Generator
    const areaGen = d3
      .area<VestingDataPoint>()
      .x((d) => xScale(d.day))
      .y0(innerHeight)
      .y1((d) => yScale(d.remainingMcb))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(scheduleData)
      .attr('fill', 'url(#vesting-area-gradient)')
      .attr('d', areaGen);

    // Line Generator
    const lineGen = d3
      .line<VestingDataPoint>()
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.remainingMcb))
      .curve(d3.curveMonotoneX);

    const path = g
      .append('path')
      .datum(scheduleData)
      .attr('fill', 'none')
      .attr('stroke', 'url(#vesting-line-gradient)')
      .attr('stroke-width', 2.5)
      .attr('d', lineGen);

    // Animated Path Transition
    const pathEl = path.node();
    if (pathEl) {
      const totalLength = pathEl.getTotalLength();
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(900)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Key Milestones Points: Day 0, Day 10, Day 20, Day 30
    const milestoneDays = [0, 10, 20, 30];
    const milestones = scheduleData.filter((d) => milestoneDays.includes(d.day));

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

    // Interactive Vertical Crosshair and Overlay
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

    // Bisector for hover tracking
    const bisect = d3.bisector<VestingDataPoint, number>((d) => d.day).center;

    // Overlay rect to capture all mouse events
    g.append('rect')
      .attr('width', width)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', (event: MouseEvent) => {
        const [xPos] = d3.pointer(event);
        const dayVal = xScale.invert(xPos);
        const idx = bisect(scheduleData, dayVal);
        const d = scheduleData[idx] || scheduleData[0];

        const cx = xScale(d.day);
        const cy = yScale(d.remainingMcb);

        focusLine.attr('x1', cx).attr('x2', cx).style('opacity', 1);
        focusCircle.attr('cx', cx).attr('cy', cy).style('opacity', 1);

        setHoveredPoint(d);
      })
      .on('mouseleave', () => {
        focusLine.style('opacity', 0);
        focusCircle.style('opacity', 0);
        setHoveredPoint(null);
      });
  }, [scheduleData]);

  const dailyUnlockRate = remainingMcbNow > 0 ? (remainingMcbNow / 30).toFixed(1) : '0';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              D3 Remaining Vesting Schedule (Pending MCB)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            กราฟจำลองการทยอยปลดล็อกเหรียญ MCB คงค้างตามรอบระยะเวลา 30 วัน (Linear Vesting Trajectory)
          </p>
        </div>

        {/* Filter by Request ID */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">
              รวมทุกคำขอที่รอปลดล็อก ({pendingRequests.length} รายการ)
            </option>
            {exchangeRequests.map((r) => (
              <option key={r.request_id} value={r.request_id}>
                {r.request_id} ({r.mcb_quota_allocated.toLocaleString()} MCB · {r.vesting_progress_pct}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-500 block font-sans text-[11px]">ยอดคงเหลือรอปลดล็อก</span>
          <span className="text-base font-bold text-emerald-400 mt-0.5 block">
            {remainingMcbNow.toLocaleString()} MCB
          </span>
          <span className="text-[10px] text-slate-500 font-sans">Locked in Vault</span>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-500 block font-sans text-[11px]">อัตราปลดล็อกรายวัน</span>
          <span className="text-base font-bold text-cyan-400 mt-0.5 block">
            ~{dailyUnlockRate} MCB/วัน
          </span>
          <span className="text-[10px] text-slate-500 font-sans">Linear Release</span>
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
            {scheduleData[30]?.dateStr || '+30 วัน'}
          </span>
          <span className="text-[10px] text-slate-500 font-sans">Final Settlement</span>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto overflow-visible" />

        {/* Floating Tooltip readout */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-slate-950/95 border border-cyan-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-none text-xs font-mono space-y-1">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white">Day +{hoveredPoint.day} ({hoveredPoint.dateStr})</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-400">
              <span>Remaining Locked:</span>
              <span className="font-bold text-emerald-400">{hoveredPoint.remainingMcb.toLocaleString()} MCB</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-400">
              <span>Cumulative Unlocked:</span>
              <span className="font-bold text-white">{hoveredPoint.unlockedMcb.toLocaleString()} MCB</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-400">
              <span>Vesting Progress:</span>
              <span className="font-bold text-cyan-400">{hoveredPoint.unlockPct}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 inline-block" />
            <span>เส้นทางปลดล็อกคงเหลือ (Remaining Curve)</span>
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
  );
};
