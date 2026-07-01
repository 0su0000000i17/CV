import type { ResumeAdaptationResult } from './resume-adaptation';

export type UploadedResume = {
  id: string;
  user_id: string;
  title: string;
  role: string | null;
  file_name: string;
  file_path: string | null;
  file_type: string;
  file_size: number | null;
  source_file_hash: string | null;
  extracted_text: string | null;
  source_resume_document?: SourceResumeDocument | null;
  editable_resume_json?: ResumeAdaptationResult | null;
  analysis_status: string;
  last_score: number | null;
  created_at: string;
  updated_at: string;
};

export type SourceResumeDocument = Record<string, unknown>;

export type ResumePersonalProfile = {
  fullName: string | null;
  gender: string | null;
  age: string | null;
  birthDate: string | null;
  phone: string | null;
  email: string | null;
  preferredContactMethod: string | null;
  city: string | null;
  citizenship: string | null;
  workPermit: string | null;
  relocation: string | null;
  businessTrips: string | null;
  telegram?: string | null;
  links?: string[];
  targetTitle: string | null;
  salary: string | null;
  specializations: string[];
  employment: string | null;
  workFormat: string | null;
  travelTime: string | null;
};

export type ResumeProfileExtractionResponse = {
  status: 'completed';
  resumeId: string;
  source: 'hh_pdf' | 'generic_resume';
  profile: ResumePersonalProfile;
  document: SourceResumeDocument;
  photo: {
    contentType: string;
    dataUrl: string;
    displayWidth?: number | null;
    displayHeight?: number | null;
  } | null;
  stats: Record<string, unknown>;
};

export type ResumeTextContacts = {
  fullName: string;
  gender: string;
  age: string;
  birthDate: string;
  phone: string;
  email: string;
  city: string;
  citizenship: string;
  workPermit: string;
  relocation: string;
  businessTrips: string;
};

export type ResumeTextResponse = {
  status: 'ok';
  resumeId: string;
  source: 'saved_json' | 'saved_edit' | 'original_file';
  markdown: string;
  resumeJson: ResumeAdaptationResult | null;
  contacts?: ResumeTextContacts | null;
  document?: SourceResumeDocument;
  stats: unknown | null;
  extractor?: {
    mode: 'source_document' | 'saved_json';
    provider: string | null;
    model: string | null;
  };
};

export type DuplicateResume = {
  id: string;
  title: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
};

export type UploadResumeDuplicateError = {
  message: string;
  code: 'DUPLICATE_RESUME';
  duplicateResume?: DuplicateResume;
};
