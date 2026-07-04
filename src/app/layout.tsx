import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { App3DProvider } from "@/components/3d/app-3d-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Professional Network for Students`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Build your portfolio, showcase projects, connect globally, and grow from age 5 to professional with ScholarNet.",
  keywords: ["student network", "portfolio", "education", "career", "skills"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <App3DProvider>{children}</App3DProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
