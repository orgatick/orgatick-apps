export function parsePlatform(ua: string | null): string | null {
  if (!ua) return null;
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh|Mac OS X/i.test(ua)) return "macOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Linux/i.test(ua)) return "Linux";
  return "Web";
}

export function parseBrowser(ua: string | null): string | null {
  if (!ua) return null;
  if (/Edg/i.test(ua)) return "Edge";
  if (/Chrome/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua)) return "Safari";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Opera|OPR/i.test(ua)) return "Opera";
  return "Browser";
}

export function parseDeviceName(ua: string | null): string | null {
  if (!ua) return null;
  const browser = parseBrowser(ua) || "Browser";
  const platform = parsePlatform(ua);
  return platform ? `${browser} on ${platform}` : browser;
}
