import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "@/lib/app-context";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "e-Hinga AI",
  description: "The AI Agronomist in Every Farmer's Pocket",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "e-Hinga AI" },
};

export const viewport: Viewport = {
  themeColor: "#2E7D32",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="rw">
      <body className={`${sans.variable} font-sans antialiased`} style={{ ["--font-display" as string]: "var(--font-sans)" }}>
        <AppProvider>
          <div className="relative mx-auto min-h-dvh w-full max-w-md overflow-x-hidden bg-transparent">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
