import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const dmSans = DM_Sans({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-dm",
});

export const metadata: Metadata = {
  title: "🔐 Crack the Code – Main Puzzle",
  description: "Enter your group's secret code and unlock the word",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bebasNeue.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
