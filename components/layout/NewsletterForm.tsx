"use client";

import { useState } from "react";

/**
 * NEWSLETTER — client-side validation and states only.
 * There is no mailing provider connected yet, so the form is honest about it:
 * it validates and confirms locally and the submit handler is the single place
 * to wire a real provider later. It does not pretend to have subscribed anyone.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    if (!valid) {
      setState("error");
      return;
    }
    // TODO(kidsmoda): POST to the mailing provider once an account exists.
    setState("done");
  };

  if (state === "done") {
    return (
      <p className="km-note km-note--success" role="status">
        Thank you — we will add {email} to the list as soon as our mailing list is live.
      </p>
    );
  }

  return (
    <form className="km-footer__form" onSubmit={submit} noValidate>
      <label htmlFor="km-news" className="km-sr">Email address</label>
      <input
        id="km-news"
        className="km-input"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="Your email"
        value={email}
        aria-invalid={state === "error"}
        aria-describedby={state === "error" ? "km-news-err" : undefined}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") setState("idle");
        }}
      />
      <button type="submit" className="km-btn km-btn--inverse">Sign up</button>
      {state === "error" && (
        <p id="km-news-err" className="km-error" style={{ flexBasis: "100%" }}>
          Please enter a valid email address.
        </p>
      )}
    </form>
  );
}
