import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

type ClarifyingQuestionOption = {
  key: string;
  label: string;
  custom?: boolean;
  confirmsRequirement?: boolean;
};

export type ClarifyingQuestion = {
  id: string;
  question: string;
  targetArea: string;
  requirement?: string;
  kind?: 'experience' | 'knowledge' | 'profile';
  purpose?: 'gap' | 'evidence' | 'positioning';
  topic?:
    | 'positioning'
    | 'achievement'
    | 'metrics'
    | 'hard_skill'
    | 'soft_skill'
    | 'collaboration'
    | 'leadership'
    | 'development';
  // Several options can be true at once - the card renders checkboxes and
  // submits optionKeys instead of a single optionKey.
  multiple?: boolean;
  options: ClarifyingQuestionOption[];
};

export type ClarifyingAnswer = {
  questionId: string;
  optionKey?: string;
  optionKeys?: string[];
  customText?: string;
};

const refusalOptionPattern =
  /^(?:нет(?=$|[\s,.:;])|ни\s+один|не\s+(?:было|бывало|случалось|приходилось|делал|делала|готов|готова|использовал|использовала|работал|работала)(?=$|[^а-яё]))/iu;

export function isRefusalClarifyingOptionLabel(value: string) {
  return refusalOptionPattern.test(value.trim());
}

export type ImprovementQuestionsSession = {
  id: string;
  resume_id: string;
  questions: ClarifyingQuestion[];
  answers: ClarifyingAnswer[] | null;
  skipped: boolean;
};

type ImprovementQuestionsResponse = {
  status: 'ok';
  session: ImprovementQuestionsSession | null;
  cacheHit: boolean;
  balance?: number;
};

export async function generateImprovementQuestions(params: {
  resumeId: string;
  accessToken: string;
}): Promise<ImprovementQuestionsResponse> {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${params.resumeId}/improvement-questions`,
    {
      method: 'POST',
      headers: {
        ...createAuthHeaders(params.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  );

  return parseApiResponse<ImprovementQuestionsResponse>(
    response,
    'Failed to generate clarifying questions'
  );
}

export async function submitImprovementAnswers(params: {
  resumeId: string;
  sessionId: string;
  accessToken: string;
  answers?: ClarifyingAnswer[];
  skipped?: boolean;
}): Promise<{ status: 'ok'; session: ImprovementQuestionsSession }> {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${params.resumeId}/improvement-questions/${params.sessionId}`,
    {
      method: 'PATCH',
      headers: {
        ...createAuthHeaders(params.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers: params.answers,
        skipped: params.skipped,
      }),
    }
  );

  return parseApiResponse(response, 'Failed to save answers');
}
