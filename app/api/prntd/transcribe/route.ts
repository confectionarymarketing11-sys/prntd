
import OpenAI from "openai";

import {
  apiJson,
  ApiError,
  withApiErrorHandling,
} from "@/lib/api-response";

import { getOptionalEnv } from "@/lib/env";

import { checkRequestRateLimit } from "@/lib/rate-limit";

import { createSupabaseAdminClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: getOptionalEnv(
    "OPENAI_API_KEY",
  ),
});

export async function POST(
  request: Request,
) {
  return withApiErrorHandling(
    request,
    async () => {
      if (
        !getOptionalEnv(
          "OPENAI_API_KEY",
        )
      ) {
        throw new ApiError(
          "OPENAI_API_KEY is not configured.",
          503,
          "openai_not_configured",
        );
      }

      checkRequestRateLimit(
        request,
        "prntd-transcribe:ip",
        {
          limit: 20,
          windowMs: 60_000,
        },
      );

      const authorization =
        request.headers.get(
          "authorization",
        );

      if (
        !authorization?.startsWith(
          "Bearer ",
        )
      ) {
        throw new ApiError(
          "Unauthorized.",
          401,
          "unauthorized",
        );
      }

      const token =
        authorization.replace(
          "Bearer ",
          "",
        );

      const supabase =
        createSupabaseAdminClient();

      const {
        data: { user },
        error: authError,
      } =
        await supabase.auth.getUser(
          token,
        );

      if (
        authError ||
        !user
      ) {
        throw new ApiError(
          "Invalid session.",
          401,
          "invalid_session",
        );
      }

      const formData =
        await request.formData();

      const audio =
        formData.get("audio");

      if (
        !(audio instanceof File)
      ) {
        throw new ApiError(
          "Audio file missing.",
          400,
          "audio_missing",
        );
      }

      const maxSize =
        10 * 1024 * 1024;

      if (
        audio.size > maxSize
      ) {
        throw new ApiError(
          "Audio file too large.",
          400,
          "audio_too_large",
        );
      }

      const transcription =
        await openai.audio.transcriptions.create(
          {
            file: audio,
            model:
              "whisper-1",
            language: "en",
            response_format:
              "json",
            temperature: 0.2,
          },
        );

      return apiJson(
        request,
        {
          success: true,
          text: transcription.text,
        },
      );
    },
  );
}