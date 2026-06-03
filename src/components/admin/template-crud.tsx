'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sparkles,
  Trash2,
  Edit3,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { upsertTemplate, deleteTemplate } from '@/actions/admin';

const templateSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  sampleOutput: z.string().optional().nullable(),
  category: z.enum(['BLOG', 'SOCIAL', 'EMAIL', 'AD_COPY']),
  tone: z.string().optional().nullable(),
  estimatedWords: z.number().int().positive().optional().nullable(),
  aiModel: z.string(),
  isPublished: z.boolean(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface Template {
  id: string;
  slug: string;
  title: string;
  description: string;
  prompt: string;
  sampleOutput: string | null;
  category: 'BLOG' | 'SOCIAL' | 'EMAIL' | 'AD_COPY';
  tone: string | null;
  estimatedWords: number | null;
  aiModel: string;
  isPublished: boolean;
  rating: number;
  usageCount: number;
}

interface TemplateCrudProps {
  initialTemplates: Template[];
}

export function TemplateCrud({ initialTemplates }: TemplateCrudProps) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [activeForm, setActiveForm] = useState<'create' | 'edit' | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: '',
      description: '',
      prompt: '',
      sampleOutput: '',
      category: 'BLOG',
      tone: 'Professional & Informative',
      estimatedWords: 500,
      aiModel: 'gemini-2.5-flash',
      isPublished: true,
    },
  });

  function openCreate() {
    setError(null);
    setSuccess(null);
    setEditingTemplate(null);
    reset({
      title: '',
      description: '',
      prompt: '',
      sampleOutput: '',
      category: 'BLOG',
      tone: 'Professional & Informative',
      estimatedWords: 500,
      aiModel: 'gemini-2.5-flash',
      isPublished: true,
    });
    setActiveForm('create');
  }

  function openEdit(template: Template) {
    setError(null);
    setSuccess(null);
    setEditingTemplate(template);
    reset({
      id: template.id,
      title: template.title,
      description: template.description,
      prompt: template.prompt,
      sampleOutput: template.sampleOutput || '',
      category: template.category,
      tone: template.tone || '',
      estimatedWords: template.estimatedWords || null,
      aiModel: template.aiModel,
      isPublished: template.isPublished,
    });
    setActiveForm('edit');
  }

  async function onSubmit(data: TemplateFormValues) {
    setError(null);
    setSuccess(null);

    // Ensure estimatedWords is serialized as integer
    const payload = {
      ...data,
      estimatedWords: data.estimatedWords ? Number(data.estimatedWords) : null,
    };

    const res = await upsertTemplate(payload);
    if (!res.success) {
      setError(res.error || 'Failed to save template.');
    } else {
      setSuccess(
        `Template ${activeForm === 'create' ? 'created' : 'updated'} successfully!`
      );
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        'Are you absolutely sure you want to delete this template? This will delete the template record permanently.'
      )
    ) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsDeleting(id);

    const res = await deleteTemplate(id);
    if (!res.success) {
      setError(res.error || 'Failed to delete template.');
      setIsDeleting(null);
    } else {
      setSuccess('Template deleted successfully!');
      setTemplates(templates.filter((t) => t.id !== id));
      setIsDeleting(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  }

  return (
    <div className="space-y-6 font-sans transition-colors duration-300">
      {/* Alert panels */}
      {error && (
        <div className="dark:text-rose-455 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-50 p-4 text-xs font-semibold text-rose-600 dark:bg-rose-950/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50 p-4 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3">
        {/* Templates Listing - Columns 1 & 2 */}
        <div className="space-y-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <span className="dark:text-neutral-450 font-mono text-xs font-bold tracking-wider text-neutral-500 uppercase">
              Active Templates ({templates.length})
            </span>
            {activeForm === null && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition-all duration-200 hover:scale-[1.02] hover:bg-indigo-500 active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Template</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {templates.map((t) => (
              <div
                key={t.id}
                className="group dark:border-neutral-850 flex h-56 flex-col justify-between rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-indigo-500/50 dark:bg-neutral-900/10 dark:hover:border-indigo-500/50"
              >
                <div className="space-y-2 text-left">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex rounded border border-indigo-500/20 bg-indigo-50 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-indigo-600 uppercase dark:border-indigo-900/20 dark:bg-indigo-950/30 dark:text-indigo-400">
                      {t.category}
                    </span>
                    <span className="text-neutral-450 dark:text-neutral-550 flex items-center gap-1 font-mono text-[10px]">
                      {t.isPublished ? (
                        <span className="border-emerald-250 text-emerald-650 inline-flex items-center gap-0.5 rounded border bg-emerald-50 px-1.5 py-0.5 dark:border-emerald-900/20 dark:bg-emerald-950/30 dark:text-emerald-400">
                          <Eye className="h-2.5 w-2.5" /> PUBLISHED
                        </span>
                      ) : (
                        <span className="dark:text-neutral-450 inline-flex items-center gap-0.5 rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                          <EyeOff className="h-2.5 w-2.5" /> DRAFT
                        </span>
                      )}
                    </span>
                  </div>
                  <h3 className="line-clamp-1 font-mono text-base font-bold text-neutral-800 transition-colors group-hover:text-indigo-600 dark:text-neutral-200 dark:group-hover:text-indigo-400">
                    {t.title}
                  </h3>
                  <p className="text-neutral-550 line-clamp-3 text-xs leading-normal font-medium dark:text-neutral-400">
                    {t.description}
                  </p>
                </div>

                <div className="dark:border-neutral-850/60 mt-2 flex items-center justify-between border-t border-neutral-100 pt-4 text-left">
                  <span className="text-neutral-450 dark:text-neutral-550 font-mono text-[10px] font-semibold">
                    Model: {t.aiModel}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-500 transition-colors hover:text-indigo-600 dark:border-neutral-800/80 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                      title="Edit Template"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={isDeleting !== null}
                      className="dark:text-rose-450 rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-950/30 dark:bg-red-950/10 dark:hover:bg-red-950/30"
                      title="Delete Template"
                    >
                      {isDeleting === t.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sliding Sheet / Inline Form Panel - Column 3 */}
        {activeForm !== null && (
          <div className="dark:border-neutral-850 space-y-6 rounded-[2rem] border border-neutral-200 bg-white/80 p-6 text-left shadow-sm backdrop-blur-2xl dark:bg-neutral-900/30">
            <div className="dark:border-neutral-850 flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <h3 className="flex items-center gap-2 font-mono text-base font-bold text-neutral-900 uppercase dark:text-white">
                  <Sparkles className="text-indigo-650 h-4 w-4 dark:text-indigo-400" />
                  <span>
                    {activeForm === 'create' ? 'New Template' : 'Edit Template'}
                  </span>
                </h3>
                <p className="text-neutral-550 dark:text-neutral-450 mt-1 text-xs font-medium">
                  Configure layout, model rules, and parameters.
                </p>
              </div>
              <button
                onClick={() => setActiveForm(null)}
                className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-500 transition-colors hover:text-indigo-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 font-sans text-xs"
            >
              <div>
                <label className="text-neutral-550 mb-1.5 block font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                  Template Title
                </label>
                <input
                  type="text"
                  {...register('title')}
                  disabled={isSubmitting}
                  placeholder="e.g. AIDA Facebook Ad generator"
                  className="dark:text-neutral-250 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-xs text-neutral-800 transition-colors placeholder:text-neutral-400 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950/50 dark:placeholder:text-neutral-600"
                />
                {errors.title && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-neutral-555 mb-1.5 block font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                  Short Description
                </label>
                <textarea
                  {...register('description')}
                  disabled={isSubmitting}
                  rows={2}
                  placeholder="Explains what this template does on explore cards..."
                  className="dark:bg-neutral-955/50 dark:text-neutral-250 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs text-neutral-800 transition-colors placeholder:text-neutral-400 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:placeholder:text-neutral-600"
                />
                {errors.description && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-555 mb-1.5 block font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                    Category Tag
                  </label>
                  <select
                    {...register('category')}
                    disabled={isSubmitting}
                    className="dark:bg-neutral-955/50 dark:text-neutral-250 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs text-neutral-800 transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800"
                  >
                    <option value="BLOG">BLOG</option>
                    <option value="SOCIAL">SOCIAL</option>
                    <option value="EMAIL">EMAIL</option>
                    <option value="AD_COPY">AD_COPY</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-555 mb-1.5 block font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                    Generative Model
                  </label>
                  <select
                    {...register('aiModel')}
                    disabled={isSubmitting}
                    className="dark:bg-neutral-955/50 dark:text-neutral-250 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs text-neutral-800 transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-555 mb-1.5 block font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                  Secure Agent Prompt
                </label>
                <textarea
                  {...register('prompt')}
                  disabled={isSubmitting}
                  rows={4}
                  placeholder="System instructions. Wrap variables in curly braces, e.g. {topic}..."
                  className="dark:bg-neutral-955/50 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 font-mono text-[11px] text-neutral-800 transition-colors placeholder:text-neutral-400 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:text-neutral-200 dark:placeholder:text-neutral-600"
                />
                {errors.prompt && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">
                    {errors.prompt.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-neutral-555 mb-1.5 block font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                  Sample Output
                </label>
                <textarea
                  {...register('sampleOutput')}
                  disabled={isSubmitting}
                  rows={3}
                  placeholder="Initial default editor content for template instances..."
                  className="dark:bg-neutral-955/50 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 font-mono text-[11px] text-neutral-800 transition-colors placeholder:text-neutral-400 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:text-neutral-200 dark:placeholder:text-neutral-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-555 mb-1.5 block font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                    Writing Tone
                  </label>
                  <input
                    type="text"
                    {...register('tone')}
                    disabled={isSubmitting}
                    placeholder="e.g. Professional & Direct"
                    className="text-neutral-805 dark:text-neutral-250 placeholder:text-neutral-450 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950/50 dark:placeholder:text-neutral-600"
                  />
                </div>

                <div>
                  <label className="text-neutral-555 mb-1.5 block font-mono text-[10px] font-bold tracking-wider uppercase dark:text-neutral-400">
                    Est. Word Count
                  </label>
                  <input
                    type="number"
                    disabled={isSubmitting}
                    placeholder="e.g. 500"
                    onChange={(e) =>
                      setValue(
                        'estimatedWords',
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    defaultValue={editingTemplate?.estimatedWords || ''}
                    className="text-neutral-805 dark:text-neutral-250 placeholder:text-neutral-455 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950/50 dark:placeholder:text-neutral-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register('isPublished')}
                  disabled={isSubmitting}
                  className="h-4 w-4 cursor-pointer rounded border-neutral-300 bg-neutral-50 text-indigo-600 focus:ring-indigo-500/50 dark:border-neutral-800 dark:bg-neutral-950"
                />
                <label
                  htmlFor="isPublished"
                  className="dark:text-neutral-350 cursor-pointer text-[10px] font-bold text-neutral-600 uppercase select-none"
                >
                  Publish immediately (Visible in templates directory)
                </label>
              </div>

              <div className="dark:border-neutral-850/80 flex justify-end gap-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-500 transition-colors hover:text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition-colors duration-150 hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Template...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Save Config</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
