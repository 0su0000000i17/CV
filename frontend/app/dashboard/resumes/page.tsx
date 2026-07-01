'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/src/shared/lib/supabase/client';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';

import { ResumesHeader } from './_components/resumes-header';
import { ResumesList } from './_components/resumes-list';
import { ResumesStats } from './_components/resumes-stats';

export default function ResumesPage() {
  const [accessToken, setAccessToken] = useState<string>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token);
    });
  }, []);

  const resumesQuery = useResumesQuery(accessToken);

  const resumes = resumesQuery.data?.resumes ?? [];

  return (
    <div>
      <ResumesHeader resumeCount={resumes.length} />
      <ResumesStats resumes={resumes} />
      <ResumesList resumes={resumes} isLoading={resumesQuery.isLoading} />
    </div>
  );
}
