import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getApplications } from '@/src/shared/api/applications';
import { searchJobRoles } from '@/src/shared/api/job-role-suggestions';
import { useDebouncedValue } from '@/src/shared/hooks/use-debounced-value';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';
import type { ProjectAutocompleteOption } from '@/src/shared/ui/project-autocomplete';
import type { ProjectSelectOption } from '@/src/shared/ui/project-select';
import { calculateMetrics, filterApplications } from '../_lib/application-metrics';
import type { TrackerFilter } from '../_lib/application-presentation';

export function useApplicationQueries({
  accessToken,
  formRendered,
  vacancyTitle,
  filter,
}: {
  accessToken?: string;
  formRendered: boolean;
  vacancyTitle: string;
  filter: TrackerFilter;
}) {
  const resumesQuery = useResumesQuery(accessToken);
  const debouncedTitle = useDebouncedValue(vacancyTitle.trim());
  const applicationsQuery = useQuery({
    queryKey: ['job-applications'],
    queryFn: () => getApplications(accessToken as string),
    enabled: Boolean(accessToken),
    staleTime: 0,
  });
  const suggestionsQuery = useQuery({
    queryKey: ['job-role-suggestions', debouncedTitle],
    queryFn: () => searchJobRoles({ query: debouncedTitle, accessToken: accessToken as string }),
    enabled: Boolean(accessToken && formRendered && debouncedTitle.length >= 2),
    staleTime: 60 * 60 * 1000,
  });
  const applications = useMemo(
    () => applicationsQuery.data?.applications ?? [],
    [applicationsQuery.data?.applications]
  );
  const resumes = useMemo(
    () => resumesQuery.data?.resumes ?? [],
    [resumesQuery.data?.resumes]
  );
  const filtered = useMemo(
    () => filterApplications(applications, filter),
    [applications, filter]
  );
  const upcoming = useMemo(
    () =>
      applications
        .filter(
          (item) =>
            item.status === 'interview' &&
            item.interview_at &&
            new Date(item.interview_at).getTime() >= applicationsQuery.dataUpdatedAt
        )
        .sort(
          (left, right) =>
            new Date(left.interview_at as string).getTime() -
            new Date(right.interview_at as string).getTime()
        ),
    [applications, applicationsQuery.dataUpdatedAt]
  );
  const vacancyOptions = useMemo<ProjectAutocompleteOption[]>(
    () =>
      (suggestionsQuery.data?.roles ?? []).map((item) => ({ id: item.id, value: item.text })),
    [suggestionsQuery.data?.roles]
  );
  const resumeOptions = useMemo<ProjectSelectOption[]>(
    () => [
      { value: '__none__', label: 'Без привязки' },
      ...resumes.map((resume) => ({ value: resume.id, label: resume.title })),
    ],
    [resumes]
  );

  return {
    applications,
    applicationsQuery,
    filtered,
    metrics: calculateMetrics(applications),
    resumeNames: new Map(resumes.map((resume) => [resume.id, resume.title])),
    resumeOptions,
    resumesQuery,
    suggestionsQuery,
    upcoming,
    vacancyOptions,
    visibleIds: new Set(filtered.map((item) => item.id)),
  };
}
