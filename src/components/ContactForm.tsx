"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
    const result = await response.json();
    setBusy(false);
    setError(!response.ok);
    setMessage(response.ok ? "Your note is with us. We will be in touch soon." : result.error ?? "We could not send your note right now.");
    if (response.ok) event.currentTarget.reset();
  }

  return <form className="contact-form" onSubmit={submit}>
    <label className="form-field">Your name<input name="name" autoComplete="name" required minLength={2} /></label>
    <div className="form-row"><label className="form-field">Email<input type="email" name="email" autoComplete="email" required /></label><label className="form-field">Phone <span className="muted">(optional)</span><input name="phone" autoComplete="tel" /></label></div>
    <label className="form-field">Subject<input name="subject" required minLength={3} /></label>
    <label className="form-field">Your message<textarea name="message" required minLength={10} maxLength={2000} /></label>
    {message && <p className={`notice ${error ? "error-notice" : ""}`} role="status">{message}</p>}
    <button className="button" disabled={busy}>{busy ? "Sending..." : "Send your note"}</button>
  </form>;
}