'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(false);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      // Fallback if EmailJS variables are not set yet
      if (
        !serviceId ||
        !templateId ||
        !publicKey ||
        serviceId === 'placeholder'
      ) {
        console.warn(
          '[EmailJS] Environment keys missing. Emulating sandbox dispatch.'
        );
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsSuccess(true);
        reset();
        return;
      }

      const payload = {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          from_name: data.name,
          from_email: data.email,
          subject: data.subject,
          message: data.message,
        },
      };

      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to dispatch email.');
      }

      setIsSuccess(true);
      reset();
    } catch (err: unknown) {
      console.error('[EmailJS dispatch failed]:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An error occurred while sending your message. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-16 font-sans transition-colors duration-300 dark:bg-black">
      <div className="container mx-auto grid max-w-5xl grid-cols-1 items-start gap-12 md:grid-cols-2">
        {/* Info Column */}
        <div className="space-y-8 text-left">
          <div className="space-y-4">
            <span className="font-mono text-xs font-bold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
              Support Telemetry
            </span>
            <h1 className="font-mono text-3xl font-extrabold tracking-tight text-neutral-900 uppercase sm:text-5xl dark:text-white">
              Connect With Us
            </h1>
            <p className="text-neutral-550 text-sm leading-relaxed font-medium dark:text-neutral-400">
              Have questions regarding database connections, subscription tier
              scaling, or Enterprise custom models? Connect directly with our
              engineering and support structures.
            </p>
          </div>

          <div className="space-y-4 pt-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <a
                href="mailto:arafin23103@gmail.com"
                className="hover:underline"
              >
                arafin23103@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <a href="tel:+8801979817736" className="hover:underline">
                +8801979817736
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="dark:border-neutral-850 rounded-[2.5rem] border border-neutral-200 bg-white/70 p-8 shadow-sm backdrop-blur-xl dark:bg-neutral-900/40">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500 dark:text-emerald-400" />
              <h2 className="font-mono text-xl font-bold tracking-tight text-neutral-900 uppercase dark:text-white">
                Message Dispatched
              </h2>
              <p className="text-neutral-550 max-w-xs text-xs leading-relaxed font-medium dark:text-neutral-400">
                Thank you for connecting. Our support team will review your
                parameters and follow up in under 24 hours.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 text-left"
            >
              {errorMessage && (
                <div className="dark:text-rose-450 rounded-xl border border-rose-500/20 bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:bg-rose-950/20">
                  {errorMessage}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-neutral-550 font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="John Doe"
                  disabled={isLoading}
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 text-xs text-neutral-800 placeholder-neutral-400 transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-white dark:placeholder-neutral-600"
                />
                {errors.name && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-neutral-550 font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  className="dark:bg-neutral-955/50 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 text-xs text-neutral-800 placeholder-neutral-400 transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:text-white dark:placeholder-neutral-600"
                />
                {errors.email && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Subject Field */}
              <div className="space-y-1.5">
                <label className="text-neutral-550 font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                  Subject
                </label>
                <input
                  {...register('subject')}
                  type="text"
                  placeholder="Billing Inquiry / API support"
                  disabled={isLoading}
                  className="dark:bg-neutral-955/50 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 text-xs text-neutral-800 placeholder-neutral-400 transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:text-white dark:placeholder-neutral-600"
                />
                {errors.subject && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div className="space-y-1.5">
                <label className="text-neutral-550 font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                  Message Description
                </label>
                <textarea
                  {...register('message')}
                  rows={4}
                  placeholder="Details of your request..."
                  disabled={isLoading}
                  className="dark:bg-neutral-955/50 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 text-xs text-neutral-800 placeholder-neutral-400 transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:text-white dark:placeholder-neutral-600"
                />
                {errors.message && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 transition-all duration-200 hover:scale-[1.01] hover:bg-indigo-500 active:scale-95 disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600"
              >
                {isLoading ? 'Dispatching...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
