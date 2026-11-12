import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Layers, 
  Users, 
  Repeat, 
  Vault, 
  FileText, 
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';
import { InboundGatewayStatus } from '../types/index.js';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  gatewayStatus: InboundGatewayStatus | null;
  onRefreshGateway: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  gatewayStatus,
  onRefreshGateway,
  isRefreshing
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'registration', label: 'T2P → Member Registration', icon: ShieldCheck, badge: 'Key Form' },
    { id: 'members', label: 'Members & Tiers', icon: Users },
    { id: 'exchange', label: 'MCB Exchange', icon: Repeat },
    { id: 'treasury', label: 'Treasury & Stock', icon: Vault },
    { id: 'governance', label: 'Governance v1.0', icon: FileText }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Sovereign Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <span className="font-extrabold text-white text-lg tracking-wider">MCB</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">MeeChain</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Ops Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Sovereign Governance &amp; MintMe Gateway</p>
            </div>
          </div>

          {/* MintMe RPC Live Status Pill */}
          <div className="hidden md:flex items-center space-x-3 bg-slate-900/90 border border-slate-800 rounded-full px-3.5 py-1.5 text-xs">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  gatewayStatus?.is_connected ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  gatewayStatus?.is_connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </span>
              <span className="text-slate-300 font-medium flex items-center gap-1">
                {gatewayStatus?.is_connected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
                MintMe Inbound:
              </span>
            </div>

            <span className="text-slate-400 font-mono">
              #{gatewayStatus?.current_block?.toLocaleString() || '24,891,240'}
            </span>

            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono">
              {gatewayStatus?.latency_ms || 110}ms
            </span>

            <button
              onClick={onRefreshGateway}
              disabled={isRefreshing}
              title="Ping MintMe Gateway"
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Activity className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          {/* External MintMe Badge */}
          <div className="flex items-center space-x-2">
            <a
              href="https://www.mintme.com"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1 rounded-md border border-slate-800 hover:border-slate-700 bg-slate-900/60"
            >
              <span>MintMe Chain (ID: 24734)</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => onTabChange('registration')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/25 flex items-center space-x-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify &amp; Register</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-900">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-emerald-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
