export function safeInternalPath(value, fallback = "/dashboard") {
  const candidate = String(value || "").trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\") || candidate.length > 400)
    return fallback;
  return candidate;
}
