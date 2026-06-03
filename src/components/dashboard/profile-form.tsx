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
import Image from 'next/image';
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

  // ─── Direct Imgbb Avatar Upload Flow ────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setIsUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadRes = await fetch('/api/avatar/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        const errData = (await uploadRes.json()) as { error?: string };
        throw new Error(errData.error || 'Failed to upload avatar image.');
      }

      const { url } = (await uploadRes.json()) as { url: string };

      // Update form fields and visual previews
      setValue('avatarUrl', url);
      setAvatarPreview(url);
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
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Header & Avatar Selector */}
      <div className="flex flex-col items-center gap-6 border-b border-neutral-200 pb-6 sm:flex-row dark:border-neutral-900">
        <div className="group relative shrink-0">
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100/50 dark:border-neutral-800 dark:bg-neutral-900/50">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar"
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <User className="text-neutral-450 h-10 w-10 dark:text-neutral-500" />
            )}

            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
          </div>

          <label className="absolute -right-1 -bottom-1 cursor-pointer rounded-full bg-indigo-600 p-2 text-white shadow-lg transition-all group-hover:scale-105 hover:bg-indigo-500 active:scale-95">
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
          <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-neutral-900 sm:justify-start dark:text-white">
            <span>{initialUser.name || 'Writer'}</span>
            <span className="inline-flex rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              {initialUser.plan} Tier
            </span>
          </h2>
          <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
            {initialUser.email}
          </p>
          <p className="text-neutral-550 dark:text-neutral-450 mt-1 max-w-sm text-xs">
            Click the camera icon to upload a custom avatar directly to the
            WriteFlow CDN network.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-mono text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            Display Name
          </label>
          <input
            type="text"
            {...register('name')}
            disabled={isSubmitting}
            placeholder="Your full name"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-200 dark:placeholder:text-neutral-600 dark:focus:border-indigo-400"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            Short Bio
          </label>
          <textarea
            {...register('bio')}
            disabled={isSubmitting}
            rows={4}
            placeholder="Tell us about yourself or your writing workflow..."
            className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-200 dark:placeholder:text-neutral-600 dark:focus:border-indigo-400"
          />
          {errors.bio && (
            <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-2.5 text-sm font-bold text-neutral-950 shadow-md shadow-lime-400/10 transition-all hover:scale-105 hover:bg-lime-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-lime-300 dark:hover:bg-lime-200"
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
