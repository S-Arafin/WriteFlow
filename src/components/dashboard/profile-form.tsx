'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Camera,
  Loader2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { updateUserProfile } from '@/actions/users';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z
    .string()
    .max(500, 'Bio must be under 500 characters')
    .optional()
    .or(z.literal('')),
  avatarUrl: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialUser: {
    name: string | null;
    email: string;
    bio: string | null;
    avatarUrl: string | null;
    plan: string;
  };
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialUser.avatarUrl
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialUser.name || '',
      bio: initialUser.bio || '',
      avatarUrl: initialUser.avatarUrl,
    },
  });

  // ─── Direct-to-CDN Avatar Upload Flow ───────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setIsUploading(true);

    try {
      // 1. Fetch Presigned URL details from our Edge gateway
      const presignRes = await fetch('/api/avatar/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!presignRes.ok) {
        throw new Error('Failed to obtain presigned upload URL.');
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      // 2. Perform direct upload to CDN/Storage Endpoint
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error('CDN Upload rejected your request.');
      }

      // 3. Update form fields and visual previews
      setValue('avatarUrl', publicUrl);
      setAvatarPreview(publicUrl);
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to upload avatar image.';
      setError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(data: ProfileFormValues) {
    setError(null);
    setSuccess(false);

    const res = await updateUserProfile(data);
    if (!res.success) {
      setError(res.error || 'Failed to update profile.');
    } else {
      setSuccess(true);
      // Fade success message out after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-900/30 bg-emerald-950/20 p-4 text-sm text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Header & Avatar Selector */}
      <div className="flex flex-col items-center gap-6 border-b border-slate-900 pb-6 sm:flex-row">
        <div className="group relative shrink-0">
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-800 bg-slate-900/50">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-slate-600" />
            )}

            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
              </div>
            )}
          </div>

          <label className="absolute -right-1 -bottom-1 cursor-pointer rounded-full bg-teal-500 p-2 text-slate-950 shadow-lg transition-all group-hover:scale-105 hover:bg-teal-400 active:scale-95">
            <Camera className="h-3.5 w-3.5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isUploading || isSubmitting}
            />
          </label>
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-white sm:justify-start">
            <span>{initialUser.name || 'Writer'}</span>
            <span className="inline-flex rounded border border-teal-900 bg-teal-950 px-2 py-0.5 text-[10px] font-bold tracking-wider text-teal-400 uppercase">
              {initialUser.plan} Tier
            </span>
          </h2>
          <p className="font-mono text-xs text-slate-500">
            {initialUser.email}
          </p>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            Click the camera icon to upload a custom avatar directly to the
            WriteFlow CDN network.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">
            Display Name
          </label>
          <input
            type="text"
            {...register('name')}
            disabled={isSubmitting}
            placeholder="Your full name"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 focus:outline-none"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">
            Short Bio
          </label>
          <textarea
            {...register('bio')}
            disabled={isSubmitting}
            rows={4}
            placeholder="Tell us about yourself or your writing workflow..."
            className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 focus:outline-none"
          />
          {errors.bio && (
            <p className="mt-1 text-xs text-red-400">{errors.bio.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/10 transition-all hover:from-teal-400 hover:to-emerald-400 hover:shadow-teal-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
