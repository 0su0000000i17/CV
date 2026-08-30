import type { ClarifyingAnswer, ClarifyingQuestion } from './resume-improvement-questions';
import type { ResumeVacancyFitResult } from './resume-vacancy-fit';
import type { NormalizedVacancy } from './vacancies';
import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type AdaptationQuestionsSession = {
  id: string;
  resume_id: string;
  questions: ClarifyingQuestion[];
  answers: ClarifyingAnswer[] | null;
  skipped: boolean;
};

type AdaptationQuestionsResponse = {
  status: 'ok';
  // null when the resume already covers the vacancy - no gaps to ask about.
  session: AdaptationQuestionsSession | null;
  balance?: number;
};

export async function generateAdaptationQuestions(params: {
  resumeId: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  accessToken: string;
}): Promise<AdaptationQuestionsResponse> {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${params.resumeId}/adaptation-questions`,
    {
      method: 'POST',
      headers: {
        ...createAuthHeaders(params.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vacancy: params.vacancy,
        vacancyText: params.vacancyText,
        fit: params.fit,
      }),
    }
  );

  return parseApiResponse<AdaptationQuestionsResponse>(
    response,
    'Failed to generate adaptation questions'
  );
}

export async function submitAdaptationAnswers(params: {
  resumeId: string;
  sessionId: string;
  accessToken: string;
  answers?: ClarifyingAnswer[];
  skipped?: boolean;
}): Promise<{ status: 'ok'; session: AdaptationQuestionsSession }> {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${params.resumeId}/adaptation-questions/${params.sessionId}`,
    {
      method: 'PATCH',
      headers: {
        ...createAuthHeaders(params.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers: params.answers, skipped: params.skipped }),
    }
  );

  return parseApiResponse(response, 'Failed to save adaptation answers');
}
