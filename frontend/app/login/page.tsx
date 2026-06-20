'use client';

import { useState } from 'react';
import { BackArrow } from '@/src/shared';

export default function LoginPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email:', email);
  };

  return (
    <div className="flex flex-col flex-1 relative">
      {/* Стрелка */}
      <div className="absolute right-0 top-0">
        <BackArrow />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-background/60 backdrop-blur-sm shadow-lg">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium text-center">
            Вход / Login
          </p>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-foreground text-center mt-2">
            Привет!
          </h1>
          <p className="text-muted-foreground text-sm text-center mt-2 mb-8">
            Введите email — мы отправим ссылку для входа.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-background bg-foreground rounded-lg hover:bg-foreground/80 transition-colors"
            >
              Получить ссылку
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
