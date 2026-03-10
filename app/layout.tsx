import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { Providers } from "@/components/Providers";
import { ErrorSuppressor } from "@/components/ErrorSuppressor";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Incarbooks | Digital Content & eBooks",
  description: "Unlimited access to premium eBooks, audiobooks, and exclusive digital courses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} bg-[#F3F8F5] text-[#1E293B] antialiased selection:bg-emerald-200 selection:text-emerald-900`}
      >
        <Providers>
          <ErrorSuppressor />
          {children}
        </Providers>
      </body>
    </html>
  );
}
