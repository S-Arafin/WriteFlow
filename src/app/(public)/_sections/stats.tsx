'use client';

import { Users, FileText, CheckCircle2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

function animateValue(
  start: number,
  end: number,
  duration: number,
  setValue: (val: number) => void
) {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    setValue(Math.floor(progress * (end - start) + start));
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };
  requestAnimationFrame(step);
}

export function StatsSection() {
  const [usersCount, setUsersCount] = useState(0);
  const [wordsCount, setWordsCount] = useState(0);
  const [accuracyRate, setAccuracyRate] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateValue(0, 10000, 1500, setUsersCount);
          animateValue(0, 500000, 1500, setWordsCount);
          animateValue(0, 99, 1500, setAccuracyRate);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="border-y border-neutral-900 bg-neutral-900/40 px-4 py-16"
    >
      <div className="container mx-auto grid max-w-5xl grid-cols-1 gap-8 text-center md:grid-cols-3">
        {/* Metric 1 */}
        <div className="flex flex-col items-center space-y-2 p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-4xl font-extrabold tracking-tight text-white">
            {usersCount.toLocaleString()}+
          </span>
          <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Active Writers & Teams
          </span>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col items-center space-y-2 p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-4xl font-extrabold tracking-tight text-white">
            {wordsCount.toLocaleString()}+
          </span>
          <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Words Drafted & Optimized
          </span>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col items-center space-y-2 p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="text-4xl font-extrabold tracking-tight text-white">
            {accuracyRate}%
          </span>
          <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Context Fidelity Rating
          </span>
        </div>
      </div>
    </section>
  );
}
