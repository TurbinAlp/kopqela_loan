import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ToastContainer from "./components/notifications/ToastContainer";
import { AuthProvider } from "./components/providers/AuthProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Koppela - Sales & Credit Management",
  description: "Modern sales and credit management system for wholesale and retail businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LanguageProvider>
            <NotificationProvider>
              {children}
              <ToastContainer />
            </NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
