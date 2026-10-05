'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    username: string;
    total_points: number;
    challenges_solved: number;
    team_name?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      router.push('/auth/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = [
    { name: 'CHALLENGES', href: '/dashboard/challenges' },
    { name: 'LEADERBOARD', href: '/dashboard/leaderboard' },
    { name: 'PROGRESS', href: '/dashboard/progress' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#111417] border-b border-[#252A30] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded bg-[#171B20] border border-[#FF6B00]/60 flex items-center justify-center font-mono font-bold text-[#FF6B00] shadow-[0_0_10px_rgba(255,107,0,0.3)] group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-black text-lg tracking-wider text-[#F5F5F5] group-hover:text-[#FF6B00] transition-colors">
                  SHADOW<span className="text-[#FF6B00]">NET</span>
                </span>
                <span className="text-[10px] font-mono text-[#22D3EE] tracking-widest uppercase -mt-1">
                  CYBER RANGE
                </span>
              </div>
            </Link>

            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#171B20] border border-[#252A30] rounded-full text-xs font-mono text-[#8B949E] ml-4">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              <span className="text-[#22D3EE]">SYS_ONLINE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded text-xs font-mono font-semibold tracking-wider transition-all duration-150 ${
                    isActive
                      ? 'bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/40 shadow-[0_0_8px_rgba(255,107,0,0.2)]'
                      : 'text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#171B20]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User / Auth State */}
          <div className="flex items-center gap-3">
            {!loading && user ? (
              <div className="flex items-center gap-3">
                {/* Score Pill */}
                <div className="flex items-center gap-2 px-3 py-1 bg-[#171B20] border border-[#252A30] rounded">
                  <span className="text-xs font-mono text-[#8B949E]">XP:</span>
                  <span className="text-xs font-mono font-bold text-[#FF6B00]">
                    {user.total_points}
                  </span>
                  <span className="text-[#252A30]">|</span>
                  <span className="text-xs font-mono text-[#22D3EE]">
                    {user.challenges_solved}/8 Solved
                  </span>
                </div>

                {/* User Dropdown / Name */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-[#F5F5F5] hidden sm:inline">
                    {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-2.5 py-1 text-xs font-mono text-[#8B949E] hover:text-[#EF4444] hover:bg-[#171B20] border border-[#252A30] rounded transition-colors"
                    title="Logout"
                  >
                    LOGOUT
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 text-xs font-mono font-semibold text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#171B20] rounded border border-[#252A30] transition-colors"
                >
                  LOGIN
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3.5 py-1.5 text-xs font-mono font-bold text-black bg-[#FF6B00] hover:bg-[#FF9F43] rounded shadow-[0_0_10px_rgba(255,107,0,0.3)] transition-all"
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
