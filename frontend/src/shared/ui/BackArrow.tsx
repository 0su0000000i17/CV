import Link from "next/link";

export const BackArrow = () => {
  return (
    <Link href="/">
      <svg 
        className="w-12 h-12 md:w-20 md:h-20 text-neutral-400 stroke-[1] hover:text-white hover:-translate-x-1 hover:translate-y-1 transition-all cursor-pointer rotate-180" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Link>
  );
};