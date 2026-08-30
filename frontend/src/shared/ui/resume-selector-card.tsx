'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { UploadedResume } from '@/src/shared/api/resumes';
import { ResumeSelectorModal } from './resume-selector-modal';
import { getResumeSubtitle, ResumeFileIcon, ResumeStatus } from './resume-selector-utils';

export function ResumeSelectorCard(props: {
  selectedResume?: UploadedResume; resumes: UploadedResume[];
  isLoading: boolean; isError: boolean; onSelectResume: (id: string) => void;
  title?: string; description?: string; modalTitle?: string; modalDescription?: string;
  emptyTitle?: string; emptyDescription?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const value = search.trim().toLocaleLowerCase('ru-RU');
    return !value ? props.resumes : props.resumes.filter((resume) =>
      [resume.title, resume.file_name, resume.role, resume.file_type].filter(Boolean)
        .join(' ').toLocaleLowerCase('ru-RU').includes(value));
  }, [props.resumes, search]);
  const setOpenState = (next: boolean) => { setOpen(next); if (!next) setSearch(''); };
  const select = (id: string) => { props.onSelectResume(id); setOpenState(false); };
  return <>
    <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0"><h2 className="text-lg font-medium tracking-[-0.02em] text-foreground">{props.title ?? 'Выбранное резюме'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{props.description ?? 'Выберите файл для работы.'}</p></div>
        <button type="button" onClick={() => setOpenState(true)}
          className="shrink-0 rounded-lg px-2 py-1 text-sm text-white/45 transition-[background-color,color] hover:bg-white/[0.04] hover:text-white">Сменить</button>
      </div>
      {props.isLoading ? <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Загружаем список резюме...</div>
        : props.isError ? <div className="rounded-xl border border-red-400/15 bg-red-400/[0.04] px-4 py-3 text-sm text-red-300">Не удалось загрузить резюме. Попробуйте обновить страницу.</div>
          : props.selectedResume ? <button type="button" onClick={() => setOpenState(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition-[background-color,border-color,transform] hover:border-white/20 hover:bg-white/[0.035] active:scale-[0.995]">
            <ResumeFileIcon /><span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{props.selectedResume.title || props.selectedResume.file_name}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{getResumeSubtitle(props.selectedResume)}</span>
            </span><ResumeStatus resume={props.selectedResume} /></button>
            : <button type="button" onClick={() => setOpenState(true)}
              className="w-full rounded-xl border border-dashed border-white/12 bg-white/[0.012] px-4 py-4 text-left transition-[background-color,border-color] hover:border-white/20 hover:bg-white/[0.025]">
              <span className="block text-sm font-medium text-foreground">{props.emptyTitle ?? 'Резюме не выбрано'}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{props.emptyDescription ?? 'Загрузите резюме или выберите файл из списка.'}</span></button>}
    </section>
    <ResumeSelectorModal open={open} onOpenChange={setOpenState}
      title={props.modalTitle ?? 'Выберите резюме'} description={props.modalDescription ?? 'Выбранный файл будет использован в текущем разделе.'}
      search={search} onSearch={setSearch} loading={props.isLoading} resumes={filtered}
      selectedId={props.selectedResume?.id} onSelect={select} />
  </>;
}
