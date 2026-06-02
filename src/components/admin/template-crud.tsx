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
      // Re-fetch template list or update local state (seamless refresh is best)
      // Since Server Action revalidates, we can refresh the window or wait for server re-load
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
    <div className="space-y-6 font-sans">
      {/* Alert panels */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-900/30 bg-emerald-950/20 p-4 text-sm text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3">
        {/* Templates Listing - Columns 1 & 2 */}
        <div className="space-y-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Active Templates ({templates.length})
            </span>
            {activeForm === null && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/10 transition-all hover:from-violet-400 hover:to-indigo-400 active:scale-[0.98]"
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
                className="group flex h-56 flex-col justify-between rounded-2xl border border-slate-900 bg-slate-900/10 p-6 backdrop-blur-xl transition-all hover:border-slate-800/80"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex rounded border border-violet-900/30 bg-violet-950/40 px-2 py-0.5 text-[9px] font-bold tracking-wider text-violet-400 uppercase">
                      {t.category}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                      {t.isPublished ? (
                        <span className="inline-flex items-center gap-0.5 rounded border border-emerald-900/30 bg-emerald-950/20 px-1.5 py-0.5 text-emerald-400">
                          <Eye className="h-2.5 w-2.5" /> PUBLISHED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-slate-500">
                          <EyeOff className="h-2.5 w-2.5" /> DRAFT
                        </span>
                      )}
                    </span>
                  </div>
                  <h3 className="line-clamp-1 text-base font-bold text-slate-200 transition-colors group-hover:text-violet-400">
                    {t.title}
                  </h3>
                  <p className="line-clamp-3 text-xs leading-normal text-slate-400">
                    {t.description}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-slate-900/60 pt-4">
                  <span className="font-mono text-[10px] font-semibold text-slate-500">
                    Model: {t.aiModel}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="rounded-lg border border-slate-800/80 bg-slate-950 p-1.5 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
                      title="Edit Template"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={isDeleting !== null}
                      className="rounded-lg border border-red-950/30 bg-red-950/10 p-1.5 text-red-400 transition-colors hover:bg-red-950/30 hover:text-red-300"
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
          <div className="space-y-6 rounded-3xl border border-slate-900 bg-slate-900/30 p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-white">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  <span>
                    {activeForm === 'create' ? 'New Template' : 'Edit Template'}
                  </span>
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Configure layout, model rules, and parameters.
                </p>
              </div>
              <button
                onClick={() => setActiveForm(null)}
                className="rounded-lg border border-slate-800 bg-slate-950 p-1.5 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 font-sans text-xs"
            >
              <div>
                <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Template Title
                </label>
                <input
                  type="text"
                  {...register('title')}
                  disabled={isSubmitting}
                  placeholder="e.g. AIDA Facebook Ad generator"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-200 transition-colors placeholder:text-slate-700 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                />
                {errors.title && (
                  <p className="mt-1 text-[10px] text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Short Description
                </label>
                <textarea
                  {...register('description')}
                  disabled={isSubmitting}
                  rows={2}
                  placeholder="Explains what this template does on explore cards..."
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-200 transition-colors placeholder:text-slate-700 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                />
                {errors.description && (
                  <p className="mt-1 text-[10px] text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Category Tag
                  </label>
                  <select
                    {...register('category')}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-200 transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                  >
                    <option value="BLOG">BLOG</option>
                    <option value="SOCIAL">SOCIAL</option>
                    <option value="EMAIL">EMAIL</option>
                    <option value="AD_COPY">AD_COPY</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Generative Model
                  </label>
                  <select
                    {...register('aiModel')}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-200 transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Secure Agent Prompt
                </label>
                <textarea
                  {...register('prompt')}
                  disabled={isSubmitting}
                  rows={4}
                  placeholder="System instructions. Wrap variables in curly braces, e.g. {topic}..."
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 font-mono text-[11px] text-slate-200 transition-colors placeholder:text-slate-700 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                />
                {errors.prompt && (
                  <p className="mt-1 text-[10px] text-red-400">
                    {errors.prompt.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Sample Output
                </label>
                <textarea
                  {...register('sampleOutput')}
                  disabled={isSubmitting}
                  rows={3}
                  placeholder="Initial default editor content for template instances..."
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 font-mono text-[11px] text-slate-200 transition-colors placeholder:text-slate-700 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Writing Tone
                  </label>
                  <input
                    type="text"
                    {...register('tone')}
                    disabled={isSubmitting}
                    placeholder="e.g. Professional & Direct"
                    className="placeholder:text-slate-750 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-200 transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
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
                    className="placeholder:text-slate-750 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-200 transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register('isPublished')}
                  disabled={isSubmitting}
                  className="h-4 w-4 cursor-pointer rounded border-slate-800 bg-slate-950 text-violet-500 focus:ring-violet-500/50"
                />
                <label
                  htmlFor="isPublished"
                  className="cursor-pointer font-medium text-slate-300 select-none"
                >
                  Publish immediately (Visible in templates directory)
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-900/60 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/10 transition-all hover:from-violet-400 hover:to-indigo-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
