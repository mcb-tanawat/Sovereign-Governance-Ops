import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MeeChain ErrorBoundary] Caught component error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unexpected application error';

      return (
        <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 bg-slate-900/95 border border-rose-800/60 rounded-3xl shadow-2xl text-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-semibold text-rose-400 mb-1.5 font-mono">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  ERROR_BOUNDARY_CATCH
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {this.props.fallbackTitle || 'เกิดข้อผิดพลาดในการโหลดส่วนแสดงผล'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  ระบบ MeeChain Safeguard ป้องกันไม่ให้ข้อผิดพลาดส่งผลกระทบต่อส่วนอื่นๆ ของแดชบอร์ด
                </p>
              </div>

              {/* Error Detail Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto">
                <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold mb-1">
                  Exception Details:
                </span>
                <code>{errorMessage}</code>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>ลองโหลดใหม่อีกครั้ง (Retry)</span>
                </button>

                <button
                  onClick={() => {
                    this.handleReset();
                    window.location.hash = '';
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4 text-slate-400" />
                  <span>รีเซ็ตสถานะหน้าจอ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
