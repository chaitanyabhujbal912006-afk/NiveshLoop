import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NiveshLoop — Learn Indian Stock Market Investing by Doing",
  description:
    "Free, ad-free educational app connecting Indian stock market lessons directly to simulated trades. ₹1,00,000 virtual portfolio. No real money required.",
  keywords: [
    "Indian stock market",
    "paper trading",
    "learn investing India",
    "NIFTY 50 simulator",
    "SEBI scam checker",
    "stock trading for beginners",
    "NiveshLoop",
  ],
  authors: [{ name: "NiveshLoop Team" }],
  metadataBase: new URL("https://niveshloop.vercel.app"),
  openGraph: {
    title: "NiveshLoop — Learn Stock Market Investing (₹1,00,000 Free Practice)",
    description:
      "The only app connecting stock market lessons directly to simulated trades and reflecting your behavior back to you.",
    url: "https://niveshloop.vercel.app",
    siteName: "NiveshLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NiveshLoop — Learn Indian Stock Market Investing by Doing",
    description:
      "Connect every lesson to a simulated trade. ₹1,00,000 virtual cash. Zero real money.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#E9EFE7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink font-body min-h-screen selection:bg-stamp/20">
        {children}
      </body>
    </html>
  );
}
