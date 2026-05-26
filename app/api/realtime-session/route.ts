import { createHash } from "crypto";

import { getEnv, getOptionalEnv } from "@/lib/env";
import { checkRequestRateLimit, getClientIp } from "@/lib/rate-limit";
import { assertTrustedOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildSafetyIdentifier(request: Request) {
  const ip = getClientIp(request);

  return createHash("sha256")
    .update(`prntd-realtime:${ip}`)
    .digest("hex");
}

export async function POST(
  request: Request,
) {
  try {
    assertTrustedOrigin(request);

    checkRequestRateLimit(
      request,
      "openai:realtime-session",
      {
        limit: 20,
        windowMs: 60_000,
      },
    );

    const contentType =
      request.headers
        .get("content-type")
        ?.toLowerCase() ?? "";

    if (
      !contentType.includes(
        "application/sdp",
      ) &&
      !contentType.includes(
        "text/plain",
      )
    ) {
      return new Response(
        "Expected application/sdp payload.",
        {
          status: 415,
        },
      );
    }

    const sdp =
      await request.text();

    if (!sdp.trim()) {
      return new Response(
        "Missing SDP offer.",
        {
          status: 400,
        },
      );
    }

    const formData =
      new FormData();

    const model = getOptionalEnv(
      "OPENAI_REALTIME_MODEL",
      "gpt-realtime-2",
    );

    const voice = getOptionalEnv(
      "OPENAI_REALTIME_VOICE",
      "marin",
    );

    formData.append(
      "sdp",
      sdp,
    );

    formData.append(
      "session",
      JSON.stringify({
        type: "realtime",

        model,

        instructions:
          "You are PRNTD's realtime voice prompt assistant. Preserve the user's original wording and intent. Lightly clean grammar and structure while keeping prompts concise and print-ready. Do not creatively rewrite or expand prompts unless explicitly asked.",

        turn_detection: {
          type: "server_vad",

          threshold: 0.5,

          prefix_padding_ms: 500,

          silence_duration_ms: 1800,
        },

        output_modalities: ["text"],

        reasoning: {
          effort: "minimal",
        },

        audio: {
          output: {
            voice,
          },

          input: {
            transcription: {
              model:
                "gpt-4o-mini-transcribe",
            },
          },
        },
      }),
    );

    const response =
      await fetch(
        "https://api.openai.com/v1/realtime/calls",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${getEnv("OPENAI_API_KEY")}`,

            "OpenAI-Safety-Identifier":
              buildSafetyIdentifier(
                request,
              ),
          },

          body: formData,
        },
      );

    const answer =
      await response.text();

    if (!response.ok) {
      console.error(
        "Realtime session failed:",
        answer,
      );

      return new Response(
        answer ||
          "Unable to start realtime session.",
        {
          status: response.status,
        },
      );
    }

    return new Response(
      answer,
      {
        headers: {
          "Content-Type":
            "application/sdp",

          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Realtime session error:",
      error,
    );

    return new Response(
      "Realtime failed",
      {
        status: 500,
      },
    );
  }
}