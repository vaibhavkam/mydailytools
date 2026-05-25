import Link from "next/link";
import { SITE } from "@/lib/tools";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label={`${SITE.name} home`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id="mdt-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#mdt-grad)" />
        {/* stylized wrench + spark forming an "M" silhouette */}
        <path
          d="M10 8.5l3.2 3.2a3 3 0 010 4.2L10 19.1l2.9 2.9 3.2-3.2a3 3 0 014.2 0L23.2 22 22 23.2l-2.9-2.9a3 3 0 00-4.2 0L11.6 23.5 8.5 20.4l3.2-3.2a3 3 0 000-4.2L8.5 9.7 10 8.5z"
          fill="white"
          fillOpacity="0.95"
        />
        <circle cx="22" cy="10" r="1.6" fill="white" />
      </svg>
      <span className="font-semibold tracking-tight text-base sm:text-lg">
        My<span className="bg-brand-gradient bg-clip-text text-transparent">Daily</span>Tool
      </span>
    </Link>
  );
}
