import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type AiDebugArtifactWriter = {
  artifactDir: string;
  reportPath: string;
  writeJson: (fileName: string, value: unknown) => Promise<void>;
  writeText: (fileName: string, value: string) => Promise<void>;
};

type CreateAiDebugArtifactWriterParams = {
  kind: "vacancy-fit" | "resume-adaptation" | "cover-letter";
  resumeId?: string;
  extra?: Record<string, unknown>;
};

type AiDebugReportEntry =
  | {
      type: "json";
      value: unknown;
    }
  | {
      type: "text";
      value: string;
    };

type AiDebugReport = {
  readme: string;
  context: Record<string, unknown>;
  artifacts: Record<string, AiDebugReportEntry>;
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

function createReadme(params: CreateAiDebugArtifactWriterParams) {
  return [
    "CVPro AI debug artifacts",
    "",
    `kind: ${params.kind}`,
    `createdAt: ${new Date().toISOString()}`,
    params.resumeId ? `resumeId: ${params.resumeId}` : null,
    "",
    "All debug artifacts are bundled into this single debug-report.json file.",
    "Use artifacts keys to inspect prompt -> raw AI -> parsed JSON -> normalized JSON -> final JSON pipeline.",
  ]
    .filter(Boolean)
    .join("\n");
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
  const reportPath = path.join(artifactDir, "debug-report.json");

  try {
    await mkdir(artifactDir, { recursive: true });
  } catch (error) {
    console.warn("[ai-debug] failed to create artifact dir", artifactDir, error);
    return null;
  }

  const context = {
    kind: params.kind,
    resumeId: params.resumeId || null,
    createdAt: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || null,
    ...params.extra,
  };

  const report: AiDebugReport = {
    readme: createReadme(params),
    context,
    artifacts: {},
  };

  async function flushReport() {
    await safeWrite(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  const writer: AiDebugArtifactWriter = {
    artifactDir,
    reportPath,
    async writeJson(fileName, value) {
      report.artifacts[fileName] = { type: "json", value };
      await flushReport();
    },
    async writeText(fileName, value) {
      report.artifacts[fileName] = {
        type: "text",
        value: value.endsWith("\n") ? value : `${value}\n`,
      };
      await flushReport();
    },
  };

  await flushReport();

  console.info(`[ai-debug] report: ${reportPath}`);

  return writer;
}
