import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

interface RateLimitEntry {
  count: number;
  resetsAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

function cleanHeaderValue(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function getClientAddress(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || current.resetsAt <= now) {
    rateLimits.set(key, { count: 1, resetsAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  rateLimits.set(key, current);
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  if ((Number(request.headers.get("content-length")) || 0) > 20_000) {
    return NextResponse.json(
      { error: { code: "PAYLOAD_TOO_LARGE", message: "That message is too large to send." } },
      { status: 413 },
    );
  }

  if (isRateLimited(getClientAddress(request))) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many messages were sent. Please try again later." } },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "The form submission was not valid." } },
      { status: 400 },
    );
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: { code: "INVALID_FORM", message: "Please complete the contact form." } },
      { status: 400 },
    );
  }

  const fields = payload as Record<string, unknown>;
  const name = typeof fields.name === "string" ? cleanHeaderValue(fields.name) : "";
  const email = typeof fields.email === "string" ? cleanHeaderValue(fields.email).toLowerCase() : "";
  const subject = typeof fields.subject === "string" ? cleanHeaderValue(fields.subject) : "";
  const message = typeof fields.message === "string" ? fields.message.trim() : "";
  const website = typeof fields.website === "string" ? fields.website.trim() : "";

  if (website) return NextResponse.json({ success: true });

  if (
    name.length < 2 ||
    name.length > 80 ||
    !EMAIL_PATTERN.test(email) ||
    email.length > 254 ||
    subject.length < 3 ||
    subject.length > 120 ||
    message.length < 10 ||
    message.length > 5_000
  ) {
    return NextResponse.json(
      { error: { code: "INVALID_FORM", message: "Check each field and try sending again." } },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || "javier.raut@gmail.com";
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";

  if (!apiKey) {
    return NextResponse.json(
      {
        error: {
          code: "CONTACT_NOT_CONFIGURED",
          message: "Email delivery is not configured yet. Please use the email link instead.",
        },
      },
      { status: 503 },
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        text: [`Name: ${name}`, `Email: ${email}`, "", message].join("\n"),
      }),
    });
  } catch {
    return NextResponse.json(
      { error: { code: "EMAIL_PROVIDER_UNREACHABLE", message: "Email delivery is unavailable. Please try again." } },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: { code: "EMAIL_DELIVERY_FAILED", message: "Your message could not be sent. Please try again." } },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
