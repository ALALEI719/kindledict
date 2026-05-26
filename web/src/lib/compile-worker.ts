import type { DictionaryFiles } from "./types";

export interface CompileWorkerResult {
  buffer: ArrayBuffer;
  filename: string;
}

export function hasCompileWorker(): boolean {
  return Boolean(process.env.COMPILE_WORKER_URL?.trim());
}

export async function compileWithWorker(
  files: DictionaryFiles | Record<string, string>,
  filename = "kindledict-dictionary.mobi",
): Promise<CompileWorkerResult | null> {
  const workerUrl = process.env.COMPILE_WORKER_URL?.replace(/\/$/, "");
  const workerSecret = process.env.COMPILE_WORKER_SECRET;

  if (!workerUrl) return null;

  const response = await fetch(`${workerUrl}/compile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(workerSecret ? { Authorization: `Bearer ${workerSecret}` } : {}),
    },
    body: JSON.stringify({ files }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Compile worker failed: ${detail.slice(0, 200)}`);
  }

  return {
    buffer: await response.arrayBuffer(),
    filename,
  };
}
