import { Hammer, RefreshCw } from 'lucide-react';
import React from 'react';

export const metadata = {
  title: 'Under Maintenance - WriteFlow AI',
  description:
    'WriteFlow AI is currently undergoing scheduled upgrades. We will be back online shortly.',
};

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-teal-500/30">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] animate-pulse rounded-full bg-teal-500/10 blur-[120px] duration-[6000ms]" />
        <div className="absolute -right-[10%] -bottom-[20%] h-[50%] w-[50%] animate-pulse rounded-full bg-violet-600/10 blur-[120px] duration-[8000ms]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:4rem_4rem] opacity-30" />
      </div>

      {/* Main Glassmorphic Panel */}
      <div className="relative z-10 mx-4 w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
        <div className="mb-8 inline-flex animate-bounce items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 p-4 text-teal-400 duration-[3000ms]">
          <Hammer className="h-10 w-10" />
        </div>

        <h1 className="mb-4 bg-gradient-to-r from-teal-400 via-emerald-300 to-violet-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Upgrading WriteFlow
        </h1>

        <p className="mb-8 text-lg leading-relaxed font-medium text-slate-400">
          We are currently performing essential system updates to enhance your
          experience. WriteFlow AI will be back online shortly. Thank you for
          your patience!
        </p>

        <div className="flex flex-col items-center justify-center gap-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-teal-500" />
            <span>Updates in progress</span>
          </div>
          <span className="rounded-full border border-slate-700/50 bg-slate-800/60 px-3 py-1 text-[10px] text-slate-400">
            Phase 6 Production Upgrade
          </span>
        </div>
      </div>
    </div>
  );
}
