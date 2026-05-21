import type { GenerationScopeId } from "@/lib/generation-scope";
import type { Locale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";

export function getLocalizedGenerationScopes(locale: Locale) {
  const scopes = getMessages(locale).builder.scopes;
  return (Object.keys(scopes) as GenerationScopeId[]).map((id) => ({
    id,
    ...scopes[id],
  }));
}
