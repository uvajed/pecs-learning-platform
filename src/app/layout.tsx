import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "PECS Learn - Picture Exchange Communication System",
  description:
    "A learning platform for the Picture Exchange Communication System (PECS), designed for children with autism and their support network.",
  keywords: ["PECS", "autism", "communication", "AAC", "learning", "children"],
  authors: [{ name: "PECS Learn" }],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#5B8A72",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
          <footer className="fixed bottom-2 left-1/2 -translate-x-1/2 text-xs opacity-40 z-10">
            Powered by <a href="https://www.e-studios.net" target="_blank" rel="noopener" className="underline">e·studios</a>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
