import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type AiDebugArtifactWriter = {
  artifactDir: string;
  writeJson: (fileName: string, value: unknown) => Promise<void>;
  writeText: (fileName: string, value: string) => Promise<void>;
};

type CreateAiDebugArtifactWriterParams = {
  kind: "vacancy-fit" | "resume-adaptation" | "cover-letter";
  resumeId?: string;
  extra?: Record<string, unknown>;
};

function isDebugEnabled() {
  if (process.env.CVPRO_AI_DEBUG === "0") {
    return false;
  }

  return process.env.CVPRO_AI_DEBUG === "1" || process.env.NODE_ENV !== "production";
}

function createSafeFileNamePart(value: string) {
  return value.replace(/[^a-zа-яё0-9_-]+/giu, "-").replace(/-+/g, "-").slice(0, 80);
}

function getBaseDir() {
  return process.env.CVPRO_AI_DEBUG_DIR || path.resolve(process.cwd(), "tmp", "ai-debug");
}

async function safeWrite(filePath: string, value: string) {
  try {
    await writeFile(filePath, value, "utf-8");
  } catch (error) {
    console.warn("[ai-debug] failed to write artifact", filePath, error);
  }
}

export async function createAiDebugArtifactWriter(
  params: CreateAiDebugArtifactWriterParams
): Promise<AiDebugArtifactWriter | null> {
  if (!isDebugEnabled()) {
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resumePart = params.resumeId ? `-${createSafeFileNamePart(params.resumeId)}` : "";
  const runId = `${timestamp}-${params.kind}${resumePart}-${randomUUID().slice(0, 8)}`;
  const artifactDir = path.join(getBaseDir(), params.kind, runId);

  try {
    await mkdir(artifactDir, { recursive: true });
  } catch (error) {
    console.warn("[ai-debug] failed to create artifact dir", artifactDir, error);
    return null;
  }

  const writer: AiDebugArtifactWriter = {
    artifactDir,
    async writeJson(fileName, value) {
      await safeWrite(
        path.join(artifactDir, fileName),
        `${JSON.stringify(value, null, 2)}\n`
      );
    },
    async writeText(fileName, value) {
      await safeWrite(path.join(artifactDir, fileName), value.endsWith("\n") ? value : `${value}\n`);
    },
  };

  await writer.writeText(
    "README.txt",
    [
      "CVPro AI debug artifacts",
      "",
      `kind: ${params.kind}`,
      `createdAt: ${new Date().toISOString()}`,
      params.resumeId ? `resumeId: ${params.resumeId}` : null,
      "",
      "Files are generated only in local/dev mode or when CVPRO_AI_DEBUG=1.",
      "This folder is for debugging prompt -> raw AI -> normalized JSON -> final JSON pipeline.",
    ]
      .filter(Boolean)
      .join("\n")
  );

  await writer.writeJson("00-context.json", {
    kind: params.kind,
    resumeId: params.resumeId || null,
    createdAt: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || null,
    ...params.extra,
  });

  console.info(`[ai-debug] artifacts: ${artifactDir}`);

  return writer;
}
