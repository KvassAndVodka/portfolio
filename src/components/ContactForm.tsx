"use client";

import { FormEvent, useRef, useState } from "react";
import { FaCircleCheck, FaCircleExclamation, FaPaperPlane } from "react-icons/fa6";

type FormStatus = "idle" | "sending" | "success" | "error";
type ContactField = "name" | "email" | "subject" | "message";
type FieldErrors = Partial<Record<ContactField, string>>;

interface ContactResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const REQUEST_TIMEOUT_MS = 12_000;

function validateField(field: ContactField, value: string) {
  const trimmedValue = value.trim();

  if (field === "name" && trimmedValue.length < 2) return "Use at least 2 characters for your name.";
  if (field === "email" && !trimmedValue) return "Add an email so I can reply.";
  if (field === "email" && !EMAIL_PATTERN.test(trimmedValue)) return "That email address looks incomplete.";
  if (field === "subject" && trimmedValue.length < 3) return "Use at least 3 characters for the subject.";
  if (field === "message" && trimmedValue.length < 10) return "Add at least 10 characters so I have enough context.";

  return "";
}

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [feedback, setFeedback] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const isSubmitting = useRef(false);

  function updateFieldError(field: ContactField, value: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const error = validateField(field, value);
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting.current) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };
    const errors: FieldErrors = {};

    (Object.keys(values) as ContactField[]).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) errors[field] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("idle");
      setFeedback("");
      const firstInvalidField = Object.keys(errors)[0] as ContactField;
      (form.elements.namedItem(firstInvalidField) as HTMLElement | null)?.focus();
      return;
    }

    setFieldErrors({});
    isSubmitting.current = true;
    setStatus("sending");
    setFeedback("Sending your message...");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => ({}))) as ContactResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message || "Your message could not be sent.");
      }

      form.reset();
      setStatus("success");
      setFeedback("Message sent. I will get back to you soon.");
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/#contact", event: "contact_submit" }),
        keepalive: true,
      }).catch(() => undefined);
    } catch (error) {
      setStatus("error");
      setFeedback(
        error instanceof DOMException && error.name === "AbortError"
          ? "Sending timed out. Check your connection and try again."
          : error instanceof Error
            ? error.message
            : "Your message could not be sent. Check your connection and try again.",
      );
    } finally {
      isSubmitting.current = false;
      window.clearTimeout(timeout);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate aria-busy={status === "sending"}>
      <p className="contact-form-required">All fields required.</p>
      <div className="contact-form-row">
        <label>
          Name
          <input
            name="name"
            type="text"
            autoComplete="name"
            maxLength={80}
            minLength={2}
            required
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby="name-error"
            onChange={(event) => updateFieldError("name", event.currentTarget.value)}
          />
          <span className="contact-field-error" id="name-error" aria-live="polite" aria-atomic="true">
            {fieldErrors.name && <FaCircleExclamation aria-hidden="true" />}
            {fieldErrors.name ?? ""}
          </span>
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby="email-error"
            onChange={(event) => updateFieldError("email", event.currentTarget.value)}
          />
          <span className="contact-field-error" id="email-error" aria-live="polite" aria-atomic="true">
            {fieldErrors.email && <FaCircleExclamation aria-hidden="true" />}
            {fieldErrors.email ?? ""}
          </span>
        </label>
      </div>

      <label>
        Subject
        <input
          name="subject"
          type="text"
          maxLength={120}
          minLength={3}
          required
          aria-invalid={Boolean(fieldErrors.subject)}
          aria-describedby="subject-error"
          onChange={(event) => updateFieldError("subject", event.currentTarget.value)}
        />
        <span className="contact-field-error" id="subject-error" aria-live="polite" aria-atomic="true">
          {fieldErrors.subject && <FaCircleExclamation aria-hidden="true" />}
          {fieldErrors.subject ?? ""}
        </span>
      </label>

      <label>
        Message
        <textarea
          name="message"
          rows={6}
          maxLength={5_000}
          minLength={10}
          required
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby="message-error message-helper"
          onChange={(event) => updateFieldError("message", event.currentTarget.value)}
        />
        <span className="contact-field-error" id="message-error" aria-live="polite" aria-atomic="true">
          {fieldErrors.message && <FaCircleExclamation aria-hidden="true" />}
          {fieldErrors.message ?? ""}
        </span>
        <span className="contact-form-helper" id="message-helper">
          Tell me what you are building, fixing, or trying to understand.
        </span>
      </label>

      <label className="contact-honeypot" aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="contact-form-submit">
        <button className="contact-submit" type="submit" disabled={status === "sending"}>
          <FaPaperPlane aria-hidden="true" />
          {status === "sending" ? "Sending..." : "Send message"}
        </button>
        <p className={`contact-feedback contact-feedback-${status}`} aria-live="polite" aria-atomic="true">
          {status === "success" && <FaCircleCheck aria-hidden="true" />}
          {status === "error" && <FaCircleExclamation aria-hidden="true" />}
          {feedback}
        </p>
      </div>
    </form>
  );
}
