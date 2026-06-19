'use client';

import Link from "next/link";

export const BackArrow = () => {
  return (
    <Link 
      href="/" 
      className="fixed right-6 md:right-12 top-32 md:top-40 z-50 flex-shrink-0"
      aria-label="Назад"
    >
      <svg 
        className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20 text-muted-foreground stroke-[1] hover:text-foreground hover:-translate-x-1 hover:translate-y-1 transition-all cursor-pointer rotate-180" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Link>
  );
};
