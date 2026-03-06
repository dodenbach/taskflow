import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import '@/globals.css';

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'AI-powered project management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
