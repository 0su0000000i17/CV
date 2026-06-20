import type { Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { getUserFromRequest } from "../utils/auth.js";
import {
  allowedResumeMimeTypes,
  createResumeStorageFilePath,
  decodeFileName,
} from "../utils/resumeFiles.js";

export async function getResumes(req: Request, res: Response) {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ message: errorMessage });
    }

    const { data, error } = await supabaseAdmin
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.json({
      resumes: data,
    });
  } catch {
    return res.status(500).json({
      message: "Unexpected resumes fetch error",
    });
  }
}

export async function uploadResume(req: Request, res: Response) {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);
    const file = req.file;

    if (!user) {
      return res.status(401).json({ message: errorMessage });
    }

    if (!file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    if (!allowedResumeMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: "Unsupported file type" });
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
      return res.status(500).json({ message: uploadError.message });
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
      await supabaseAdmin.storage.from("resumes").remove([filePath]);

      return res.status(500).json({ message: insertError.message });
    }

    return res.status(201).json({
      resume: data,
    });
  } catch {
    return res.status(500).json({
      message: "Unexpected upload error",
    });
  }
}

export async function deleteResume(req: Request, res: Response) {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);
    const { resumeId } = req.params;

    if (!user) {
      return res.status(401).json({ message: errorMessage });
    }

    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("id, file_path")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (findError || !resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from("resumes")
      .remove([resume.file_path]);

    if (storageError) {
      return res.status(500).json({ message: storageError.message });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("resumes")
      .delete()
      .eq("id", resumeId)
      .eq("user_id", user.id);

    if (deleteError) {
      return res.status(500).json({ message: deleteError.message });
    }

    return res.json({
      success: true,
    });
  } catch {
    return res.status(500).json({
      message: "Unexpected resume delete error",
    });
  }
}

export async function getResumeById(req: Request, res: Response) {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);
    const { resumeId } = req.params;

    if (!user) {
      return res.status(401).json({ message: errorMessage });
    }

    const { data, error } = await supabaseAdmin
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.json({
      resume: data,
    });
  } catch {
    return res.status(500).json({
      message: "Unexpected resume fetch error",
    });
  }
}

export async function getResumeDownloadUrl(req: Request, res: Response) {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);
    const { resumeId } = req.params;

    if (!user) {
      return res.status(401).json({
        message: errorMessage,
      });
    }

    const { data: resume, error: findError } = await supabaseAdmin
      .from("resumes")
      .select("file_path")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (findError || !resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    const { data, error } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(resume.file_path, 60);

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    return res.json({
      downloadUrl: data.signedUrl,
    });
  } catch {
    return res.status(500).json({
      message: "Unexpected download url error",
    });
  }
}
