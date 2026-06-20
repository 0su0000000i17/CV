import crypto from "node:crypto";
import path from "node:path";

import { Router, type Request } from "express";
import multer from "multer";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/rtf",
  "text/rtf",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

function decodeFileName(fileName: string) {
  return Buffer.from(fileName, "latin1").toString("utf8");
}

function getFileExtension(fileName: string, mimeType: string) {
  const extensionFromName = path.extname(fileName).replace(".", "").toLowerCase();

  if (extensionFromName) {
    return extensionFromName;
  }

  switch (mimeType) {
    case "application/pdf":
      return "pdf";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    case "application/rtf":
    case "text/rtf":
      return "rtf";
    default:
      return "file";
  }
}

function createStorageFilePath(userId: string, fileName: string, mimeType: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const extension = getFileExtension(fileName, mimeType);
  const uniqueFileName = `resume-${crypto.randomUUID()}.${extension}`;

  return `${userId}/${year}/${month}/${uniqueFileName}`;
}

async function getUserFromRequest(req: Request) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return {
      user: null,
      errorMessage: "Auth token is required",
    };
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      errorMessage: "Unauthorized",
    };
  }

  return {
    user,
    errorMessage: null,
  };
}

router.get("/", async (req, res) => {
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
});

router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);
    const file = req.file;

    if (!user) {
      return res.status(401).json({ message: errorMessage });
    }

    if (!file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    const decodedFileName = decodeFileName(file.originalname);
    const filePath = createStorageFilePath(
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
});

router.delete("/:resumeId", async (req, res) => {
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
});

router.get("/:resumeId", async (req, res) => {
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
});



router.get("/:resumeId/download-url", async (req, res) => {
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
});

export { router as resumesRouter };