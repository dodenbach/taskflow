'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg">
          TaskFlow
        </Link>
        <div className="flex gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              pathname === '/'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Board
          </Link>
          <Link
            href="/chat"
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              pathname === '/chat'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            AI Chat
          </Link>
        </div>
      </div>
    </nav>
  );
}
