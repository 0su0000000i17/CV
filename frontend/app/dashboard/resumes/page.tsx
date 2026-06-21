'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/src/shared/lib/supabase/client';
import { useResumesQuery } from '@/src/shared/hooks/useResumesQuery';

import { ResumesHeader } from './_components/ResumesHeader';
import { ResumesList } from './_components/ResumesList';
import { ResumesStats } from './_components/ResumesStats';

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
      <ResumesHeader />
      <ResumesStats resumes={resumes} />
      <ResumesList resumes={resumes} isLoading={resumesQuery.isLoading} />
    </div>
  );
}
