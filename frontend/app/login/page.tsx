"use client";

import { useState } from "react";
import { supabase } from "@/src/shared/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/auth/callback",
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-8">
        <h1 className="mb-3 text-3xl font-normal">Вход</h1>

        <p className="mb-8 text-sm text-neutral-400">
          Введите email — мы отправим ссылку для входа.
        </p>

        {sent ? (
          <p className="text-sm text-neutral-300">
            Ссылка отправлена. Проверьте почту.
          </p>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-neutral-700 px-5 py-3 text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black disabled:opacity-50"
            >
              {loading ? "Отправляем..." : "Получить ссылку"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}