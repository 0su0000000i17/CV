import type { Request, Response } from "express";

import { analyzeResume } from "../ai/services/analyzeResume.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { extractResumeMarkdown } from "../resume-processing/extractResumeMarkdown.js";
import {
  getStringParam,
  sendError,
  sendServerError,
} from "../utils/apiResponses.js";
import { getUserFromRequest } from "../utils/auth.js";

type ResumeAnalysisRow = {
  id: string;
  resume_id: string;
  user_id: string;
  score: number;
  analysis: unknown;
  raw_ai_analysis: unknown;
  diagnostics: unknown;
  provider: string | null;
  model: string | null;
  rubric_version: string;
  markdown_chars: number;
  markdown_limited: boolean;
  created_at: string;
};

const RESUME_ANALYSIS_SELECT =
  "id, resume_id, user_id, score, analysis, raw_ai_analysis, diagnostics, provider, model, rubric_version, markdown_chars, markdown_limited, created_at" as const;

async function setResumeAnalysisStatus(
  userId: string,
  resumeId: string,
  status: "idle" | "analyzing" | "completed" | "failed"
) {
  const { error } = await supabaseAdmin
    .from("resumes")
    .update({
      analysis_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resumeId)
    .eq("user_id", userId);

  if (error) {
    console.error("[resumeAnalysis] Failed to update analysis status", error);
  }
}

function mapAnalysisRow(row: ResumeAnalysisRow) {
  return {
    resumeId: row.resume_id,
    analysis: row.analysis,
    analysisRecord: {
      id: row.id,
      score: row.score,
      createdAt: row.created_at,
      rubricVersion: row.rubric_version,
    },
    meta: {
      provider: row.provider,
      model: row.model,
      markdownChars: row.markdown_chars,
      markdownLimited: row.markdown_limited,
      diagnostics: row.diagnostics,
    },
  };
}

export async function getLatestResumeAnalysis(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!resumeId) {
      return sendError(res, 400, "Invalid resume id");
    }

    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (findError) {
      return sendServerError(res, "Failed to find resume", findError);
    }

    if (!resume) {
      return sendError(res, 404, "Resume not found");
    }

    const { data: latestAnalysisData, error: analysisError } =
      await supabaseAdmin
        .from("resume_analyses")
        .select(RESUME_ANALYSIS_SELECT)
        .eq("resume_id", resumeId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (analysisError) {
      return sendServerError(
        res,
        "Failed to fetch latest resume analysis",
        analysisError
      );
    }

    if (!latestAnalysisData) {
      return res.json({
        resumeId,
        analysis: null,
        analysisRecord: null,
        meta: null,
      });
    }

    return res.json(
      mapAnalysisRow(latestAnalysisData as unknown as ResumeAnalysisRow)
    );
  } catch (error) {
    return sendServerError(res, "Unexpected latest analysis fetch error", error);
  }
}

export async function analyzeResumePreview(req: Request, res: Response) {
  let currentUserId: string | null = null;
  let currentResumeId: string | null = null;

  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!resumeId) {
      return sendError(res, 400, "Invalid resume id");
    }

    currentUserId = user.id;
    currentResumeId = resumeId;

    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("id, file_name, file_path, file_type, file_size")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (findError) {
      return sendServerError(res, "Failed to find resume", findError);
    }

    if (!resume) {
      return sendError(res, 404, "Resume not found");
    }

    await setResumeAnalysisStatus(user.id, resume.id, "analyzing");

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("resumes")
      .download(resume.file_path);

    if (downloadError) {
      await setResumeAnalysisStatus(user.id, resume.id, "failed");

      return sendServerError(
        res,
        "Failed to download resume file",
        downloadError
      );
    }

    const fileBuffer = Buffer.from(await fileData.arrayBuffer());

    const extraction = await extractResumeMarkdown({
      fileBuffer,
      fileName: resume.file_name,
      filePath: resume.file_path,
      mimeType: resume.file_type,
    });

    const aiResult = await analyzeResume({
      resumeMarkdown: extraction.markdown,
    });

    const { data: savedAnalysisData, error: saveAnalysisError } =
      await supabaseAdmin
        .from("resume_analyses")
  .insert({
  resume_id: resume.id,
  user_id: user.id,
  score: aiResult.analysis.score,
  overall_score: aiResult.analysis.score,
  analysis: aiResult.analysis,
  raw_ai_analysis: aiResult.rawAiAnalysis,
  diagnostics: aiResult.diagnostics,
  provider: aiResult.provider,
  model: aiResult.model,
  rubric_version: "backend-v1",
  markdown_chars: extraction.stats.returnedChars,
  markdown_limited: extraction.stats.limited,
})
        .select(RESUME_ANALYSIS_SELECT)
        .single();

    if (saveAnalysisError) {
      await setResumeAnalysisStatus(user.id, resume.id, "failed");

      return sendServerError(
        res,
        "Failed to save resume analysis",
        saveAnalysisError
      );
    }

    const analyzedAt = new Date().toISOString();

    const { error: updateResumeError } = await supabaseAdmin
      .from("resumes")
      .update({
        analysis_status: "completed",
        last_score: aiResult.analysis.score,
        role: aiResult.analysis.targetRole || null,
        analyzed_at: analyzedAt,
        updated_at: analyzedAt,
      })
      .eq("id", resume.id)
      .eq("user_id", user.id);

    if (updateResumeError) {
      console.error(
        "[resumeAnalysis] Failed to update resume analysis metadata",
        updateResumeError
      );
    }

    return res.json(
      mapAnalysisRow(savedAnalysisData as unknown as ResumeAnalysisRow)
    );
  } catch (error) {
    if (currentUserId && currentResumeId) {
      await setResumeAnalysisStatus(currentUserId, currentResumeId, "failed");
    }

    return sendServerError(res, "Failed to analyze resume", error);
  }
}