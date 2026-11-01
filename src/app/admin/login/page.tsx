"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data.entries())) });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) { setError(result.error ?? "Sign-in failed."); return; }
    router.push("/admin");
    router.refresh();
  }

  return <main className="admin-login"><Link className="wordmark" href="/"><span className="wordmark-mark">M.S.</span><span className="wordmark-name">SPICES</span></Link><span className="eyebrow-light">Store administration</span><h1>Welcome back.</h1><form onSubmit={submit}><label className="form-field">Email address<input name="email" type="email" autoComplete="username" required /></label><label className="form-field">Password<input name="password" type="password" autoComplete="current-password" required minLength={8} /></label>{error && <p className="notice error-notice" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button></form></main>;
}