import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Details } from "@/lib/data";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: Details.name,
  description: "We're here to build a better job market",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={inter.className}>
            {children} <Toaster />
     
        </body>
      </html>
    </SessionProvider>
  );
}
