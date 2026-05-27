import { createHash } from "crypto";

import { getEnv } from "@/lib/env";
import {
  checkRequestRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { assertTrustedOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildSafetyIdentifier(
  request: Request,
) {
  const ip =
    getClientIp(request);

  return createHash("sha256")
    .update(`prntd-realtime:${ip}`)
    .digest("hex");
}

export async function POST(
  request: Request,
) {
  try {
    assertTrustedOrigin(
      request,
    );

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

    formData.append(
      "sdp",
      sdp,
    );

    formData.append(
      "session",
      JSON.stringify({
        type: "transcription",

        audio: {
          input: {
            format: {
              type: "audio/pcm",
              rate: 24000,
            },

            transcription: {
              model:
                "gpt-realtime-whisper",

              language: "en",

              delay: "low",
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