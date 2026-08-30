export type EditableResumeRecord = {
  id: string;
  file_name: string;
  file_path: string | null;
  file_type: string;
  extracted_text: string | null;
  editable_resume_json: unknown | null;
  source_resume_document: unknown | null;
};
