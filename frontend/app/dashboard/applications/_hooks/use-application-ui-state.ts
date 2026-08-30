import { useEffect, useRef, useState } from 'react';
import type { useSearchParams } from 'next/navigation';

import type { JobApplication } from '@/src/shared/api/applications';
import {
  applicationToForm,
  createEmptyForm,
  createInitialForm,
  type ApplicationFormState,
} from '../_lib/application-form';
import type { TrackerFilter } from '../_lib/application-presentation';
import { useTimerRegistry } from './use-timer-registry';

export function useApplicationUiState(
  searchParams: ReturnType<typeof useSearchParams>
) {
  const startsOpen = Boolean(searchParams.get('title'));
  const [formOpen, setFormOpen] = useState(startsOpen);
  const [formRendered, setFormRendered] = useState(startsOpen);
  const [form, setForm] = useState<ApplicationFormState>(() => createInitialForm(searchParams));
  const [editTarget, setEditTarget] = useState<JobApplication | null>(null);
  const [editForm, setEditForm] = useState<ApplicationFormState>(createEmptyForm);
  const [deleteTarget, setDeleteTarget] = useState<JobApplication | null>(null);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TrackerFilter>('all');
  const formCloseTimer = useRef<number | null>(null);
  const { cancel, schedule } = useTimerRegistry();

  useEffect(() => {
    if (!enteringId) return;
    const timer = window.setTimeout(() => setEnteringId(null), 950);
    return () => window.clearTimeout(timer);
  }, [enteringId]);

  function updateForm<K extends keyof ApplicationFormState>(
    field: K,
    value: ApplicationFormState[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateEditForm<K extends keyof ApplicationFormState>(
    field: K,
    value: ApplicationFormState[K]
  ) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  function openForm() {
    cancel(formCloseTimer.current);
    formCloseTimer.current = null;
    setFormRendered(true);
    requestAnimationFrame(() => setFormOpen(true));
  }

  function closeForm() {
    setFormOpen(false);
    cancel(formCloseTimer.current);
    formCloseTimer.current = schedule(() => {
      setFormRendered(false);
      formCloseTimer.current = null;
    }, 280);
  }

  function toggleForm() {
    if (formOpen) closeForm();
    else openForm();
  }

  function openEditor(item: JobApplication, status = item.status) {
    setEditForm({ ...applicationToForm(item), status });
    setEditTarget(item);
  }

  function requestDeleteFromEditor(blocked: boolean) {
    if (!editTarget || blocked) return;
    const target = editTarget;
    setEditTarget(null);
    schedule(() => setDeleteTarget(target), 210);
  }

  function handleCreated(id: string) {
    setEnteringId(id);
    closeForm();
    setForm(createEmptyForm());
  }

  function handleDeleted(id: string, refresh: () => Promise<unknown>) {
    setDeleteTarget(null);
    setRemovingId(id);
    schedule(() => {
      void refresh().finally(() => setRemovingId(null));
    }, 320);
  }

  return {
    closeEditor: () => setEditTarget(null),
    deleteTarget,
    editForm,
    editTarget,
    enteringId,
    filter,
    form,
    formOpen,
    formRendered,
    handleCreated,
    handleDeleted,
    openEditor,
    removingId,
    requestDeleteFromEditor,
    setDeleteTarget,
    setFilter,
    toggleForm,
    updateEditForm,
    updateForm,
  };
}
