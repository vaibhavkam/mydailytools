"use client";

// Uses Web3Forms (no backend needed).
// Setup:
//   1. Sign up at https://web3forms.com (free).
//   2. Create an "Access Key" tied to your email.
//   3. Set NEXT_PUBLIC_WEB3FORMS_KEY in .env.local before building.
// Alternative: swap the action URL for Formspree (https://formspree.io/f/YOUR_ID).

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "MISSING_KEY");
    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
      const json = await res.json();
      if (json.success) { setStatus("ok"); form.reset(); }
      else { setStatus("error"); setError(json.message || "Submission failed"); }
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Network error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="subject" value="MyDailyTools contact form" />
      {/* honeypot for bots */}
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />
      <div>
        <label className="label" htmlFor="cf-name">Name</label>
        <input id="cf-name" name="name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="cf-email">Email</label>
        <input id="cf-email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="cf-msg">Message</label>
        <textarea id="cf-msg" name="message" required minLength={10} rows={5} className="input" />
      </div>
      <button type="submit" disabled={status === "sending"} className="btn-primary min-tap">
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      {status === "ok" && <p role="status" className="text-sm text-emerald-600">Thanks — we&apos;ll be in touch.</p>}
      {status === "error" && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
