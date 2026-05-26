import { getOptionalEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/service";

type EmailPayload = {
  eventKey: string;
  emailType: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  metadata?: Record<string, unknown>;
};

export function orderConfirmationTemplate(input: {
  orderNumber: string;
  customerName?: string | null;
  total: string;
  portalUrl: string;
}) {
  const greeting = input.customerName ? `Hi ${input.customerName},` : "Hi,";

  return {
    subject: `PRNTD order confirmed: ${input.orderNumber}`,
    text: `${greeting}\n\nYour PRNTD order ${input.orderNumber} is confirmed. Total: ${input.total}.\n\nView your account: ${input.portalUrl}`,
    html: `
      <div style="margin:0;background:#f5f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#111827;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e7eaf3;">
          <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;color:#4f46e5;text-transform:uppercase;">PRNTD</div>
          <h1 style="margin:12px 0 8px;font-size:30px;line-height:1.1;">Order confirmed</h1>
          <p style="margin:0 0 20px;color:#4b5563;line-height:1.6;">${greeting} we received your order and it is now in the production queue.</p>
          <div style="background:#f8faff;border-radius:18px;padding:18px;margin:22px 0;">
            <p style="margin:0;color:#6b7280;font-size:13px;">Order</p>
            <p style="margin:4px 0 0;font-size:22px;font-weight:800;">${input.orderNumber}</p>
            <p style="margin:14px 0 0;color:#6b7280;font-size:13px;">Total</p>
            <p style="margin:4px 0 0;font-size:22px;font-weight:800;">${input.total}</p>
          </div>
          <a href="${input.portalUrl}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1,#7c3aed);color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 20px;font-weight:800;">View account</a>
          <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">You will receive another email when your order ships.</p>
        </div>
      </div>
    `,
  };
}

export function shippingConfirmationTemplate(input: {
  orderNumber: string;
  customerName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  const greeting = input.customerName ? `Hi ${input.customerName},` : "Hi,";
  const trackingLine = input.trackingNumber
    ? `Tracking number: ${input.trackingNumber}`
    : "Tracking details will appear in your account when available.";

  return {
    subject: `PRNTD order shipped: ${input.orderNumber}`,
    text: `${greeting}\n\nYour PRNTD order ${input.orderNumber} has shipped.\n${trackingLine}`,
    html: `
      <div style="margin:0;background:#f5f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#111827;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e7eaf3;">
          <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;color:#4f46e5;text-transform:uppercase;">PRNTD</div>
          <h1 style="margin:12px 0 8px;font-size:30px;line-height:1.1;">Your order shipped</h1>
          <p style="margin:0 0 20px;color:#4b5563;line-height:1.6;">${greeting} your order ${input.orderNumber} has left production.</p>
          <div style="background:#f8faff;border-radius:18px;padding:18px;margin:22px 0;">
            <p style="margin:0;color:#6b7280;font-size:13px;">Tracking</p>
            <p style="margin:4px 0 0;font-size:20px;font-weight:800;">${input.trackingNumber ?? "Pending"}</p>
          </div>
          ${
            input.trackingUrl
              ? `<a href="${input.trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1,#7c3aed);color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 20px;font-weight:800;">Track package</a>`
              : ""
          }
        </div>
      </div>
    `,
  };
}

export function authVerificationTemplate(input: {
  verificationUrl: string;
  customerName?: string | null;
}) {
  const greeting = input.customerName ? `Hi ${input.customerName},` : "Hi,";

  return {
    subject: "Verify your PRNTD account",
    text: `${greeting}\n\nVerify your PRNTD account with this secure link:\n${input.verificationUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="margin:0;background:#f5f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#111827;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e7eaf3;">
          <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;color:#4f46e5;text-transform:uppercase;">PRNTD</div>
          <h1 style="margin:12px 0 8px;font-size:30px;line-height:1.1;">Verify your account</h1>
          <p style="margin:0 0 20px;color:#4b5563;line-height:1.6;">${greeting} finish creating your PRNTD account so you can access saved designs, orders, and creator tools.</p>
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:24px 0;">
            <tr>
              <td bgcolor="#4f46e5" style="border-radius:999px;background-color:#4f46e5;">
                <a href="${input.verificationUrl}" style="display:inline-block;padding:14px 22px;font-size:15px;line-height:20px;font-family:Arial,sans-serif;font-weight:800;color:#ffffff !important;text-decoration:none;border-radius:999px;background-color:#4f46e5;">
                  Verify account
                </a>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">If the button is hidden or does not open, copy and paste this link into your browser:</p>
          <p style="margin:8px 0 0;font-size:13px;line-height:1.6;word-break:break-all;">
            <a href="${input.verificationUrl}" style="color:#4f46e5 !important;text-decoration:underline;">${input.verificationUrl}</a>
          </p>
          <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">This secure link can only be used for this signup request. If you did not request it, you can ignore this email.</p>
        </div>
      </div>
    `,
  };
}

export async function sendTransactionalEmail(payload: EmailPayload) {
  const supabase = createSupabaseAdminClient();
  const apiKey = getOptionalEnv("RESEND_API_KEY");
  const from = getOptionalEnv("TRANSACTIONAL_EMAIL_FROM", "PRNTD <orders@prntd.ca>");

  const { error: insertError } = await supabase.from("email_events").insert({
    event_key: payload.eventKey,
    email_type: payload.emailType,
    recipient: payload.to,
    subject: payload.subject,
    status: apiKey ? "pending" : "skipped",
    metadata: payload.metadata ?? {},
  });

  if (insertError?.code === "23505") {
    return { sent: false, duplicate: true };
  }

  if (insertError?.code === "42P01") {
    console.warn("email_events table is missing; transactional email idempotency is disabled.");
  } else if (insertError) {
    throw insertError;
  }

  if (!apiKey) {
    console.warn(`RESEND_API_KEY is not configured; skipped ${payload.emailType} email to ${payload.to}.`);
    return { sent: false, skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  const status = response.ok ? "sent" : "failed";

  const { error: updateError } = await supabase
    .from("email_events")
    .update({
      status,
      provider: "resend",
      provider_message_id: data.id ?? null,
      error_message: response.ok ? null : data.message ?? "Resend email failed",
      sent_at: response.ok ? new Date().toISOString() : null,
    })
    .eq("event_key", payload.eventKey);

  if (updateError && updateError.code !== "42P01") {
    throw updateError;
  }

  if (!response.ok) {
    throw new Error(data.message ?? "Resend email failed");
  }

  return { sent: true, providerMessageId: data.id };
}
