'use client';

import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Sparkles, ArrowRight, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

export function HeroSection() {
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const fullText =
      'Discipline creates momentum. Our high-velocity copywriting tools are engineered to bypass standard creative blocks, allowing you to instantly generate drafts, optimize tone mappings, and sync publication cycles across serverless database nodes.';

    const obj = { charIndex: 0 };

    // Typewriter effect using GSAP
    const typingTween = gsap.to(obj, {
      charIndex: fullText.length,
      duration: 5,
      ease: 'none',
      onUpdate: () => {
        if (textRef.current) {
          textRef.current.innerHTML = `"${fullText.slice(0, Math.floor(obj.charIndex))}"`;
        }
      },
      repeat: -1,
      repeatDelay: 3,
      yoyo: true,
    });

    return () => {
      typingTween.kill();
    };
  }, []);

  return (
    <section className="bg-background relative flex min-h-[85vh] items-center px-4 pt-12 pb-20 transition-colors duration-300">
      {/* Background radial glow */}
      <div className="via-background to-background pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 transition-colors duration-300 dark:from-indigo-900/15 dark:via-neutral-950 dark:to-neutral-950" />

      {/* Cyber Digital Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,rgba(99,102,241,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.012)_1px,transparent_1px)]" />

      <div className="relative z-10 container mx-auto max-w-6xl">
        {/* Main Bento Layout Grid */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* LEFT BENTO BLOCK: Core Pitch Panel (Takes 7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.008, y: -2 }}
            transition={{ duration: 0.3 }}
            className="dark:border-neutral-850 flex flex-col justify-between rounded-[2.5rem] border border-neutral-200 bg-neutral-50/60 p-8 shadow-sm backdrop-blur-md transition-all sm:p-12 lg:col-span-7 dark:bg-neutral-900/30"
          >
            <div className="space-y-6">
              {/* Banner Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-widest text-indigo-600 uppercase shadow-sm dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Momentum Fuels Progress</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight text-neutral-900 sm:text-6xl dark:text-white">
                Scale Your Copy Drafting with{' '}
                <span className="animate-pulse bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 bg-[length:200%_auto] bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-200 dark:to-indigo-400">
                  Disciplined AI
                </span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400">
                We do not rely on passing motivation. We rely on strict drafting
                discipline. WriteFlow AI combines production-grade pipelines
                with advanced LLMs to fuel your team&apos;s content momentum.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-lime-400 px-8 text-sm font-bold text-neutral-950 shadow-md shadow-lime-400/15 transition-all duration-200 hover:scale-105 hover:bg-lime-300 active:scale-95 sm:w-auto dark:bg-lime-300 dark:hover:bg-lime-200"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explore"
                className="flex h-13 w-full cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white/80 px-8 text-sm font-semibold text-neutral-700 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-neutral-50 active:scale-95 sm:w-auto dark:border-neutral-800 dark:bg-neutral-950/80 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                Explore Templates
              </Link>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Asymmetric Dashboard Widgets (Takes 5 cols) */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* Top row with two small bento blocks */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Widget A: Rating box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ duration: 0.3 }}
                className="dark:border-neutral-850 flex flex-col justify-between rounded-[2rem] border border-neutral-200 bg-indigo-500/5 p-6 shadow-sm backdrop-blur-md transition-all dark:bg-indigo-500/10"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                    [ Rating ]
                  </span>
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <div className="mt-4 space-y-1">
                  <div className="flex items-baseline text-4xl font-extrabold text-neutral-900 dark:text-white">
                    4.9
                    <span className="text-lg text-indigo-600 dark:text-indigo-400">
                      *
                    </span>
                  </div>
                  <p className="text-[11px] leading-tight text-neutral-500 dark:text-neutral-400">
                    The perfect visual organizer and team editor builder.
                  </p>
                </div>
              </motion.div>

              {/* Widget B: Dynamic growth chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ duration: 0.3 }}
                className="dark:border-neutral-850 relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-50/60 p-6 shadow-sm backdrop-blur-md transition-all dark:bg-neutral-900/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                    [ Velocity ]
                  </span>
                  <div className="flex items-center gap-1 text-lime-600 dark:text-lime-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-bold">+22%</span>
                  </div>
                </div>

                {/* SVG Animated Chart Background */}
                <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 opacity-80">
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,80 Q20,30 40,70 T80,10 T100,40 L100,100 L0,100 Z"
                      fill="url(#grad)"
                      className="transition-all duration-1000"
                    />
                    <path
                      d="M0,80 Q20,30 40,70 T80,10 T100,40"
                      fill="none"
                      stroke="#84cc16"
                      strokeWidth="2.5"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient
                        id="grad"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#84cc16"
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor="#84cc16"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="relative z-10 mt-4">
                  <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                    Words Gen
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Velocity metrics scale up.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Widget C: Typwriter Terminal Visual Element */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.015, y: -2 }}
              transition={{ duration: 0.3 }}
              className="dark:border-neutral-850 relative flex flex-1 flex-col justify-between overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-950 p-6 text-neutral-300 shadow-xl backdrop-blur-xl transition-all"
            >
              {/* Dot Matrix grid inside black block */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />

              <div className="relative z-10 flex flex-col space-y-3 font-mono text-xs">
                {/* Mock Editor Toolbar */}
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
                  </div>
                  <span className="font-sans text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
                    WriteFlow AI Engine v1.0.0
                  </span>
                </div>
                {/* Mock Text Generation Canvas */}
                <div className="flex min-h-[108px] flex-col justify-between space-y-2 py-1">
                  <div>
                    <p className="font-sans text-xs font-semibold text-indigo-400">
                      {'// System instructions loaded ...'}
                    </p>
                    <p
                      ref={textRef}
                      className="mt-2 font-sans text-[13px] leading-relaxed font-medium text-neutral-300"
                    >
                      &quot;&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 border-t border-neutral-900 pt-2">
                    <span className="h-4 w-1.5 animate-pulse bg-indigo-500" />
                    <span className="font-sans text-[10px] text-neutral-600 italic">
                      Press Ctrl + Space to trigger AI rewrite assistant ...
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
