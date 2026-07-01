import { createHash } from "node:crypto";
import type { Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { parseSourceResumeDocument } from "../resume-document/parser/parse-source-resume-document.js";
import { sourceDocumentToEditableResume } from "../resume-editor/source-document-to-editable.js";
import { extractPhotoFromPdf } from "../resume-profile/extract-photo-from-pdf.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";
import { getUserFromRequest } from "../utils/auth.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { saveProductEvent } from "../utils/product-events.js";
import { allowedResumeMimeTypes, decodeFileName } from "../utils/resume-files.js";

const MAX_RESUMES_PER_USER = 10;

function createSourceFileHash(fileBuffer: Buffer) {
  return createHash("sha256").update(fileBuffer).digest("hex");
}

function createPhotoDataUrl(buffer: Buffer, contentType: string) {
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

async function countUserResumes(userId: string) {
  const { count, error } = await supabaseAdmin
    .from("resumes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
}

function sendResumeLimitError(res: Response) {
  return res.status(409).json({
    message: `Можно загрузить максимум ${MAX_RESUMES_PER_USER} резюме. Удалите одно из старых резюме, чтобы добавить новое.`,
    code: "RESUME_LIMIT_REACHED",
    limit: MAX_RESUMES_PER_USER,
  });
}

async function findDuplicateResume(params: { userId: string; sourceFileHash: string }) {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("id, title, file_name, file_size, created_at")
    .eq("user_id", params.userId)
    .eq("source_file_hash", params.sourceFileHash)
    .maybeSingle();
  if (error) throw error;
  return data as null | {
    id: string;
    title: string | null;
    file_name: string | null;
    file_size: number | null;
    created_at: string;
  };
}

function sendDuplicateResumeError(res: Response, duplicateResume: NonNullable<Awaited<ReturnType<typeof findDuplicateResume>>>) {
  return res.status(409).json({
    message: "Такое резюме уже загружено в вашем профиле.",
    code: "DUPLICATE_RESUME",
    duplicateResume: {
      id: duplicateResume.id,
      title: duplicateResume.title,
      fileName: duplicateResume.file_name,
      fileSize: duplicateResume.file_size,
      createdAt: duplicateResume.created_at,
    },
  });
}

export async function getResumes(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return sendError(res, 401, "Unauthorized");

    const { data, error } = await supabaseAdmin
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return sendServerError(res, "Failed to fetch resumes", error);
    return res.json({ resumes: data });
  } catch (error) {
    return sendServerError(res, "Unexpected resumes fetch error", error);
  }
}

export async function uploadResume(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const file = req.file;
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!file) return sendError(res, 400, "Resume file is required");
    if (!allowedResumeMimeTypes.includes(file.mimetype)) {
      return sendError(res, 400, "Unsupported file type");
    }

    const sourceFileHash = createSourceFileHash(file.buffer);
    const duplicateResume = await findDuplicateResume({ userId: user.id, sourceFileHash });
    if (duplicateResume) return sendDuplicateResumeError(res, duplicateResume);

    const existingResumeCount = await countUserResumes(user.id);
    if (existingResumeCount >= MAX_RESUMES_PER_USER) return sendResumeLimitError(res);

    const decodedFileName = decodeFileName(file.originalname);
    const extraction = await extractResumeMarkdown({
      fileBuffer: file.buffer,
      fileName: decodedFileName,
      filePath: decodedFileName,
      mimeType: file.mimetype,
    });
    const document = parseSourceResumeDocument(extraction.normalizedMarkdown);
    const photo = await extractPhotoFromPdf({ fileBuffer: file.buffer, mimeType: file.mimetype });
    const documentWithPhoto = photo
      ? {
          ...document,
          photo: {
            contentType: photo.contentType,
            dataUrl: createPhotoDataUrl(photo.buffer, photo.contentType),
            displayWidth: photo.displayWidth,
            displayHeight: photo.displayHeight,
          },
        }
      : document;
    const editable = sourceDocumentToEditableResume(documentWithPhoto);

    const { data, error } = await supabaseAdmin
      .from("resumes")
      .insert({
        user_id: user.id,
        title: editable.resumeJson.target.title || decodedFileName,
        role: editable.resumeJson.target.title,
        file_name: decodedFileName,
        file_path: null,
        file_type: file.mimetype,
        file_size: file.size,
        source_file_hash: sourceFileHash,
        extracted_text: extraction.normalizedMarkdown,
        source_resume_document: documentWithPhoto,
        editable_resume_json: editable.resumeJson,
        analysis_status: "idle",
      })
      .select()
      .single();

    if (error) return sendServerError(res, "Failed to save parsed resume", error);

    await saveProductEvent({
      userId: user.id,
      name: "resume_uploaded",
      targetType: "resume",
      targetId: data.id,
    });

    return res.status(201).json({ resume: data });
  } catch (error) {
    return sendServerError(res, "Unexpected upload error", error);
  }
}

export async function deleteResume(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("id, file_path")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (findError) return sendServerError(res, "Failed to find resume", findError);
    if (!resume) return sendError(res, 404, "Resume not found");

    if (resume.file_path) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("resumes")
        .remove([resume.file_path]);
      if (storageError) return sendServerError(res, "Failed to delete resume file", storageError);
    }

    const { error } = await supabaseAdmin
      .from("resumes")
      .delete()
      .eq("id", resumeId)
      .eq("user_id", user.id);
    if (error) return sendServerError(res, "Failed to delete resume", error);
    return res.json({ success: true });
  } catch (error) {
    return sendServerError(res, "Unexpected resume delete error", error);
  }
}

export async function getResumeById(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const { data, error } = await supabaseAdmin
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) return sendServerError(res, "Failed to fetch resume", error);
    if (!data) return sendError(res, 404, "Resume not found");
    return res.json({ resume: data });
  } catch (error) {
    return sendServerError(res, "Unexpected resume fetch error", error);
  }
}

export async function getResumeDownloadUrl(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("file_path")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (findError) return sendServerError(res, "Failed to find resume", findError);
    if (!resume) return sendError(res, 404, "Resume not found");
    if (!resume.file_path) return sendError(res, 404, "Original file is not stored for this resume");

    const { data, error } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(resume.file_path, 60);
    if (error) return sendServerError(res, "Failed to create download url", error);
    return res.json({ downloadUrl: data.signedUrl });
  } catch (error) {
    return sendServerError(res, "Unexpected download url error", error);
  }
}
