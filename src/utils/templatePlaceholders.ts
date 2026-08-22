export interface TemplatePlaceholderValues {
  CLIENTNAME?: string;
  BUSINESSNAME?: string;
  DUEDATE?: string;
  SERVICETYPE?: string;
  YOURFIRMNAME?: string;
  YOURCONTACTNUMBER?: string;
}

/**
 * Replaces [PLACEHOLDER] and {{placeholder}} tokens in a template string
 * with real values. Falls back to the literal [KEY] token if no value given,
 * so missing data is visible rather than silently blank.
 */
export function replaceTemplatePlaceholders(
  text: string,
  values: TemplatePlaceholderValues,
): string {
  if (!text) return "";

  let result = text;
  Object.entries(values).forEach(([key, value]) => {
    const safeValue = value || `[${key}]`;
    result = result
      .replace(new RegExp(`\\[${key}\\]`, "gi"), safeValue)
      .replace(new RegExp(`{{\\s*${key}\\s*}}`, "gi"), safeValue);
  });
  return result;
}