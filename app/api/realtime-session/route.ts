export const runtime = "nodejs";

export async function POST() {
  const response = await fetch(
    "https://api.openai.com/v1/realtime/client_secrets",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        model: "gpt-realtime",

        voice: "verse",

        audio: {
          input: {
            transcription: {
              model:
                "gpt-4o-mini-transcribe",
            },
          },
        },
      }),
    },
  );

  const data =
    await response.json();

  console.log(data);

  if (!response.ok) {
    return Response.json(
      data,
      {
        status:
          response.status,
      },
    );
  }

  return Response.json(data);
}