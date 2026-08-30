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

export async function createAiDebugArtifactWriter(
  _params: CreateAiDebugArtifactWriterParams
): Promise<AiDebugArtifactWriter | null> {
  return null;
}
