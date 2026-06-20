import type { Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { getUserFromRequest } from "../utils/auth.js";
import {
  sendError,
  sendServerError,
  isValidUuid,
} from "../utils/apiResponses.js";
import {
  allowedResumeMimeTypes,
  createResumeStorageFilePath,
  decodeFileName,
} from "../utils/resumeFiles.js";

export async function getResumes(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { data, error } = await supabaseAdmin
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return sendServerError(res, "Failed to fetch resumes", error);
    }

    return res.json({
      resumes: data,
    });
  } catch (error) {
    return sendServerError(res, "Unexpected resumes fetch error", error);
  }
}

export async function uploadResume(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const file = req.file;

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!file) {
      return sendError(res, 400, "Resume file is required");
    }

    if (!allowedResumeMimeTypes.includes(file.mimetype)) {
      return sendError(res, 400, "Unsupported file type");
    }

    const decodedFileName = decodeFileName(file.originalname);
    const filePath = createResumeStorageFilePath(
      user.id,
      decodedFileName,
      file.mimetype
    );

    const { error: uploadError } = await supabaseAdmin.storage
      .from("resumes")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      return sendServerError(res, "Failed to upload resume file", uploadError);
    }

    const { data, error: insertError } = await supabaseAdmin
      .from("resumes")
      .insert({
        user_id: user.id,
        title: decodedFileName,
        file_name: decodedFileName,
        file_path: filePath,
        file_type: file.mimetype,
        file_size: file.size,
      })
      .select()
      .single();

    if (insertError) {
      const { error: cleanupError } = await supabaseAdmin.storage
        .from("resumes")
        .remove([filePath]);

      if (cleanupError) {
        console.error(cleanupError);
      }

      return sendServerError(res, "Failed to save resume", insertError);
    }

    return res.status(201).json({
      resume: data,
    });
  } catch (error) {
    return sendServerError(res, "Unexpected upload error", error);
  }
}

export async function deleteResume(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const { resumeId } = req.params;

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!isValidUuid(resumeId)) {
      return sendError(res, 400, "Invalid resume id");
    }

    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("id, file_path")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (findError) {
      return sendServerError(res, "Failed to find resume", findError);
    }

    if (!resume) {
      return sendError(res, 404, "Resume not found");
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from("resumes")
      .remove([resume.file_path]);

    if (storageError) {
      return sendServerError(res, "Failed to delete resume file", storageError);
    }

    const { error: deleteError } = await supabaseAdmin
      .from("resumes")
      .delete()
      .eq("id", resumeId)
      .eq("user_id", user.id);

    if (deleteError) {
      return sendServerError(res, "Failed to delete resume", deleteError);
    }

    return res.json({
      success: true,
    });
  } catch (error) {
    return sendServerError(res, "Unexpected resume delete error", error);
  }
}

export async function getResumeById(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const { resumeId } = req.params;

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!isValidUuid(resumeId)) {
      return sendError(res, 400, "Invalid resume id");
    }

    const { data, error } = await supabaseAdmin
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return sendServerError(res, "Failed to fetch resume", error);
    }

    if (!data) {
      return sendError(res, 404, "Resume not found");
    }

    return res.json({
      resume: data,
    });
  } catch (error) {
    return sendServerError(res, "Unexpected resume fetch error", error);
  }
}

export async function getResumeDownloadUrl(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const { resumeId } = req.params;

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!isValidUuid(resumeId)) {
      return sendError(res, 400, "Invalid resume id");
    }

    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("file_path")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (findError) {
      return sendServerError(res, "Failed to find resume", findError);
    }

    if (!resume) {
      return sendError(res, 404, "Resume not found");
    }

    const { data, error } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(resume.file_path, 60);

    if (error) {
      return sendServerError(res, "Failed to create download url", error);
    }

    return res.json({
      downloadUrl: data.signedUrl,
    });
  } catch (error) {
    return sendServerError(res, "Unexpected download url error", error);
  }
}