import multer from "multer";

import { MAX_RESUME_FILE_SIZE } from "../utils/resumeFiles.js";

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RESUME_FILE_SIZE,
  },
});
