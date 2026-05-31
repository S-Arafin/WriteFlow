'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { registerUser } from '@/actions/users';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (!response.success) {
        setError(response.error || 'An error occurred during registration');
        setIsLoading(false);
      } else {
        router.push('/login?registered=true');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
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
        {/* Name Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            Full Name
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="John Doe"
            disabled={isLoading}
            className="h-11 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-sm text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>
          )}
        </div>

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
          <label className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            Password
          </label>
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

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            className="h-11 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-sm text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-500">
              {errors.confirmPassword.message}
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
            'Create Account'
          )}
        </button>
      </form>

      <div className="text-center text-xs text-neutral-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
