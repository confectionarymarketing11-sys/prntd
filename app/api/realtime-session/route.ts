export const runtime = "nodejs";

export async function POST(
  request: Request,
) {
  try {
    const sdp =
      await request.text();

    const formData =
      new FormData();

    formData.append(
      "sdp",
      sdp,
    );

    formData.append(
      "session",
      JSON.stringify({
        type: "realtime",
        model: "gpt-realtime",
        audio: {
          output: {
            voice: "verse",
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
              `Bearer ${process.env.OPENAI_API_KEY}`,
          },

          body: formData,
        },
      );

    const answer =
      await response.text();

    return new Response(
      answer,
      {
        headers: {
          "Content-Type":
            "application/sdp",
        },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response(
      "Realtime failed",
      {
        status: 500,
      },
    );
  }
}