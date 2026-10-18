import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Set NEXT_PUBLIC_SITE_URL in the Vercel project once the domain is attached.
// Without it, Next builds relative Open Graph URLs and shared links lose their
// preview image - which matters more here than almost anywhere else, because
// sharing is how this product is meant to spread.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://astrawealth.vercel.app";

const title = "AstraWealth - Find your wealth signature";
const description =
  "Pythagorean numerology for founders. Run your business name and your birth date and get your Expression number, Life Path and Founder Archetype, free. For reflection, not financial advice.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "AstraWealth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
