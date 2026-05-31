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

  const onSubmit = async (_data: ContactFormValues) => {
    setIsLoading(true);
    // Simulate API contact request
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);
    reset();
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-16">
      <div className="container mx-auto grid max-w-5xl grid-cols-1 items-start gap-12 md:grid-cols-2">
        {/* Info Column */}
        <div className="space-y-8 text-left">
          <div className="space-y-4">
            <span className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
              Support
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Connect With Us
            </h1>
            <p className="text-sm leading-relaxed text-neutral-400">
              Have questions regarding database connections, subscription tier
              scaling, or Enterprise custom models? Connect directly with our
              engineering and support structures.
            </p>
          </div>

          <div className="space-y-4 pt-4 font-mono text-xs text-neutral-400">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-indigo-400" />
              <span>support@writeflow.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-indigo-400" />
              <span>+1 (555) 019-2834</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-indigo-400" />
              <span>Silicon Valley, CA</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 backdrop-blur">
          {isSuccess ? (
            <div className="animate-fade-in flex flex-col items-center justify-center space-y-4 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-400" />
              <h2 className="text-xl font-bold tracking-tight text-white">
                Message Dispatched
              </h2>
              <p className="max-w-xs text-xs leading-relaxed text-neutral-400">
                Thank you for connecting. Our systems support team will review
                your parameters and follow up in under 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 text-left"
            >
              {/* Name Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold tracking-wider text-neutral-300 uppercase">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="John Doe"
                  disabled={isLoading}
                  className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-xs text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
                />
                {errors.name && (
                  <p className="mt-1 text-[10px] text-rose-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold tracking-wider text-neutral-300 uppercase">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-xs text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-1 text-[10px] text-rose-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Subject Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold tracking-wider text-neutral-300 uppercase">
                  Subject
                </label>
                <input
                  {...register('subject')}
                  type="text"
                  placeholder="Billing Inquiry / API support"
                  disabled={isLoading}
                  className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 text-xs text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
                />
                {errors.subject && (
                  <p className="mt-1 text-[10px] text-rose-500">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold tracking-wider text-neutral-300 uppercase">
                  Message Description
                </label>
                <textarea
                  {...register('message')}
                  rows={4}
                  placeholder="Details of your request..."
                  disabled={isLoading}
                  className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-xs text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
                />
                {errors.message && (
                  <p className="mt-1 text-[10px] text-rose-500">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white transition-all hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500"
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
