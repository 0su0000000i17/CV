'use client';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <p className="mb-8 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Главная / Home
        </p>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr] xl:gap-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Интеллектуальный сервис <br className="hidden sm:inline" />
              для создания, анализа <br className="hidden sm:inline" />
              и кастомизации твоего <br className="hidden sm:inline" />
              <span className="font-medium text-foreground">IT-резюме</span>
            </h1>
          </div>

          <div className="flex flex-col items-end justify-between pt-1 pb-0 xl:-ml-20 xl:pr-40">
            <style jsx>{`
              @keyframes drawLine {
                from {
                  stroke-dashoffset: 600;
                }
                to {
                  stroke-dashoffset: 0;
                }
              }

              @keyframes riseBar {
                from {
                  transform: scaleY(0);
                  transform-origin: bottom;
                }
                to {
                  transform: scaleY(1);
                  transform-origin: bottom;
                }
              }

              @keyframes waveOpacity {
                0%, 100% {
                  opacity: 0.15;
                }
                30% {
                  opacity: 1;
                }
                70% {
                  opacity: 0.5;
                }
              }

              .animate-line {
                stroke-dasharray: 600;
                animation: drawLine 2.5s ease-in-out forwards;
              }

              .animate-bar-1 {
                animation:
                  riseBar 0.6s ease-out 0.1s both,
                  waveOpacity 4s ease-in-out 0s infinite;
              }
              .animate-bar-2 {
                animation:
                  riseBar 0.6s ease-out 0.2s both,
                  waveOpacity 4s ease-in-out 0.5s infinite;
              }
              .animate-bar-3 {
                animation:
                  riseBar 0.6s ease-out 0.3s both,
                  waveOpacity 4s ease-in-out 1s infinite;
              }
              .animate-bar-4 {
                animation:
                  riseBar 0.6s ease-out 0.4s both,
                  waveOpacity 4s ease-in-out 1.5s infinite;
              }
              .animate-bar-5 {
                animation:
                  riseBar 0.6s ease-out 0.5s both,
                  waveOpacity 4s ease-in-out 2s infinite;
              }
              .animate-bar-6 {
                animation:
                  riseBar 0.6s ease-out 0.6s both,
                  waveOpacity 4s ease-in-out 2.5s infinite;
              }

              @keyframes glowPulse {
                0%, 100% {
                  opacity: 0.5;
                }
                50% {
                  opacity: 1;
                }
              }

              .animate-glow {
                animation: glowPulse 3.5s ease-in-out infinite;
              }

              .animate-bar-1,
              .animate-bar-2,
              .animate-bar-3,
              .animate-bar-4,
              .animate-bar-5,
              .animate-bar-6 {
                will-change: transform, opacity;
              }

              @media (prefers-reduced-motion: reduce) {
                .animate-bar-1,
                .animate-bar-2,
                .animate-bar-3,
                .animate-bar-4,
                .animate-bar-5,
                .animate-bar-6 {
                  animation: none;
                  opacity: 0.8;
                }
              }
            `}</style>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 420"
              className="w-full max-w-[400px] h-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient
                  id="barGradient"
                  x1="0%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow3" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Сетка */}
              <line
                x1="40"
                y1="40"
                x2="300"
                y2="40"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border/15"
                strokeDasharray="4,8"
              />
              <line
                x1="40"
                y1="130"
                x2="300"
                y2="130"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border/15"
                strokeDasharray="4,8"
              />
              <line
                x1="40"
                y1="220"
                x2="300"
                y2="220"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border/15"
                strokeDasharray="4,8"
              />
              <line
                x1="40"
                y1="310"
                x2="300"
                y2="310"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border/15"
                strokeDasharray="4,8"
              />

              <line
                x1="40"
                y1="390"
                x2="300"
                y2="390"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/30"
              />
            
              <rect
                x="52"
                y="350"
                width="32"
                height="40"
                rx="4"
                fill="url(#barGradient)"
                className="text-emerald-600/40 animate-bar-1"
              />
              <rect
                x="100"
                y="310"
                width="32"
                height="80"
                rx="4"
                fill="url(#barGradient)"
                className="text-emerald-600/50 animate-bar-2"
              />
              <rect
                x="148"
                y="260"
                width="32"
                height="130"
                rx="4"
                fill="url(#barGradient)"
                className="text-emerald-600/60 animate-bar-3"
              />
              <rect
                x="196"
                y="200"
                width="32"
                height="190"
                rx="4"
                fill="url(#barGradient)"
                className="text-emerald-600/70 animate-bar-4"
              />
              <rect
                x="244"
                y="140"
                width="32"
                height="250"
                rx="4"
                fill="url(#barGradient)"
                className="text-emerald-600/80 animate-bar-5"
              />
              <rect
                x="292"
                y="70"
                width="32"
                height="320"
                rx="4"
                fill="url(#barGradient)"
                className="text-emerald-600/90 animate-bar-6"
              />

              <polyline
                points="68,350 116,310 164,260 212,200 260,140 308,70"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow3)"
                className="line-theme animate-line"
              />

              <circle cx="68" cy="350" r="4.5" className="dot-theme" />
              <circle cx="116" cy="310" r="4.5" className="dot-theme" />
              <circle cx="164" cy="260" r="4.5" className="dot-theme" />
              <circle cx="212" cy="200" r="4.5" className="dot-theme" />
              <circle cx="260" cy="140" r="4.5" className="dot-theme" />
              <circle cx="308" cy="70" r="4.5" className="dot-theme" />

              <circle
                cx="212"
                cy="200"
                r="14"
                fill="currentColor"
                className="text-foreground/10 animate-glow"
              />
            </svg>

            <p className="w-full text-right text-xs font-medium tracking-wide text-muted-foreground">
              БЫСТРЕЕ К РЕЗУЛЬТАТУ / FASTER TO RESULTS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}