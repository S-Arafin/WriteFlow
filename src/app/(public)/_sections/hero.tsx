'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function HeroSection() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 pt-24 pb-12">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950" />

      {/* Content wrapper */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center space-y-6 text-center md:space-y-8">
        {/* Banner badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-widest text-indigo-300 uppercase"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Momentum Fuels Progress</span>
        </motion.div>

        {/* Animated Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-3xl text-4xl leading-tight font-bold tracking-tight text-white sm:text-6xl"
        >
          Scale Your Copy Drafting with{' '}
          <span className="animate-pulse bg-gradient-to-r from-indigo-400 via-violet-200 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-transparent">
            Disciplined AI
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-lg"
        >
          We do not rely on passing motivation. We rely on strict drafting
          discipline. WriteFlow AI combines production-grade pipelines with
          advanced LLMs to fuel your team&apos;s content momentum.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/register"
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 sm:w-auto"
          >
            <span>Start Writing Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/80 px-6 text-sm font-semibold text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white sm:w-auto"
          >
            Explore Templates
          </Link>
        </motion.div>

        {/* Floating Card Visual Element */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.0,
            delay: 0.5,
            type: 'spring',
            stiffness: 50,
          }}
          className="mt-12 w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-900/40 p-1.5 shadow-2xl shadow-neutral-950/80 backdrop-blur-xl"
        >
          <div className="flex flex-col space-y-3 rounded-lg border border-neutral-800/80 bg-neutral-950 p-4 text-left font-mono text-xs text-neutral-400">
            {/* Mock Editor Toolbar */}
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/30" />
              </div>
              <span className="font-sans text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
                WriteFlow AI Engine v1.0.0
              </span>
            </div>
            {/* Mock Text Generation Canvas */}
            <div className="space-y-2 py-2">
              <p className="font-sans text-sm font-semibold text-indigo-400">
                {'// System instructions loaded ...'}
              </p>
              <p className="font-sans leading-relaxed text-neutral-300">
                &quot;Discipline creates momentum. Our high-velocity copywriting
                tools are engineered to bypass standard creative blocks,
                allowing you to instantly generate drafts, optimize tone
                mappings, and sync publication cycles across serverless database
                nodes.&quot;
              </p>
              <div className="flex items-center gap-1.5 pt-2">
                <span className="h-4 w-1.5 animate-pulse bg-indigo-500" />
                <span className="font-sans text-[10px] text-neutral-600 italic">
                  Press Ctrl + Space to trigger AI rewrite assistant ...
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
