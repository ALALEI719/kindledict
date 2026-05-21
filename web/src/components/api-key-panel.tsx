"use client";

import type { LlmPreset, LlmPresetId } from "@/lib/llm-presets";
import type { StoredUserLlmSettings } from "@/lib/user-llm-client";

interface ApiKeyPanelProps {
  byokRequired: boolean;
  settings: StoredUserLlmSettings;
  preset: LlmPreset;
  presets: LlmPreset[];
  isConfigured: boolean;
  testStatus: "idle" | "testing" | "success" | "error";
  testMessage: string;
  open: boolean;
  highlighted: boolean;
  onOpenChange: (open: boolean) => void;
  onPresetChange: (presetId: LlmPresetId) => void;
  onSettingsChange: (patch: Partial<StoredUserLlmSettings>) => void;
  onTest: () => void;
}

export function ApiKeyPanel({
  byokRequired,
  settings,
  preset,
  presets,
  isConfigured,
  testStatus,
  testMessage,
  open,
  highlighted,
  onOpenChange,
  onPresetChange,
  onSettingsChange,
  onTest,
}: ApiKeyPanelProps) {
  const showCustomFields =
    settings.presetId === "custom" || settings.presetId === "openrouter";

  return (
    <div
      className={`builder-api-compact${highlighted ? " builder-api-compact-highlight" : ""}`}
    >
      <button
        type="button"
        className="builder-api-toggle"
        onClick={() => onOpenChange(!open)}
      >
        <span className="builder-api-toggle-label">AI provider & API key</span>
        <span className="builder-api-toggle-meta">
          {preset.label}
          {isConfigured ? " · verified" : byokRequired ? " · required" : ""}
        </span>
        <span className="builder-api-toggle-icon">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="builder-api-body">
          <p className="builder-hint">
            Your key is stored only in this browser and is sent to your AI
            provider when you generate a dictionary.
            {preset.keyUrl ? (
              <>
                {" "}
                <a
                  href={preset.keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get API key
                </a>
              </>
            ) : null}
          </p>

          <div className="builder-grid builder-grid-tight">
            <label className="builder-field">
              <span>Provider</span>
              <select
                value={settings.presetId}
                onChange={(event) =>
                  onPresetChange(event.target.value as LlmPresetId)
                }
              >
                {presets.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="builder-field">
              <span>Model</span>
              <input
                value={settings.model}
                onChange={(event) =>
                  onSettingsChange({ model: event.target.value })
                }
                placeholder={preset.model || "model-name"}
              />
            </label>
          </div>

          {showCustomFields && (
            <label className="builder-field">
              <span>Base URL</span>
              <input
                value={settings.baseUrl}
                onChange={(event) =>
                  onSettingsChange({ baseUrl: event.target.value })
                }
                placeholder="https://api.example.com/v1"
              />
            </label>
          )}

          <div className="builder-api-key-row">
            <label className="builder-field builder-field-grow">
              <span>API key</span>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(event) =>
                  onSettingsChange({ apiKey: event.target.value })
                }
                placeholder={preset.keyHint}
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              className="btn btn-secondary builder-api-test-btn"
              onClick={onTest}
            >
              {testStatus === "testing" ? "Verifying…" : "Verify & save"}
            </button>
          </div>

          <p className="builder-hint">
            Verify &amp; save runs a tiny test request to confirm your key works,
            then saves it locally. Complete this step before generating to avoid
            wasting tokens.
          </p>

          {testMessage && (
            <p
              className={`builder-api-inline-msg ${
                testStatus === "success"
                  ? "ok"
                  : testStatus === "error"
                    ? "err"
                    : ""
              }`}
            >
              {testMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
