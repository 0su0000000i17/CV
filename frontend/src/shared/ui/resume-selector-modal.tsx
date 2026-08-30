import { Check, Loader2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { UploadedResume } from '@/src/shared/api/resumes';
import { getResumeSubtitle, ResumeFileIcon, ResumeStatus } from './resume-selector-utils';

export function ResumeSelectorModal(props: {
  open: boolean; onOpenChange: (open: boolean) => void;
  title: string; description: string; search: string;
  onSearch: (value: string) => void; loading: boolean;
  resumes: UploadedResume[]; selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return <Dialog open={props.open} onOpenChange={props.onOpenChange}>
    <DialogContent className="max-w-xl overflow-hidden p-0">
      <div className="border-b border-white/10 p-6 pr-14">
        <DialogTitle className="mt-0 text-xl">{props.title}</DialogTitle>
        <DialogDescription className="mt-1.5">{props.description}</DialogDescription>
      </div>
      <div className="p-4 sm:p-5">
        <label className="relative block"><span className="sr-only">Поиск резюме</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input value={props.search} onChange={(event) => props.onSearch(event.target.value)}
            placeholder="Название или роль"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none transition-[background-color,border-color] placeholder:text-white/25 hover:border-white/15 focus:border-white/25 focus:bg-white/[0.04]" />
        </label>
        <div className="mt-4 max-h-[min(26rem,60vh)] space-y-2 overflow-y-auto overscroll-contain">
          {props.loading ? <div className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Загружаем резюме...</div>
            : props.resumes.length ? props.resumes.map((resume) => {
              const selected = props.selectedId === resume.id;
              return <button key={resume.id} type="button" onClick={() => props.onSelect(resume.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-[background-color,border-color,transform] active:scale-[0.995] ${selected ? 'border-white/20 bg-white/[0.06]' : 'border-white/10 bg-white/[0.015] hover:border-white/15 hover:bg-white/[0.035]'}`}>
                <ResumeFileIcon /><span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{resume.title || resume.file_name}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{getResumeSubtitle(resume)}</span>
                </span>{selected ? <Check className="h-4 w-4 shrink-0 text-white" /> : <ResumeStatus resume={resume} />}
              </button>;
            }) : <div className="rounded-xl border border-dashed border-white/12 p-6 text-center">
              <p className="text-sm font-medium text-foreground">Резюме не найдены</p>
              <p className="mt-2 text-sm text-muted-foreground">Измените поисковый запрос.</p>
            </div>}
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
