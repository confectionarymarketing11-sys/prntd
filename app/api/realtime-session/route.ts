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
        session: {
  type: "realtime",
  audio: {
    input: {
      transcription: {
        model:
          "gpt-realtime-whisper",
      },
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