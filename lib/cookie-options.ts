/**
 * Whether auth cookies should use the Secure flag.
 * Browsers reject Secure cookies on plain HTTP — including LAN IPs like 192.168.x.x.
 * localhost/127.0.0.1 often still work because browsers treat them as special cases.
 */
export function shouldUseSecureCookies(): boolean {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;

  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  return appUrl.startsWith("https://");
}
