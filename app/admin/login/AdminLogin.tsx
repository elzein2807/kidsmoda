"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { STORE } from "@/lib/config";

/**
 * ADMIN SIGN-IN — email and password against Supabase Auth.
 *
 * Access is two gates, not one: a valid session AND a row in admin_profiles.
 * A forbidden state is shown plainly rather than pretending the password was
 * wrong, because the only people who will ever see it are the owner's family.
 */
export function AdminLogin({ forbidden, email: signedInAs }: { forbidden?: boolean; email?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Authentication is not configured yet. Add the Supabase keys to enable sign-in.");
      return;
    }

    setStatus("loading");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("error");
      setMessage("That email and password did not match. Please try again.");
      return;
    }
    window.location.reload();
  };

  return (
    <div className="km-login">
      <div className="km-login__card">
        <Logo arc />
        <h1 className="km-login__title">Dashboard</h1>

        {forbidden ? (
          <>
            <p className="km-note km-note--error" role="alert">
              <Icon name="alert" size={18} />
              <span>
                {signedInAs} is signed in but does not have dashboard access.
                Only the owner and her son do.
              </span>
            </p>
            <p className="km-hint">
              If this is a mistake, contact the shop on {STORE.phoneDisplay}.
            </p>
          </>
        ) : (
          <form className="km-login__form" onSubmit={submit} noValidate>
            <div className="km-field">
              <label className="km-label" htmlFor="km-admin-email">Email</label>
              <input
                id="km-admin-email"
                className="km-input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="km-field">
              <label className="km-label" htmlFor="km-admin-pass">Password</label>
              <input
                id="km-admin-pass"
                className="km-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {message && (
              <p className="km-error" role="alert">{message}</p>
            )}

            <button type="submit" className="km-btn km-btn--block" data-loading={status === "loading"} disabled={status === "loading"}>
              Sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
