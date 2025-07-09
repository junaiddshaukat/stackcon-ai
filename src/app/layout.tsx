import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/components/auth-provider';
import Header from '@/components/header';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StackCon - AI-Powered Developer Resources",
  description: "Discover the perfect tech stack for your project with AI-powered recommendations and access to 500+ curated development resources.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
