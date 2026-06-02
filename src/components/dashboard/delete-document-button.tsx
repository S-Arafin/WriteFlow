'use client';

import { Trash2 } from 'lucide-react';
import React from 'react';

interface DeleteDocumentButtonProps {
  documentId: string;
  onDelete: (formData: FormData) => Promise<void>;
}

export function DeleteDocumentButton({
  documentId,
  onDelete,
}: DeleteDocumentButtonProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (
      !confirm(
        'Are you absolutely sure you want to delete this document? This action is permanent and cannot be undone.'
      )
    ) {
      e.preventDefault();
    }
  };

  return (
    <form action={onDelete} onSubmit={handleSubmit}>
      <input type="hidden" name="documentId" value={documentId} />
      <button
        type="submit"
        className="inline-flex rounded-lg border border-red-950/30 bg-red-950/10 p-2 text-red-400 transition-colors hover:bg-red-950/30 hover:text-red-300"
        title="Delete Document"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
