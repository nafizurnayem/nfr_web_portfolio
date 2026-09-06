import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MagneticCursor } from "@/components/magnetic-cursor";
import { identity } from "@/lib/identity";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// `NEXT_PUBLIC_SITE_URL` is set per environment; the localhost fallback keeps
// dev builds working without extra configuration.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: `${identity.name} — ${identity.title}`,
    template: `%s · ${identity.name}`,
  },
  description: identity.tagline,
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  keywords: [
    "computer vision",
    "image processing",
    "machine learning engineer",
    "deep learning",
    "CNN",
    "OpenCV",
    "PyTorch",
    "NLP",
    "LLM",
    "FastAPI",
    "Next.js",
    "robotics",
    "ESP32",
    identity.name,
  ],
  authors: [{ name: identity.name, url: identity.github }],
  creator: identity.name,
  openGraph: {
    title: `${identity.name} — ${identity.title}`,
    description: identity.tagline,
    url: siteUrl,
    siteName: `${identity.name} · Portfolio`,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${identity.name} — ${identity.title}`,
    description: identity.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#04060a" },
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Structured data so search engines and AI crawlers can read the identity
 * directly rather than inferring it from the page copy.
 */
function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: identity.name,
    jobTitle: identity.title,
    email: `mailto:${identity.email}`,
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dhaka",
      addressCountry: "BD",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "American International University-Bangladesh (AIUB)",
    },
    knowsAbout: [
      "Computer Vision",
      "Image Processing",
      "Deep Learning",
      "Natural Language Processing",
      "Large Language Models",
      "Robotics",
      "Full-Stack Web Development",
    ],
    sameAs: [
      identity.github,
      identity.linkedin,
      identity.twitter,
      identity.scholar,
      identity.researchgate,
    ],
  };
  return (
    <script
      type="application/ld+json"
      // The payload is built from local constants only -- no user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Runs before first paint. Reading the theme in a React effect instead would
 * mean every visitor whose theme differs from the server default sees a flash
 * of the wrong palette. Kept tiny and dependency-free on purpose.
 */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('portfolio-theme');
    var theme = (stored === 'light' || stored === 'dark')
      ? stored
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="relative min-h-screen overflow-x-hidden bg-ink-950 text-ink-50 antialiased">
        {/* Ambient background layers. Kept subtle so body text stays at AA
            contrast; the film grain and vignette are deliberately faint. */}
        <div className="pointer-events-none fixed inset-0 -z-20 grid-overlay opacity-30" />
        <div className="pointer-events-none fixed inset-0 -z-10 radial-fade" />
        <div className="pointer-events-none fixed inset-0 z-[60] film-grain" />
        <div className="pointer-events-none fixed inset-0 z-[59] vignette" />

        {/* Keyboard users get a way past the nav on every page. */}
        <a
          href="#main-content"
          className="sr-only rounded-md focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-ink-950"
        >
          Skip to content
        </a>

        <MagneticCursor />
        <SiteHeader />
        <main
          id="main-content"
          className="relative mx-auto w-full max-w-shell px-5 pb-24 pt-8 sm:px-6 lg:px-8 2xl:px-12"
        >
          {children}
        </main>
        <SiteFooter />
        <PersonJsonLd />
      </body>
    </html>
  );
}
