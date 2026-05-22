export function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

export function getAllowedOrigins() {
  const configured = getOptionalEnv("ALLOWED_ORIGIN")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set(["https://www.prntd.ca", "https://prntd.ca", ...configured]));
}
