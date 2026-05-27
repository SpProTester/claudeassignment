import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Job Portal — Find Your Dream Job",
    template: "%s | Job Portal",
  },
  description:
    "Discover thousands of job opportunities. Connect top talent with leading companies. Your career journey starts here.",
  keywords: ["jobs", "careers", "recruitment", "hiring", "employment"],
  authors: [{ name: "Job Portal" }],
  creator: "Job Portal",
  metadataBase: new URL(process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Job Portal",
    title: "Job Portal — Find Your Dream Job",
    description: "Discover thousands of job opportunities. Connect top talent with leading companies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Job Portal — Find Your Dream Job",
    description: "Discover thousands of job opportunities. Connect top talent with leading companies.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
