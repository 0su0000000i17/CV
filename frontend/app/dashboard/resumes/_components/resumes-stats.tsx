import type { UploadedResume } from '@/src/shared/api/resumes';

type ResumesStatsProps = {
  resumes: UploadedResume[];
};

export function ResumesStats({ resumes }: ResumesStatsProps) {
  const analyzedResumes = resumes.filter(
    (resume) =>
      resume.analysis_status === 'completed' && resume.last_score !== null,
  );
  const averageScore = analyzedResumes.length
    ? Math.round(
        analyzedResumes.reduce(
          (sum, resume) => sum + (resume.last_score ?? 0),
          0,
        ) / analyzedResumes.length,
      )
    : null;
  const attentionCount = resumes.filter(
    (resume) =>
      resume.analysis_status !== 'completed' &&
      resume.analysis_status !== 'analyzing',
  ).length;

  const cards = [
    { label: 'Всего резюме', value: String(resumes.length) },
    { label: 'Оценено', value: String(analyzedResumes.length) },
    {
      label: 'Средний балл',
      value: averageScore === null ? '—' : `${averageScore}/100`,
    },
    { label: 'Требуют действия', value: String(attentionCount) },
  ];

  return (
    <section className="my-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-white/10 bg-white/[0.018] p-4 sm:p-5"
        >
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-white/35">
            {card.label}
          </p>
          <p className="mt-4 text-2xl font-medium tracking-[-0.04em] text-white sm:text-3xl">
            {card.value}
          </p>
        </article>
      ))}
    </section>
  );
}
