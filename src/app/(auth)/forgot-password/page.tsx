'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (_data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    // Simulate API call for password reset link dispatch
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="animate-fade-in flex flex-col space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">
            Reset Link Dispatched
          </h2>
          <p className="text-sm text-neutral-400">
            If an account is associated with that email, we have dispatched a
            secure password reset link.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 text-xs font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="mb-2 text-center">
        <p className="text-sm text-neutral-400">
          Enter your registered email address below and we will dispatch a reset
          link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="name@example.com"
            disabled={isLoading}
            className="h-11 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-sm text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-500 border-t-white" />
          ) : (
            'Dispatch Reset Link'
          )}
        </button>
      </form>

      <div className="text-center text-xs text-neutral-500">
        <Link
          href="/login"
          className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
