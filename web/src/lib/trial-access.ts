import { createHmac } from "node:crypto";

const TRIAL_COOKIE_NAME = "kindledict_trial_v1";
const TRIAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface TrialState {
  v: 1;
  freeChapterUsed: boolean;
}

export interface TrialAccessState {
  freeChapterRemaining: boolean;
  paid: boolean;
  sampleAllowed: boolean;
}

function cookieSecret(): string {
  return (
    process.env.KINDLE_DICT_TRIAL_SECRET ||
    process.env.COMPILE_WORKER_SECRET ||
    "kindledict-dev-trial-secret"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", cookieSecret()).update(payload).digest("base64url");
}

function serialize(state: TrialState): string {
  const payload = Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function parseCookieHeader(cookieHeader: string | null | undefined): Record<string, string> {
  if (!cookieHeader) return {};

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const index = chunk.indexOf("=");
        return index >= 0
          ? [chunk.slice(0, index), chunk.slice(index + 1)]
          : [chunk, ""];
      }),
  );
}

function parseState(cookieValue: string | undefined): TrialState {
  if (!cookieValue) return { v: 1, freeChapterUsed: false };

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature || sign(payload) !== signature) {
    return { v: 1, freeChapterUsed: false };
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as TrialState;
    if (parsed?.v !== 1) return { v: 1, freeChapterUsed: false };
    return {
      v: 1,
      freeChapterUsed: Boolean(parsed.freeChapterUsed),
    };
  } catch {
    return { v: 1, freeChapterUsed: false };
  }
}

export function getTrialStateFromCookieHeader(cookieHeader: string | null | undefined): TrialAccessState {
  const cookies = parseCookieHeader(cookieHeader);
  const state = parseState(cookies[TRIAL_COOKIE_NAME]);

  return {
    freeChapterRemaining: !state.freeChapterUsed,
    paid: false,
    sampleAllowed: true,
  };
}

export function mergeAccessState(
  trial: TrialAccessState,
  account: { paid: boolean } | null | undefined,
): TrialAccessState {
  if (!account?.paid) return trial;

  return {
    ...trial,
    paid: true,
    sampleAllowed: true,
  };
}

export function createTrialCookieValue(freeChapterUsed: boolean): string {
  return serialize({ v: 1, freeChapterUsed });
}

export function getTrialCookieName(): string {
  return TRIAL_COOKIE_NAME;
}

export function getTrialCookieMaxAge(): number {
  return TRIAL_COOKIE_MAX_AGE;
}
