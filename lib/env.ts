export function getApiBaseUrl(): string {
  const url = process.env.WORKLOGGER_API_URL ?? "http://127.0.0.1:3000";
  return url.replace(/\/$/, "");
}
