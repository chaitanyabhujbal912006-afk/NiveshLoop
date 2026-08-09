import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NiveshLoop — learn investing by doing it (with fake money)",
  description:
    "A free, ad-free way to learn Indian stock-market investing: every lesson connects to a real simulated trade. No real money, ever.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-body min-h-screen">
        {children}
      </body>
    </html>
  );
}
