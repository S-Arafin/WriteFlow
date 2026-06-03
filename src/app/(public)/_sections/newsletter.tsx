'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
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
    <section className="bg-background px-4 py-20 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto flex max-w-4xl flex-col items-center space-y-8 rounded-2xl border border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-900/40 p-8 text-center backdrop-blur shadow-sm dark:shadow-md md:p-12"
      >
        {/* Success Screen */}
        {isSuccess ? (
          <div className="animate-fade-in flex flex-col items-center space-y-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Subscription Confirmed
            </h3>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              We have successfully registered your address. Prepare for
              disciplined writing insights.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="max-w-md space-y-3">
              <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-500 uppercase">
                Newsletter
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                Subscribe To Writing Insights
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
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
                <div className="w-full rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-500">
                  {error}
                </div>
              )}

              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute top-3.5 left-3.5 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Enter your email"
                    disabled={isLoading}
                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:placeholder-neutral-500 dark:focus:border-indigo-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 shrink-0 cursor-pointer rounded-lg bg-indigo-600 px-6 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 transition-colors disabled:bg-neutral-200 disabled:text-neutral-450 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-550"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe Now'}
                </button>
              </div>
              {errors.email && (
                <p className="self-start text-xs text-rose-600 dark:text-rose-500 sm:pl-1">
                  {errors.email.message}
                </p>
              )}
            </form>
          </>
        )}
      </motion.div>
    </section>
  );
}
