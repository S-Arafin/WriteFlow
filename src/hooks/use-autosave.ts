import { useEffect, useRef, useState, useCallback } from 'react';

import { updateDocument } from '@/actions/documents';

interface AutoSaveProps {
  documentId: string;
  initialTitle: string;
  initialContent: string;
}

/**
 * Custom hook to manage debounced auto-saving of documents.
 * Handles timing thresholds, track save indicators, and sets block unload listeners.
 */
export function useAutoSave({
  documentId,
  initialTitle,
  initialContent,
}: AutoSaveProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Keep track of unsaved changes in a ref for the beforeunload event
  const isDirtyRef = useRef(false);

  // Core save function
  const saveDocumentData = useCallback(
    async (targetTitle: string, targetContent: string) => {
      setIsSaving(true);
      setSaveError(null);
      try {
        const res = await updateDocument(documentId, {
          title: targetTitle,
          content: targetContent,
        });

        if (res.success) {
          setLastSaved(new Date());
          isDirtyRef.current = false;
        } else {
          setSaveError(res.error || 'Failed to save changes');
        }
      } catch (err) {
        console.error('[useAutoSave] Network save error:', err);
        setSaveError('Network error: Failed to save document');
      } finally {
        setIsSaving(false);
      }
    },
    [documentId]
  );

  // Debounced trigger function
  const triggerAutoSave = useCallback(
    (newTitle: string, newContent: string) => {
      setTitle(newTitle);
      setContent(newContent);
      isDirtyRef.current = true;
      setIsSaving(true); // Show immediate "saving..." style feedback

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        saveDocumentData(newTitle, newContent);
      }, 2000);
    },
    [saveDocumentData]
  );

  // Prevent unexpected tab/window closing when auto-saving is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current || isSaving) {
        e.preventDefault();
        // Modern standard requires setting returnValue
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isSaving]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    title,
    content,
    isSaving,
    lastSaved,
    saveError,
    triggerAutoSave,
  };
}
