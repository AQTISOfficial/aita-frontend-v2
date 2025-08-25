// app/layout.tsx

// Root Layout
// -----------
// Purpose: Global application shell for all pages.
// Notes:
// - Wraps the entire app with Providers (wagmi, RainbowKit, React Query, etc.).
// - Includes global UI chrome: sidebar, header, and main content area.
// - Loads Montserrat Google Font as CSS variable (--font-montserrat).
// - Defines app-wide metadata (title + description).
// - Uses Next.js App Router <html> and <body> tags with dark theme.

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LayoutSidebar } from "@/components/layout-sidebar";
import { SiteHeader } from "@/components/site-header";

import Providers from "./providers";

import "./globals.css";

// Font: Montserrat, multiple weights, exported as CSS variable
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// Global metadata (SEO + browser title)
export const metadata: Metadata = {
  title: "AITA Protocol",
  description: "AI Trading Agents",
};

// Root layout applied to all routes
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${montserrat.variable} antialiased`}>
        <Providers>
          <SidebarProvider>
            {/* Left sidebar navigation */}
            <LayoutSidebar variant="inset" />

            <SidebarInset>
              {/* Sticky site header */}
              <SiteHeader />

              {/* Page content */}
              <main className="p-4">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
