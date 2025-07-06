import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProviders";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Economist AI – Expert Economic Analysis & Insights",
  description:
    "The Economist AI:providing expert economic analysis, research workflows, and up-to-date market news.",
  metadataBase: new URL("https://the-economist.vercel.app"),
  icons: {
    icon: "/images/the-economist.jpg",
  },
  openGraph: {
    title: "The Economist AI – Economic Toolkit",
    description:
      "Ask questions, analyze documents, view market data and charts—from Keynesian to Neoclassical perspectives.",
    url: "/",
    siteName: "The Economist AI",
    images: [
      {
        url: "/images/the-economist.jpg",
        width: 1200,
        height: 630,
        alt: "The Economist AI - Economic insights",
      },
    ],
    type: "website",
    locale: "en-US",
  },

  twitter: {
    card: "summary_large_image",
    title: "The Economist AI – Economic Toolkit",
    description:
      "Expert economic analysis, research workflows, and live market news—powered by AI.",
    images: ["/images/the-economist.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </ReactQueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
