import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
