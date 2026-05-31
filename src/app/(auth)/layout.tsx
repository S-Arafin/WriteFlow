import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 font-sans antialiased">
      {/* Dynamic Glowing Mesh Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[80%] animate-pulse rounded-full bg-indigo-500/10 blur-[120px] duration-[8000ms]" />
        <div className="absolute -right-[20%] -bottom-[40%] h-[80%] w-[80%] animate-pulse rounded-full bg-violet-600/10 blur-[120px] duration-[6000ms]" />
      </div>

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-2xl shadow-neutral-950/50 backdrop-blur-xl md:p-10">
        <div className="mb-8 flex flex-col space-y-2 text-center">
          <h1 className="bg-gradient-to-r from-indigo-200 via-white to-violet-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent text-white">
            WriteFlow AI
          </h1>
          <p className="text-sm text-neutral-400">
            Enterprise SaaS Content Workspace
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
