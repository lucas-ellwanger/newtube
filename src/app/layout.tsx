import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NewTube",
  description:
    "Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on NewTube.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <TRPCProvider>
            <Toaster theme="light" />
            {children}
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
