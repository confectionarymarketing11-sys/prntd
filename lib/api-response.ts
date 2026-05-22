import { ZodError } from "zod";
import { corsHeaders } from "@/lib/cors";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
    public code = "api_error"
  ) {
    super(message);
  }
}

export function apiJson<T>(request: Request, body: T, status = 200) {
  return Response.json(body, {
    status,
    headers: corsHeaders(request),
  });
}

export function apiErrorResponse(request: Request, error: unknown) {
  if (error instanceof ApiError) {
    return apiJson(request, { error: error.message, code: error.code }, error.status);
  }

  if (error instanceof ZodError) {
    return apiJson(
      request,
      {
        error: "Invalid request",
        code: "validation_error",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      400
    );
  }

  console.error("API route error:", error);

  return apiJson(request, { error: "Internal server error", code: "internal_error" }, 500);
}

export async function withApiErrorHandling(request: Request, handler: () => Promise<Response> | Response) {
  try {
    return await handler();
  } catch (error) {
    return apiErrorResponse(request, error);
  }
}

export async function withTimeout<T>(work: Promise<T>, timeoutMs = 25_000) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new ApiError("Request timed out", 504, "timeout"));
      }, timeoutMs);
    });

    return await Promise.race([work, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
