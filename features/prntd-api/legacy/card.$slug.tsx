/* eslint-disable */
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function loader({ params }: any) {
  const slug = params.slug;

  if (!slug) {
    throw new Response("Missing slug", {
      status: 400,
    });
  }

  const { data, error } = await supabase
    .from("digital_cards")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    throw new Response("Card not found", {
      status: 404,
    });
  }

  return Response.json({ card: data });
}

export default function SmartCardPage({ loaderData }: any) {
  const { card } = loaderData;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          background: "white",
          borderRadius: 20,
          padding: 32,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        {card.logo_url && (
          <img
            src={card.logo_url}
            alt={card.business_name}
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: 16,
              marginBottom: 20,
            }}
          />
        )}

        <h1
          style={{
            margin: 0,
            fontSize: 32,
          }}
        >
          {card.business_name}
        </h1>

        {card.owner_name && (
          <p
            style={{
              marginTop: 8,
              color: "#666",
            }}
          >
            {card.owner_name}
          </p>
        )}

                <div style={{ marginTop: 28 }}>
          {card.phone && (
            <p>
              <strong>Phone:</strong>{" "}
              <a href={`tel:${card.phone}`}>
                {card.phone}
              </a>
            </p>
          )}

          {card.email && (
            <p>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${card.email}`}>
                {card.email}
              </a>
            </p>
          )}

          {card.website && (
            <p>
              <strong>Website:</strong>{" "}
              <a
                href={card.website}
                target="_blank"
                rel="noreferrer"
              >
                {card.website}
              </a>
            </p>
          )}

          {card.address && (
            <p>
              <strong>Address:</strong>{" "}
              {card.address}
            </p>
          )}

          {card.instagram && (
            <p>
              <strong>Instagram:</strong>{" "}
              <a
                href={card.instagram}
                target="_blank"
                rel="noreferrer"
              >
                View Profile
              </a>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}