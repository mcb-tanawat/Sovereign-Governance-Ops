/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { DashboardOverview } from './views/DashboardOverview.js';
import { MembershipRegistration } from './views/MembershipRegistration.js';
import { MembersList } from './views/MembersList.js';
import { ExchangeProgram } from './views/ExchangeProgram.js';
import { TreasuryVault } from './views/TreasuryVault.js';
import { GovernanceViewer } from './views/GovernanceViewer.js';
import { AlertCircle, RefreshCw, X, WifiOff } from 'lucide-react';
import { 
  MeeChainMember, 
  ExternalAssetSnapshot, 
  MCBExchangeRequest, 
  TreasuryStats, 
  InboundGatewayStatus 
} from './types/index.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [exchangeInitialWallet, setExchangeInitialWallet] = useState<string>('');
  
  const [gatewayStatus, setGatewayStatus] = useState<InboundGatewayStatus | null>(null);
  const [members, setMembers] = useState<MeeChainMember[]>([]);
  const [snapshots, setSnapshots] = useState<ExternalAssetSnapshot[]>([]);
  const [exchangeRequests, setExchangeRequests] = useState<MCBExchangeRequest[]>([]);
  const [treasury, setTreasury] = useState<TreasuryStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch all live data from backend API with graceful error handling
  const fetchAllData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [gwRes, memRes, snapRes, exRes, trRes] = await Promise.all([
        fetch('/api/v1/gateway/status').then(r => r.json()).catch(err => ({ success: false, error: err.message })),
        fetch('/api/v1/membership/list').then(r => r.json()).catch(err => ({ success: false, error: err.message })),
        fetch('/api/v1/snapshots').then(r => r.json()).catch(err => ({ success: false, error: err.message })),
        fetch('/api/v1/exchange/requests').then(r => r.json()).catch(err => ({ success: false, error: err.message })),
        fetch('/api/v1/treasury').then(r => r.json()).catch(err => ({ success: false, error: err.message }))
      ]);

      let hasFetchError = false;
      const errorSources: string[] = [];

      if (gwRes?.success) {
        setGatewayStatus(gwRes.data);
      } else {
        hasFetchError = true;
        errorSources.push('Gateway Status');
      }

      if (memRes?.success) {
        setMembers(memRes.data.members);
      } else {
        hasFetchError = true;
        errorSources.push('Membership List');
      }

      if (snapRes?.success) {
        setSnapshots(snapRes.data);
      } else {
        hasFetchError = true;
        errorSources.push('Snapshots');
      }

      if (exRes?.success) {
        setExchangeRequests(exRes.data);
      } else {
        hasFetchError = true;
        errorSources.push('Exchange Requests');
      }

      if (trRes?.success) {
        setTreasury(trRes.data);
      } else {
        hasFetchError = true;
        errorSources.push('Treasury');
      }

      if (hasFetchError && errorSources.length > 0) {
        setApiError(`ไม่สามารถดึงข้อมูลบางส่วน (${errorSources.join(', ')}) ระบบกำลังใช้ข้อมูลสำรองในเครื่อง`);
      } else {
        setApiError(null);
      }
    } catch (e: any) {
      console.warn('API sync exception:', e);
      setApiError(`การเชื่อมต่อข้อมูลขัดข้อง: ${e?.message || 'Network unreachable'}`);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    // Periodic poll every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleGoToExchange = (walletAddress: string) => {
    setExchangeInitialWallet(walletAddress);
    setCurrentTab('exchange');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        gatewayStatus={gatewayStatus}
        onRefreshGateway={fetchAllData}
        isRefreshing={isRefreshing}
      />

      {/* Global API Data Fetch Alert Banner */}
      {apiError && (
        <div className="bg-amber-950/60 border-b border-amber-600/40 text-amber-200 text-xs px-4 py-2.5 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{apiError}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllData}
                disabled={isRefreshing}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>โหลดใหม่</span>
              </button>
              <button
                onClick={() => setApiError(null)}
                className="p-1 text-amber-400 hover:text-white rounded hover:bg-amber-900/50 cursor-pointer"
                title="ปิดการแจ้งเตือน"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View Router wrapped with ErrorBoundary */}
      <main className="flex-1 pb-16">
        <ErrorBoundary
          fallbackTitle={`เกิดข้อผิดพลาดในการโหลดหน้า ${currentTab.toUpperCase()}`}
          onReset={fetchAllData}
        >
          {currentTab === 'overview' && (
            <DashboardOverview
              treasury={treasury}
              gatewayStatus={gatewayStatus}
              members={members}
              snapshots={snapshots}
              onNavigate={setCurrentTab}
              onRefreshAll={fetchAllData}
            />
          )}

          {currentTab === 'registration' && (
            <MembershipRegistration
              onGoToExchange={handleGoToExchange}
              onRefreshData={fetchAllData}
            />
          )}

          {currentTab === 'members' && (
            <MembersList
              members={members}
              onSelectMemberForExchange={handleGoToExchange}
              onNavigateToRegister={() => setCurrentTab('registration')}
            />
          )}

          {currentTab === 'exchange' && (
            <ExchangeProgram
              members={members}
              exchangeRequests={exchangeRequests}
              initialWallet={exchangeInitialWallet}
              onRefreshData={fetchAllData}
            />
          )}

          {currentTab === 'treasury' && (
            <TreasuryVault
              treasury={treasury}
              onRefreshData={fetchAllData}
            />
          )}

          {currentTab === 'governance' && (
            <GovernanceViewer />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-400">MeeChain Sovereign Protocol</span> · Governance v1.0 Active
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            Inbound Source: MintMe DEX (Chain ID: 24734) · Read-Only Gateway
          </div>
        </div>
      </footer>
    </div>
  );
}
