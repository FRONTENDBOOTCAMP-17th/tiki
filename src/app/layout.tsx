import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import { Toaster } from "sonner";
import FloatingActions from "@/components/FloatingActions";
import ThemeInitScript from "@/components/theme/ThemeInitScript";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tiki-final.vercel.app"),
  title: {
    default: "TiKi - 티켓 마켓",
    template: "%s | TiKi",
  },
  description:
    "티켓팅의 설렘이 공연이 끝난 뒤에도 오래 남도록. 같은 순간을 사랑하는 사람들과 연결되는 티켓 마켓, TiKi.",
  keywords: ["티켓", "공연", "예매", "콘서트", "티켓팅", "TiKi"],
  openGraph: {
    type: "website",
    siteName: "TiKi",
    title: "TiKi - 티켓 마켓",
    description:
      "티켓팅의 설렘이 공연이 끝난 뒤에도 오래 남도록. 같은 순간을 사랑하는 사람들과 연결되는 티켓 마켓.",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ToastProvider animation="slide" position="bottom-center">
            {children}
            <Toaster
              position="top-center"
              richColors
              toastOptions={{
                style: {
                  borderRadius: "12px",
                  fontSize: "14px",
                },
              }}
            />
            <FloatingActions />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
