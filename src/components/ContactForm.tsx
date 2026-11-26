"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { FaCircleCheck, FaCircleExclamation, FaPaperPlane } from "react-icons/fa6";

import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { siteConfig } from "@/lib/seo";

import PostcardStamp from "./PostcardStamp";

type FormStatus = "idle" | "sending" | "success" | "error";
type ContactField = "name" | "email" | "message";
type FieldErrors = Partial<Record<ContactField, string>>;

interface ContactResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const REQUEST_TIMEOUT_MS = 12_000;
const FIELD_ORDER: readonly ContactField[] = ["name", "email", "message"];
const DRAFT_KEY = "portfolio-contact-draft";

function validateField(field: ContactField, value: string) {
  const trimmedValue = value.trim();

  if (field === "name" && trimmedValue.length < 2) return "Use at least 2 characters for your name.";
  if (field === "email" && !trimmedValue) return "Add an email so I can reply.";
  if (field === "email" && !EMAIL_PATTERN.test(trimmedValue)) return "That email address looks incomplete.";
  if (field === "message" && trimmedValue.length < 10) return "Add at least 10 characters so I have enough context.";

  return "";
}

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [feedback, setFeedback] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [messageLength, setMessageLength] = useState(0);
  const isSubmitting = useRef(false);
  const errorKey = Object.keys(fieldErrors).sort((a, b) => a.localeCompare(b)).join(",");

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Record<ContactField, string>>;
      FIELD_ORDER.forEach((field) => {
        const control = form.elements.namedItem(field);
        if ((control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) && typeof saved[field] === "string" && !control.value) {
          control.value = saved[field];
        }
      });
    } catch {
      // Ignore unavailable or malformed sessionStorage drafts.
    }
  }, []);

  // Shake newly invalid fields and lift their messages in.
  useGSAP(
    () => {
      if (!errorKey || prefersReducedMotion()) return;
      gsap.fromTo(
        '[aria-invalid="true"]',
        { x: 0 },
        { keyframes: { x: [0, -5, 5, -3, 3, 0] }, duration: 0.24, ease: "none" },
      );
      gsap.from(".contact-field-error-motion", { autoAlpha: 0, y: -6, duration: 0.24 });
    },
    { dependencies: [errorKey], scope: formRef },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      if (status === "sending") {
        gsap.to(".contact-submit-icon", { keyframes: { x: [0, 5, 2], y: [0, -5, -2], rotate: [0, -8, -3] }, duration: 0.24 });
      } else {
        gsap.to(".contact-submit-icon", { x: 0, y: 0, rotate: 0, duration: 0.24 });
      }
      if (feedback) {
        gsap.from(".contact-feedback", { autoAlpha: 0, y: 8, clipPath: "inset(0 0 50% 0)", duration: 0.28 });
      }
    },
    { dependencies: [status, feedback], scope: formRef },
  );

  function readFormText(data: FormData, field: ContactField): string {
    const value = data.get(field);
    return typeof value === "string" ? value : "";
  }

  function saveDraft() {
    const form = formRef.current;
    if (!form) return;
    try {
      const data = new FormData(form);
      const draft: Record<ContactField, string> = {
        name: readFormText(data, "name"),
        email: readFormText(data, "email"),
        message: readFormText(data, "message"),
      };
      if (draft.name || draft.email || draft.message) {
        window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } else {
        window.sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      // Ignore private-browsing storage errors.
    }
  }

  function handleBlur(field: ContactField, value: string) {
    if (!value.trim() && !fieldErrors[field]) return;
    const error = validateField(field, value);
    setFieldErrors((current) => {
      if (!error) {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      }
      return current[field] === error ? current : { ...current, [field]: error };
    });
  }

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
    const text = (field: ContactField) => readFormText(data, field).trim();
    const values: Record<ContactField, string> = {
      message: text("message"),
      name: text("name"),
      email: text("email"),
    };
    const errors: FieldErrors = {};

    FIELD_ORDER.forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) errors[field] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("idle");
      setFeedback("");
      const firstInvalidField = FIELD_ORDER.find((field) => Boolean(errors[field]));
      if (firstInvalidField) {
        (form.elements.namedItem(firstInvalidField) as HTMLElement | null)?.focus();
      }
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
      setMessageLength(0);
      try {
        window.sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // Ignore private-browsing storage errors.
      }
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
      let message = "Your message could not be sent. Check your connection and try again.";
      if (error instanceof DOMException && error.name === "AbortError") message = "Sending timed out. Check your connection and try again.";
      else if (error instanceof Error) message = error.message;
      setFeedback(message);
    } finally {
      isSubmitting.current = false;
      window.clearTimeout(timeout);
    }
  }

  const fieldError = (field: ContactField) =>
    fieldErrors[field] && (
      <span className="contact-field-error-motion">
        <FaCircleExclamation aria-hidden="true" />
        {fieldErrors[field]}
      </span>
    );

  const remaining = 10 - messageLength;
  const unit = remaining === 1 ? "character" : "characters";
  const messageHelper =
    messageLength > 0 && remaining > 0
      ? `Add ${remaining} more ${unit} (10 minimum).`
      : "A short note on what you are building, fixing, or trying to understand is enough.";

  // Natural mobile-first DOM order (To -> Name/Email -> Message -> Submit), arranged as a postcard back on desktop.
  return (
    <form className="contact-form" ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={status === "sending"}>
      <div className="contact-header">
        <PostcardStamp />

        <p className="contact-to">
          <span>To</span>
          <strong>Javier Raut</strong>
          <a href={siteConfig.email}>{siteConfig.email.replace(/^mailto:/, "")}</a>{" "}
          Cagayan de Oro, Philippines
        </p>
      </div>

      <div className="contact-sender">
        <div className="contact-field">
          <label htmlFor="contact-name">Your name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={80}
            minLength={2}
            required
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby="name-error"
            onBlur={(event) => handleBlur("name", event.currentTarget.value)}
            onChange={(event) => {
              updateFieldError("name", event.currentTarget.value);
              saveDraft();
            }}
          />
          <span className="contact-field-error" id="name-error" aria-live="polite" aria-atomic="true">
            {fieldError("name")}
          </span>
        </div>
        <div className="contact-field">
          <label htmlFor="contact-email">Your email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby="email-error"
            onBlur={(event) => handleBlur("email", event.currentTarget.value)}
            onChange={(event) => {
              updateFieldError("email", event.currentTarget.value);
              saveDraft();
            }}
          />
          <span className="contact-field-error" id="email-error" aria-live="polite" aria-atomic="true">
            {fieldError("email")}
          </span>
        </div>

        <label className="contact-honeypot" aria-hidden="true">
          Website{" "}
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="contact-message">
        <div className="contact-field">
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            rows={7}
            maxLength={5_000}
            minLength={10}
            required
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby="message-error message-helper"
            onBlur={(event) => handleBlur("message", event.currentTarget.value)}
            onChange={(event) => {
              const value = event.currentTarget.value;
              setMessageLength(value.trim().length);
              updateFieldError("message", value);
              saveDraft();
            }}
          />
          <span className="contact-field-error" id="message-error" aria-live="polite" aria-atomic="true">
            {fieldError("message")}
          </span>
          <span className="contact-form-helper" id="message-helper">
            {messageHelper}
          </span>
        </div>
      </div>

      <div className="contact-form-submit">
        <button className="contact-submit" type="submit" disabled={status === "sending"}>
          <span className="contact-submit-icon inline-flex">
            <FaPaperPlane aria-hidden="true" />
          </span>
          {status === "sending" ? "Sending..." : "Send message"}
        </button>
        <div className="contact-feedback-slot" aria-live="polite" aria-atomic="true">
          {feedback && (
            <p className={`contact-feedback contact-feedback-${status}`} key={`${status}-${feedback}`}>
              {status === "success" && <FaCircleCheck aria-hidden="true" />}
              {status === "error" && <FaCircleExclamation aria-hidden="true" />}
              {feedback}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
