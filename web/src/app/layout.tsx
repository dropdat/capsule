import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk, DM_Mono } from "next/font/google";
import { ClerkClientProvider } from "@/components/ClerkClientProvider";
import { FlowingLines } from "@/components/FlowingLines";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "dropdat — Cross-AI memory in one click",
  description:
    "Capture any AI chat as a portable capsule. Drop it into ChatGPT, Claude, Gemini and resume the conversation instantly.",
  icons: { icon: "/seo/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="ambient-wash" aria-hidden />
        <FlowingLines />
        <ClerkClientProvider>{children}</ClerkClientProvider>
      </body>
    </html>
  );
}
