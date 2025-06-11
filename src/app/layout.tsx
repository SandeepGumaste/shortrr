import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/providers";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "shortrr - URL Shortener",
  description: "A modern URL shortener with QR code generation",
  keywords: ["URL shortener", "link shortener", "QR code"],
  authors: [{ name: "shortrr" }],
  creator: "shortrr",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shortrr.com",
    title: "shortrr - URL Shortener",
    description: "A modern URL shortener with QR code generation",
    siteName: "shortrr",
  },
  twitter: {
    card: "summary_large_image",
    title: "shortrr - URL Shortener",
    description: "A modern URL shortener with QR code generation",
    creator: "@shortrr",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>
          <ThemeProvider
            defaultTheme="system"
            storageKey="url-shortener-theme"
          >
            <Navbar />
            {children}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
