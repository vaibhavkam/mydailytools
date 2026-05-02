import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <div className="text-7xl font-bold bg-brand-gradient bg-clip-text text-transparent">404</div>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-[rgb(var(--fg-muted))]">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn-primary min-tap">Go home</Link>
        <Link href="/tools/" className="btn-ghost min-tap">Browse tools</Link>
      </div>
    </div>
  );
}
