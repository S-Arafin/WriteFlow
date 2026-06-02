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
        <div className="flex items-center gap-3 rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-900/30 bg-emerald-950/20 p-4 text-sm text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>
            Site settings successfully updated! Global routes modified.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Maintenance Switch */}
        <div className="flex flex-col justify-between space-y-6 rounded-3xl border border-slate-900 bg-slate-900/10 p-6 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex rounded-xl border border-amber-900/30 bg-amber-950/40 px-2.5 py-1 text-xs font-bold tracking-wider text-amber-400 uppercase">
                System Security
              </span>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-400">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">
                Global Maintenance Mode
              </h3>
              <p className="mt-1 text-xs leading-normal text-slate-500">
                If active, all non-administrator users will be immediately
                logged out or redirected to `/maintenance` landing page. Useful
                for upgrades.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-900/60 pt-4">
            <span className="text-xs font-bold text-slate-400">Status</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                {...register('maintenanceMode')}
                disabled={isSubmitting}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-900 peer-checked:bg-amber-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-slate-400 after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-checked:after:border-white peer-checked:after:bg-slate-950"></div>
            </label>
          </div>
        </div>

        {/* AI Switch */}
        <div className="flex flex-col justify-between space-y-6 rounded-3xl border border-slate-900 bg-slate-900/10 p-6 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex rounded-xl border border-violet-900/30 bg-violet-950/40 px-2.5 py-1 text-xs font-bold tracking-wider text-violet-400 uppercase">
                AI Infrastructure
              </span>
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2 text-violet-400">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">
                AI Capabilites Global Gate
              </h3>
              <p className="mt-1 text-xs leading-normal text-slate-500">
                If disabled, all streaming and non-streaming Edge API routes for
                AI Agent completions (Draft, Rewrite, Chat) will block requests,
                returning `503 Service Unavailable`.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-900/60 pt-4">
            <span className="text-xs font-bold text-slate-400">Status</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                {...register('aiEnabled')}
                disabled={isSubmitting}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-900 peer-checked:bg-violet-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-slate-400 after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-checked:after:border-white peer-checked:after:bg-slate-950"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Help Banner */}
      <div className="flex items-start gap-4 rounded-3xl border border-slate-900 bg-slate-950/30 p-6">
        <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-300">
            Important Middleware Caching Notice
          </h4>
          <p className="text-slate-555 text-[11px] leading-relaxed">
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
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/10 transition-all hover:from-violet-400 hover:to-indigo-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
