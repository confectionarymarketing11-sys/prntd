
import OpenAI from "openai";

import {
  apiJson,
  ApiError,
  withApiErrorHandling,
} from "@/lib/api-response";

import { getOptionalEnv } from "@/lib/env";

import { checkRequestRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export const maxDuration = 60;

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

      const openai = new OpenAI({
        apiKey: getOptionalEnv(
          "OPENAI_API_KEY",
        ),
      });

      checkRequestRateLimit(
        request,
        "prntd-transcribe:ip",
        {
          limit: 20,
          windowMs: 60_000,
        },
      );

      
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
              "gpt-4o-mini-transcribe",
            
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
