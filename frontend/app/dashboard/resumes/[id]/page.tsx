"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useResumeQuery } from "@/src/shared/hooks/useResumeQuery";
import { supabase } from "@/src/shared/lib/supabase/client";

import { ResumeActionsPanel } from "./_components/ResumeActionsPanel";
import { ResumeActivityCard } from "./_components/ResumeActivityCard";
import { ResumeDetailsHeader } from "./_components/ResumeDetailsHeader";
import { ResumeDetailsSkeleton } from "./_components/ResumeDetailsSkeleton";
import { ResumeFileInfoCard } from "./_components/ResumeFileInfoCard";
import { ResumeNotFoundState } from "./_components/ResumeNotFoundState";
import { ResumeStatsCards } from "./_components/ResumeStatsCards";
import { ResumeVersionsCard } from "./_components/ResumeVersionsCard";

export default function ResumeDetailsPage() {
  const params = useParams<{ id: string }>();
  const [accessToken, setAccessToken] = useState<string>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token);
    });
  }, []);

  const resumeQuery = useResumeQuery(params.id, accessToken);
  const resume = resumeQuery.data?.resume;

  if (resumeQuery.isLoading) {
    return <ResumeDetailsSkeleton />;
  }

  if (!resume) {
    return <ResumeNotFoundState />;
  }

  return (
    <div>
      <ResumeDetailsHeader resume={resume} />
      <ResumeStatsCards resume={resume} />

      <div className="mb-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ResumeActionsPanel resumeId={resume.id} />
        <ResumeFileInfoCard resume={resume} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ResumeVersionsCard resume={resume} />
        <ResumeActivityCard resume={resume} />
      </div>
    </div>
  );
}