import type { Metadata } from "next";

import "./globals.css";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/lib/fonts";
import { TailwindIndicator } from "@/components/custom/tailwind-indicator";
import { ThemeProvider } from "@/components/custom/theme-provider";

import ArweaveProvider from "./providers/providers";
import Navbar from "@/components/custom/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ArweaveProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            {children}
            <TailwindIndicator />
          </ThemeProvider>
        </ArweaveProvider>
      </body>
    </html>
  );
}
