"use client";

import Link from "next/link";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode =
  | "login"
  | "signup"
  | "forgot-password";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
  initialMessage?: string;
};

const authCopy = {
  login: {
    title: "Welcome Back",
    subtitle:
      "Sign in to manage orders, designs, QR tools, and account settings.",
    button: "Sign In",
    footer:
      "Need an account?",
    footerHref:
      "/signup",
    footerLabel:
      "Create one",
  },

  signup: {
    title:
      "Create Account",
    subtitle:
      "Start your PRNTD account for saved designs, order history, and customer tools.",
    button:
      "Create Account",
    footer:
      "Already have an account?",
    footerHref:
      "/login",
    footerLabel:
      "Sign in",
  },

  "forgot-password": {
    title:
      "Reset Password",
    subtitle:
      "Enter your email and we will send a secure password reset link.",
    button:
      "Send Reset Link",
    footer:
      "Remembered it?",
    footerHref:
      "/login",
    footerLabel:
      "Back to login",
  },
} satisfies Record<
  AuthMode,
  Record<string, string>
>;

export default function AuthForm({
  mode,
  nextPath = "/dashboard",
  initialMessage = "",
}: AuthFormProps) {
  const copy =
    authCopy[mode];

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [message, setMessage] =
    useState(initialMessage);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  async function submitAuth(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSubmitting(true);

    setMessage("");

    try {
      const supabase =
        createSupabaseBrowserClient();

      const origin =
        window.location.origin;

      const authConfirmUrl = (
        destination: string,
      ) => {
        const url = new URL(
          "/auth/confirm",
          origin,
        );

        url.searchParams.set(
          "next",
          destination,
        );

        return url.toString();
      };

      if (mode === "login") {
        const { error } =
          await supabase.auth.signInWithPassword(
            {
              email: email
                .trim()
                .toLowerCase(),

              password,
            },
          );

        if (error)
          throw error;

        window.location.href =
          nextPath ||
          "/dashboard";

        return;
      }

      if (mode === "signup") {
        const response =
          await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email: email
                .trim()
                .toLowerCase(),
              password,
              fullName:
                fullName.trim(),
              nextPath:
                nextPath ||
                "/dashboard",
            }),
          });

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Signup failed.",
          );
        }

        setMessage(
          data.message ||
            "Check your email to verify your PRNTD account.",
        );

        return;
      }

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email
            .trim()
            .toLowerCase(),
          {
            redirectTo: authConfirmUrl(
              "/account/settings?mode=reset-password",
            ),
          },
        );

      if (error)
        throw error;

      setMessage(
        "Password reset link sent. Check your email.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Authentication failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full min-w-0">
      <div className="w-full min-w-0 overflow-hidden rounded-[32px] border border-white/10 bg-[#0f172a]/80 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="grid min-w-0 lg:grid-cols-[0.95fr_1.05fr]">
          {/* LEFT */}
          <div className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#312e81_100%)] p-7 text-white lg:border-b-0 lg:border-r sm:p-10">
            <div className="absolute right-[-10%] top-[-10%] h-[220px] w-[220px] rounded-full bg-[#8b5cf6]/20 blur-[90px]" />

            <div className="relative z-10 min-w-0">
              <div className="inline-flex flex-wrap rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#c7d2fe]">
                PRNTD Account
              </div>

              <h1 className="mt-7 text-[clamp(32px,4vw,52px)] font-black leading-[0.95] tracking-[-0.04em]">
                {copy.title}
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-8 text-[#cbd5e1]">
                {copy.subtitle}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <form
            onSubmit={
              submitAuth
            }
            className="flex min-w-0 flex-col gap-5 p-7 sm:p-10"
          >
            {/* NAME */}
            {mode ===
              "signup" && (
              <label className="grid min-w-0 gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                  Name
                </span>

                <input
                  value={
                    fullName
                  }
                  onChange={(
                    event,
                  ) =>
                    setFullName(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Your name"
                  autoComplete="name"
                  className="h-[58px] w-full min-w-0 rounded-[18px] border border-white/10 bg-[#020617] px-4 text-base text-white outline-none placeholder:text-[#64748b]"
                />
              </label>
            )}

            {/* EMAIL */}
            <label className="grid min-w-0 gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                Email
              </span>

              <input
                value={email}
                onChange={(
                  event,
                ) =>
                  setEmail(
                    event
                      .target
                      .value,
                  )
                }
                required
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="h-[58px] w-full min-w-0 rounded-[18px] border border-white/10 bg-[#020617] px-4 text-base text-white outline-none placeholder:text-[#64748b]"
              />
            </label>

            {/* PASSWORD */}
            {mode !==
              "forgot-password" && (
              <label className="grid min-w-0 gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                  Password
                </span>

                <input
                  value={
                    password
                  }
                  onChange={(
                    event,
                  ) =>
                    setPassword(
                      event
                        .target
                        .value,
                    )
                  }
                  required
                  minLength={6}
                  type="password"
                  placeholder="Minimum 6 characters"
                  autoComplete={
                    mode ===
                    "login"
                      ? "current-password"
                      : "new-password"
                  }
                  className="h-[58px] w-full min-w-0 rounded-[18px] border border-white/10 bg-[#020617] px-4 text-base text-white outline-none placeholder:text-[#64748b]"
                />
              </label>
            )}

            {/* FORGOT */}
            {mode ===
              "login" && (
              <Link
                href="/forgot-password"
                className="justify-self-end text-right text-sm font-black text-[#818cf8] no-underline"
              >
                Forgot password?
              </Link>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className="mt-2 w-full rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)] disabled:opacity-60"
            >
              {isSubmitting
                ? "Working..."
                : copy.button}
            </button>

            {/* MESSAGE */}
            {message && (
              <div className="rounded-[20px] border border-[#6366f1]/20 bg-[#312e81]/20 px-4 py-4 text-sm font-semibold text-[#c7d2fe]">
                {message}
              </div>
            )}

            {/* FOOTER */}
            <p className="pt-2 text-center text-sm font-semibold text-[#94a3b8]">
              {copy.footer}{" "}
              <Link
                href={
                  copy.footerHref
                }
                className="font-black text-[#818cf8] no-underline"
              >
                {
                  copy.footerLabel
                }
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
