'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

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
    <section className="relative min-h-[85vh] bg-background px-4 pt-12 pb-20 transition-colors duration-300 flex items-center">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-background to-background dark:from-indigo-900/15 dark:via-neutral-950 dark:to-neutral-950 transition-colors duration-300" />

      {/* Cyber Digital Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,rgba(99,102,241,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.012)_1px,transparent_1px)]" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Main Bento Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT BENTO BLOCK: Core Pitch Panel (Takes 7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex flex-col justify-between p-8 sm:p-12 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-850 bg-neutral-50/60 dark:bg-neutral-900/30 backdrop-blur-md shadow-sm"
          >
            <div className="space-y-6">
              {/* Banner Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-widest text-indigo-600 dark:text-indigo-300 uppercase shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Momentum Fuels Progress</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
                Scale Your Copy Drafting with{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 dark:from-indigo-400 dark:via-violet-200 dark:to-indigo-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-pulse">
                  Disciplined AI
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-xl">
                We do not rely on passing motivation. We rely on strict drafting discipline. WriteFlow AI combines production-grade pipelines with advanced LLMs to fuel your team&apos;s content momentum.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/register"
                className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-lime-400 hover:bg-lime-300 dark:bg-lime-300 dark:hover:bg-lime-200 text-neutral-950 px-8 text-sm font-bold shadow-md shadow-lime-400/15 hover:scale-105 active:scale-95 transition-all duration-200 sm:w-auto"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explore"
                className="flex h-13 w-full cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white/80 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/80 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 px-8 text-sm font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 sm:w-auto"
              >
                Explore Templates
              </Link>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Asymmetric Dashboard Widgets (Takes 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Top row with two small bento blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Widget A: Rating box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-850 bg-indigo-500/5 dark:bg-indigo-500/10 backdrop-blur-md shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                    [ Rating ]
                  </span>
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-4xl font-extrabold text-neutral-900 dark:text-white flex items-baseline">
                    4.9<span className="text-indigo-600 dark:text-indigo-400 text-lg">*</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                    The perfect visual organizer and team editor builder.
                  </p>
                </div>
              </motion.div>

              {/* Widget B: Dynamic growth chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-850 bg-neutral-50/60 dark:bg-neutral-900/30 backdrop-blur-md shadow-sm flex flex-col justify-between overflow-hidden relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                    [ Velocity ]
                  </span>
                  <div className="flex items-center gap-1 text-lime-600 dark:text-lime-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-bold">+22%</span>
                  </div>
                </div>
                
                {/* SVG Animated Chart Background */}
                <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-80">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
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
                      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#84cc16" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#84cc16" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="mt-4 relative z-10">
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
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex-1 flex flex-col justify-between p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-850 bg-neutral-950 text-neutral-300 shadow-xl backdrop-blur-xl relative overflow-hidden"
            >
              {/* Dot Matrix grid inside black block */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

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
                <div className="space-y-2 py-1 min-h-[108px] flex flex-col justify-between">
                  <div>
                    <p className="font-sans text-xs font-semibold text-indigo-400">
                      {'// System instructions loaded ...'}
                    </p>
                    <p
                      ref={textRef}
                      className="font-sans text-[13px] leading-relaxed text-neutral-300 mt-2 font-medium"
                    >
                      &quot;&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-900">
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
