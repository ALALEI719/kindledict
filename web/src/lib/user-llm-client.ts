"use client";

import { getLlmPreset, type LlmPresetId } from "@/lib/llm-presets";
import type { ClientLlmConfig } from "@/lib/types";

const STORAGE_KEY = "kindledict.user-llm.v1";

export interface StoredUserLlmSettings {
  presetId: LlmPresetId;
  apiKey: string;
  model: string;
  baseUrl: string;
}

export function loadStoredUserLlmSettings(): StoredUserLlmSettings | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUserLlmSettings;
    if (!parsed.apiKey?.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredUserLlmSettings(settings: StoredUserLlmSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function clearStoredUserLlmSettings(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function settingsToClientLlmConfig(
  settings: StoredUserLlmSettings,
): ClientLlmConfig {
  const preset = getLlmPreset(settings.presetId);
  return {
    presetId: settings.presetId,
    provider: preset.provider,
    apiKey: settings.apiKey.trim(),
    model: settings.model.trim() || preset.model,
    baseUrl: settings.baseUrl.trim() || preset.baseUrl || undefined,
  };
}

export function createDefaultSettings(
  presetId: LlmPresetId = "google",
): StoredUserLlmSettings {
  const preset = getLlmPreset(presetId);
  return {
    presetId,
    apiKey: "",
    model: preset.model,
    baseUrl: preset.baseUrl,
  };
}

export function isStoredSettingsConfigured(
  settings: StoredUserLlmSettings,
): boolean {
  return settings.apiKey.trim().length >= 8;
}
