import { Navbar } from "@/components/layout/Navbar";
import { SidebarWrapper } from "@/components/layout/SidebarWrapper";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Bricolage_Grotesque, Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "A17.chat",
  description: "A17.chat - A fast and simple chat application built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">
        <SidebarLayout sidebar={<SidebarWrapper />} navbar={<Navbar />}>
          {children}
        </SidebarLayout>
      </body>
    </html>
  );
}
