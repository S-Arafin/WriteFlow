'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { createReview } from '@/actions/reviews';
import { cn } from '@/lib/utils';

// ─── Validation ───────────────────────────────────────────────────────────────

const reviewFormSchema = z.object({
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Please select a star rating')
    .max(5, 'Rating cannot exceed 5'),
  body: z
    .string()
    .max(2000, 'Review body cannot exceed 2000 characters')
    .optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReviewFormProps {
  templateId: string;
  isAuthenticated: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewForm({ templateId, isAuthenticated }: ReviewFormProps) {
  const router = useRouter();
  const [hoverRating, setHoverRating] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, body: '' },
  });

  const selectedRating = useWatch({ control, name: 'rating', defaultValue: 0 });

  if (!isAuthenticated) {
    return (
      <div className="border-border bg-muted/30 rounded-xl border p-6 text-center">
        <p className="text-muted-foreground text-sm">
          You must be{' '}
          <a
            href="/login"
            className="text-indigo-400 underline-offset-2 hover:underline"
          >
            signed in
          </a>{' '}
          to leave a review.
        </p>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="border-border rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
        <p className="text-sm font-medium text-emerald-400">
          ✓ Review submitted and pending approval. Thank you!
        </p>
      </div>
    );
  }

  const onSubmit = async (data: ReviewFormValues) => {
    setSubmitError(null);
    const result = await createReview({
      templateId,
      rating: data.rating,
      body: data.body,
    });

    if (result.success) {
      setSubmitSuccess(true);
      router.refresh(); // Revalidate the RSC to pick up the new review count
    } else {
      setSubmitError(result.error ?? 'An unexpected error occurred.');
    }
  };

  return (
    <form
      id="review-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {/* Star Rating Selector */}
      <div>
        <label className="text-foreground mb-2 block text-sm font-medium">
          Your Rating <span className="text-red-400">*</span>
        </label>
        <div
          className="flex gap-1"
          onMouseLeave={() => setHoverRating(0)}
          role="radiogroup"
          aria-label="Select a star rating"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              id={`review-star-${star}`}
              role="radio"
              aria-checked={selectedRating === star}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              onMouseEnter={() => setHoverRating(star)}
              onClick={() => setValue('rating', star, { shouldValidate: true })}
              className="cursor-pointer transition-transform hover:scale-110 focus-visible:outline-none"
            >
              <Star
                className={cn(
                  'size-7 transition-colors',
                  star <= (hoverRating || selectedRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/40 fill-none'
                )}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="mt-1 text-xs text-red-400">{errors.rating.message}</p>
        )}
      </div>

      {/* Body Textarea */}
      <div>
        <label
          htmlFor="review-body"
          className="text-foreground mb-1.5 block text-sm font-medium"
        >
          Review{' '}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          id="review-body"
          rows={4}
          placeholder="Describe your experience with this template — what worked, what didn't, and who it's best suited for."
          {...register('body')}
          className="border-border bg-background placeholder:text-muted-foreground focus:ring-ring/50 w-full resize-y rounded-lg border px-3 py-2.5 text-sm transition-shadow outline-none focus:ring-2"
        />
        {errors.body && (
          <p className="mt-1 text-xs text-red-400">{errors.body.message}</p>
        )}
      </div>

      {/* Server-side error */}
      {submitError && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {submitError}
        </p>
      )}

      {/* Submit */}
      <button
        id="review-submit"
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {isSubmitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
