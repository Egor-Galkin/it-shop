import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { ConfirmProvider } from "@/providers/ConfirmProvider";
import { Toast } from "@/components/ui/Toast/Toast";
import { BackgroundPattern } from "@/components/layout/BackgroundPattern/BackgroundPattern";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ITshop",
  description: "Интернет-магазин электроники",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <ReduxProvider>
          <ConfirmProvider>
            <Toast />
            <BackgroundPattern />
            {/* ✅ Здесь нет Header и Footer. Они появятся только внутри (main) */}
            {children}
          </ConfirmProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}