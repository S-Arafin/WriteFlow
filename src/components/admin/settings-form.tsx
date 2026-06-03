'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ShieldAlert,
  Cpu,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { updateSiteSettings } from '@/actions/admin';

const settingsSchema = z.object({
  maintenanceMode: z.boolean(),
  aiEnabled: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialConfig: {
    maintenanceMode: boolean;
    aiEnabled: boolean;
  };
}

export function SettingsForm({ initialConfig }: SettingsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      maintenanceMode: initialConfig.maintenanceMode,
      aiEnabled: initialConfig.aiEnabled,
    },
  });

  async function onSubmit(data: SettingsFormValues) {
    setError(null);
    setSuccess(false);

    const res = await updateSiteSettings(data.maintenanceMode, data.aiEnabled);
    if (!res.success) {
      setError(res.error || 'Failed to update settings.');
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 font-sans">
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-50 p-4 text-xs font-semibold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50 p-4 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>
            Site settings successfully updated! Global routes modified.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Maintenance Switch */}
        <div className="dark:border-neutral-850 flex flex-col justify-between space-y-6 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-amber-600 uppercase dark:border-amber-900/30 dark:bg-amber-950/40 dark:text-amber-400">
                System Security
              </span>
              <div className="dark:text-amber-450 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-600">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-neutral-850 font-mono text-base font-bold uppercase dark:text-neutral-200">
                Global Maintenance Mode
              </h3>
              <p className="text-neutral-550 dark:text-neutral-450 mt-1 text-xs leading-normal font-medium">
                If active, all non-administrator users will be immediately
                logged out or redirected to `/maintenance` landing page. Useful
                for upgrades.
              </p>
            </div>
          </div>

          <div className="dark:border-neutral-850 flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="dark:text-neutral-450 font-mono text-xs font-bold text-neutral-500 uppercase">
              Status
            </span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                {...register('maintenanceMode')}
                disabled={isSubmitting}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-neutral-200 peer-checked:bg-amber-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-checked:after:bg-white dark:bg-neutral-800 dark:after:border-neutral-700 dark:after:bg-neutral-400"></div>
            </label>
          </div>
        </div>

        {/* AI Switch */}
        <div className="dark:border-neutral-850 flex flex-col justify-between space-y-6 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="border-indigo-150 text-indigo-650 inline-flex rounded-xl border bg-indigo-50 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider uppercase dark:border-indigo-900/30 dark:bg-indigo-950/40 dark:text-indigo-400">
                AI Infrastructure
              </span>
              <div className="dark:text-indigo-455 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-600">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-neutral-850 font-mono text-base font-bold uppercase dark:text-neutral-200">
                AI Capabilities Global Gate
              </h3>
              <p className="text-neutral-555 dark:text-neutral-450 mt-1 text-xs leading-normal font-medium">
                If disabled, all streaming and non-streaming Edge API routes for
                AI Agent completions (Draft, Rewrite, Chat) will block requests,
                returning `503 Service Unavailable`.
              </p>
            </div>
          </div>

          <div className="dark:border-neutral-850 flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="dark:text-neutral-455 font-mono text-xs font-bold text-neutral-500 uppercase">
              Status
            </span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                {...register('aiEnabled')}
                disabled={isSubmitting}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-neutral-200 peer-checked:bg-indigo-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-checked:after:bg-white dark:bg-neutral-800 dark:after:border-neutral-700 dark:after:bg-neutral-400"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Help Banner */}
      <div className="dark:border-neutral-850 flex items-start gap-4 rounded-[2rem] border border-neutral-200 bg-neutral-50/50 p-6 shadow-sm dark:bg-neutral-950/30">
        <HelpCircle className="text-neutral-450 dark:text-neutral-550 mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <h4 className="font-mono text-xs font-bold text-neutral-800 uppercase dark:text-neutral-300">
            Important Middleware Caching Notice
          </h4>
          <p className="text-neutral-550 dark:text-neutral-450 text-[11px] leading-relaxed font-semibold">
            WriteFlow&apos;s global middleware employs a custom 10-second
            time-based memory cache on the Edge to prevent database query
            amplification. Toggling these parameters will propagate across the
            routing networks globally within 10 seconds of clicking the update
            trigger.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/10 transition-all duration-200 hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Configurations...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Update Global Configs</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
