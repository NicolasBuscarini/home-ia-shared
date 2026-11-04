export const SHELL_DEEP_LINK_KEYS = ['module', 'view'] as const;

export type DeepLinkParams = Record<string, string | undefined | null>;

export interface DeepLinkLocation {
  origin: string;
  pathname: string;
}

const shellKeys = new Set<string>(SHELL_DEEP_LINK_KEYS);

/**
 * Reads the link contract shared by every Home IA product:
 * `?module=<moduleId>&view=<viewId>&<moduleParam>=<value>`.
 * Unknown and module-scoped keys are preserved so a module can own its own selection.
 */
export function parseDeepLink(search: string): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(search)) {
    if (!key || value === '' || key in parsed) continue;
    parsed[key] = value;
  }
  return parsed;
}

export function serializeDeepLink(params: DeepLinkParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!key || value === undefined || value === null || value === '') continue;
    search.append(key, value);
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : '';
}

export function buildDeepLink(location: DeepLinkLocation, params: DeepLinkParams): string {
  return `${location.origin}${location.pathname}${serializeDeepLink(params)}`;
}

/** Params owned by the active module, without the shell-owned module/view keys. */
export function moduleDeepLinkParams(params: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(params).filter(([key]) => !shellKeys.has(key)));
}

export function withDeepLinkParam(
  params: Record<string, string>,
  key: string,
  value: string | undefined,
): Record<string, string> {
  const next = { ...params };
  if (value) next[key] = value;
  else delete next[key];
  return next;
}
