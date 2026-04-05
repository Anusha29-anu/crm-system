import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';  // ← This is the ONLY place that should import globals.css
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM System - Business Automation Platform',
  description: 'Complete CRM system with lead scoring, deal pipeline, and business automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}