'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError('Invalid email or password credentials');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Demo Login Helper
  const fillDemoCredentials = (role: 'USER' | 'ADMIN') => {
    if (role === 'ADMIN') {
      setValue('email', 'admin@writeflow.com');
      setValue('password', '123456');
    } else {
      setValue('email', 'user@writeflow.com');
      setValue('password', '123456');
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-semibold text-rose-500">
          {error}
        </div>
      )}

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

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            className="h-11 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-sm text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-rose-500">
              {errors.password.message}
            </p>
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
            'Sign In'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-800" />
        </div>
        <span className="relative z-10 bg-neutral-900/60 px-3 text-xs tracking-wider text-neutral-500 uppercase">
          Demo QA Presets
        </span>
      </div>

      {/* Demo Credentials Quick Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => fillDemoCredentials('USER')}
          disabled={isLoading}
          className="h-10 cursor-pointer rounded-lg border border-neutral-800 bg-neutral-950 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          Demo User (USER)
        </button>
        <button
          type="button"
          onClick={() => fillDemoCredentials('ADMIN')}
          disabled={isLoading}
          className="h-10 cursor-pointer rounded-lg border border-neutral-800 bg-neutral-950 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          Demo Admin (ADMIN)
        </button>
      </div>

      <div className="text-center text-xs text-neutral-500">
        New to WriteFlow?{' '}
        <Link
          href="/register"
          className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
