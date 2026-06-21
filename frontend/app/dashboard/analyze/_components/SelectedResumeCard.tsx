"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, FileText, Loader2, Search, X } from "lucide-react";

import type { UploadedResume } from "@/src/shared/api/resumes";

type Props = {
  selectedResume?: UploadedResume;
  resumes: UploadedResume[];
  isLoading: boolean;
  isError: boolean;
  onSelectResume: (resumeId: string) => void;
};

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) {
    return "Размер не указан";
  }

  const mb = bytes / 1024 / 1024;

  if (mb >= 1) {
    return `${mb.toFixed(1)} МБ`;
  }

  return `${Math.round(bytes / 1024)} КБ`;
}

function formatResumeStatus(resume?: UploadedResume) {
  if (!resume) {
    return "Резюме не выбрано";
  }

  if (typeof resume.last_score === "number") {
    return `Последняя оценка: ${resume.last_score}/100`;
  }

  if (resume.analysis_status === "completed") {
    return "Оценка завершена";
  }

  if (resume.analysis_status === "processing") {
    return "Оценка в процессе";
  }

  if (resume.analysis_status === "failed") {
    return "Оценка не удалась";
  }

  return "Оценка не пройдена";
}

function getResumeSubtitle(resume: UploadedResume) {
  if (resume.role) {
    return resume.role;
  }

  return `${resume.file_type || "Файл"} · ${formatFileSize(resume.file_size)}`;
}

export function SelectedResumeCard({
  selectedResume,
  resumes,
  isLoading,
  isError,
  onSelectResume,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredResumes = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return resumes;
    }

    return resumes.filter((resume) => {
      const searchSource = [
        resume.title,
        resume.file_name,
        resume.role,
        resume.file_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchSource.includes(normalizedSearch);
    });
  }, [resumes, searchValue]);

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSearchValue("");
  }

  function handleSelect(resumeId: string) {
    onSelectResume(resumeId);
    closeModal();
  }

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-foreground">
              Выбранное резюме
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Оценка будет запущена для выбранного файла.
            </p>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Сменить
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Загружаем список резюме...
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="font-medium text-foreground">
              Не удалось загрузить резюме
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Обновите страницу или попробуйте позже.
            </p>
          </div>
        ) : selectedResume ? (
          <div className="flex items-start gap-4 rounded-2xl border border-border bg-background p-5">
            <div className="rounded-xl bg-muted p-3">
              <FileText className="h-5 w-5 text-foreground" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-medium text-foreground">
                {selectedResume.title || selectedResume.file_name}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {getResumeSubtitle(selectedResume)}
              </p>

              <div className="mt-3 inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {formatResumeStatus(selectedResume)}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="font-medium text-foreground">Резюме не выбрано</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Загрузите резюме или выберите файл из списка.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <>
          <div className="pointer-events-none fixed inset-0 z-50 min-h-screen bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

          <div
            role="presentation"
            onClick={closeModal}
            className="fixed inset-0 z-50 flex min-h-screen cursor-pointer items-center justify-center overflow-y-auto p-4"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Выбор резюме"
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl cursor-default rounded-2xl border border-border bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-medium text-foreground">
                    Выберите резюме
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Выбранный файл будет использован на странице оценки.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Закрыть окно выбора резюме"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />

                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Поиск по названию или роли"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Загружаем резюме...
                  </div>
                ) : filteredResumes.length ? (
                  filteredResumes.map((resume) => {
                    const isSelected = selectedResume?.id === resume.id;

                    return (
                      <button
                        key={resume.id}
                        type="button"
                        onClick={() => handleSelect(resume.id)}
                        className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors duration-150 hover:bg-muted"
                      >
                        <div className="rounded-md bg-muted p-1.5">
                          <FileText className="h-3.5 w-3.5 text-foreground" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="truncate text-sm font-medium text-foreground">
                              {resume.title || resume.file_name}
                            </p>

                            {isSelected && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                                <Check className="h-3 w-3" />
                                Выбрано
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {getResumeSubtitle(resume)}
                          </p>

                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {formatResumeStatus(resume)}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="font-medium text-foreground">
                      Резюме не найдены
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Попробуйте изменить поисковый запрос или загрузите новое
                      резюме.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}