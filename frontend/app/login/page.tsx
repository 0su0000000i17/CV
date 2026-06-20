"use client";

import { useMemo, useState } from "react";

import { BackArrow } from "@/src/shared";
import { supabase } from "@/src/shared/lib/supabase/client";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const canSubmit =
    normalizedEmail.length > 0 &&
    isValidEmail(normalizedEmail) &&
    status !== "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (!normalizedEmail) {
      setStatus("error");
      setMessage("Введите email.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setStatus("error");
      setMessage("Введите корректный email.");
      return;
    }

    setStatus("loading");

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setEmail(normalizedEmail);
    setStatus("success");
    setMessage("");
  };

  if (status === "success") {
    return (
      <div className="relative flex flex-1 flex-col">
        <div className="absolute right-0 top-0">
          <BackArrow />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background/60 p-8 text-center shadow-lg backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Ссылка отправлена
            </p>

            <h1 className="mt-2 text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
              Проверьте почту
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Мы отправили ссылку для входа на{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Откройте письмо и перейдите по ссылке, чтобы войти в личный
              кабинет.
            </p>

            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setMessage("");
              }}
              className="mt-8 w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Изменить email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="absolute right-0 top-0">
        <BackArrow />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background/60 p-8 shadow-lg backdrop-blur-sm">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Вход / Login
          </p>

          <h1 className="mt-2 text-center text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            Привет!
          </h1>

          <p className="mb-8 mt-2 text-center text-sm text-muted-foreground">
            Введите email — мы отправим ссылку для входа.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Отправляем..." : "Получить ссылку"}
            </button>

            {status === "error" && message ? (
              <p className="text-center text-sm text-red-500">{message}</p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}