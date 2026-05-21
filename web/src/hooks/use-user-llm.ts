"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getLlmPreset, LLM_PRESETS, type LlmPresetId } from "@/lib/llm-presets";
import type { ClientLlmConfig } from "@/lib/types";
import {
  createDefaultSettings,
  isStoredSettingsConfigured,
  loadStoredUserLlmSettings,
  saveStoredUserLlmSettings,
  settingsToClientLlmConfig,
  type StoredUserLlmSettings,
} from "@/lib/user-llm-client";

export function useUserLlm() {
  const [settings, setSettings] = useState<StoredUserLlmSettings>(() =>
    createDefaultSettings(),
  );
  const [loaded, setLoaded] = useState(false);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    const stored = loadStoredUserLlmSettings();
    if (stored) setSettings(stored);
    setLoaded(true);
  }, []);

  const preset = useMemo(
    () => getLlmPreset(settings.presetId),
    [settings.presetId],
  );

  const clientConfig = useMemo<ClientLlmConfig | null>(() => {
    if (!isStoredSettingsConfigured(settings)) return null;
    return settingsToClientLlmConfig(settings);
  }, [settings]);

  const isConfigured = Boolean(clientConfig);

  const updateSettings = useCallback(
    (patch: Partial<StoredUserLlmSettings>) => {
      setSettings((current) => {
        const next = { ...current, ...patch };
        if (patch.presetId && patch.presetId !== current.presetId) {
          const nextPreset = getLlmPreset(patch.presetId);
          next.model = nextPreset.model;
          next.baseUrl = nextPreset.baseUrl;
        }
        return next;
      });
      setTestStatus("idle");
      setTestMessage("");
    },
    [],
  );

  const saveSettings = useCallback(() => {
    saveStoredUserLlmSettings(settings);
  }, [settings]);

  const testSettings = useCallback(async () => {
    if (!isStoredSettingsConfigured(settings)) {
      setTestStatus("error");
      setTestMessage("Enter your API key first.");
      return false;
    }

    setTestStatus("testing");
    setTestMessage("Testing connection…");

    try {
      const response = await fetch("/api/llm-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          llm: settingsToClientLlmConfig(settings),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Connection test failed.");
      }

      saveStoredUserLlmSettings(settings);
      setTestStatus("success");
      setTestMessage(`Connected via ${data.provider} · ${data.model}`);
      return true;
    } catch (error) {
      setTestStatus("error");
      setTestMessage(
        error instanceof Error ? error.message : "Connection test failed.",
      );
      return false;
    }
  }, [settings]);

  return {
    loaded,
    settings,
    preset,
    presets: LLM_PRESETS,
    clientConfig,
    isConfigured,
    testStatus,
    testMessage,
    updateSettings,
    saveSettings,
    testSettings,
    setPresetId: (presetId: LlmPresetId) => updateSettings({ presetId }),
  };
}
