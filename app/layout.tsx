import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/tools";
import { buildMetadata } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = buildMetadata({
  title: SITE.name,
  description: SITE.description,
  path: "/",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Inline pre-hydration script avoids the dark-mode flash of unstyled content.
const noFlashTheme = `
(function(){try{
  var t=localStorage.getItem('theme');
  if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){
    document.documentElement.classList.add('dark');
  }
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
      </head>
      <body className="font-sans">
        {/* Skip-to-content link for screen readers / keyboard users */}
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:btn-primary">
          Skip to content
        </a>

        <Header />
        <main id="main" className="container py-6 md:py-10 animate-fade-in">{children}</main>
        <Footer />

        {adsenseClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {ga4Id && (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{`
              window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
              gtag('js',new Date());gtag('config','${ga4Id}',{anonymize_ip:true});
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
