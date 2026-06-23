import type { NextFunction, Request, Response } from "express";
import multer from "multer";

import {
  allowedResumeMimeTypes,
  MAX_RESUME_FILE_SIZE,
} from "../utils/resume-files.js";

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RESUME_FILE_SIZE,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedResumeMimeTypes.includes(file.mimetype)) {
      callback(new Error("Unsupported file type"));
      return;
    }

    callback(null, true);
  },
});

export function handleResumeUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  resumeUpload.single("resume")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({
          message: "Resume file must be 10MB or smaller",
        });
        return;
      }

      res.status(400).json({
        message: error.message,
      });
      return;
    }

    if (error instanceof Error && error.message === "Unsupported file type") {
      res.status(400).json({
        message: "Unsupported file type",
      });
      return;
    }

    next(error);
  });
}