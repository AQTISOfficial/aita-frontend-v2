import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LayoutSidebar } from "@/components/layout-sidebar";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});


export const metadata: Metadata = {
  title: "AITA Protocol",
  description: "AI Trading Agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${montserrat.variable} antialiased`}
      >
        
        <SidebarProvider>
          <LayoutSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <main className="p-4">
              {children}
            </main>
            </SidebarInset>
        </SidebarProvider>

        
      </body>
    </html>
  );
}
