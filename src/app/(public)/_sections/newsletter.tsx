'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export function NewsletterSection() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: NewsletterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Subscription failed. Please try again.');
      }

      setIsSuccess(true);
      reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-neutral-950 px-4 py-20">
      <div className="container mx-auto flex max-w-4xl flex-col items-center space-y-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 text-center backdrop-blur md:p-12">
        {/* Success Screen */}
        {isSuccess ? (
          <div className="animate-fade-in flex flex-col items-center space-y-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              Subscription Confirmed
            </h3>
            <p className="max-w-xs text-xs leading-relaxed text-neutral-400">
              We have successfully registered your address. Prepare for
              disciplined writing insights.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="max-w-md space-y-3">
              <h2 className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
                Newsletter
              </h2>
              <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Subscribe To Writing Insights
              </p>
              <p className="text-xs leading-relaxed text-neutral-400">
                Receive weekly blueprints, copywriting templates, and advanced
                AI strategies to maximize your workflow momentum. No spam, only
                disciplined copy techniques.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full max-w-md flex-col items-center space-y-3"
            >
              {error && (
                <div className="w-full rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs font-semibold text-rose-500">
                  {error}
                </div>
              )}

              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute top-3.5 left-3.5 h-4 w-4 text-neutral-500" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Enter your email"
                    disabled={isLoading}
                    className="h-11 w-full rounded-lg border border-neutral-800 bg-neutral-950 pr-4 pl-10 text-sm text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 shrink-0 cursor-pointer rounded-lg bg-indigo-600 px-6 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe Now'}
                </button>
              </div>
              {errors.email && (
                <p className="self-start text-xs text-rose-500 sm:pl-1">
                  {errors.email.message}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </section>
  );
}
