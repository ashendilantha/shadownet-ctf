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
    is_admin?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { name: 'CHALLENGES', href: '/dashboard/challenges', authRequired: true },
    { name: 'SCOREBOARD', href: '/dashboard/leaderboard', authRequired: false },
    { name: 'PROGRESS MAP', href: '/dashboard/progress', authRequired: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#111417]/90 border-b border-[#252A30] backdrop-blur-md">
      <div className="w-full app-container">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#171B20] border border-[#FF6B00]/60 flex items-center justify-center font-mono font-bold text-[#FF6B00] text-xl shadow-[0_0_15px_rgba(255,107,0,0.3)] group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-black text-xl tracking-wider text-[#F5F5F5] group-hover:text-[#FF6B00] transition-colors">
                  SHADOW<span className="text-[#FF6B00]">NET</span>
                </span>
                <span className="text-[10px] font-mono text-[#22D3EE] tracking-widest uppercase -mt-0.5">
                  CYBER RANGE CTF
                </span>
              </div>
            </Link>

            {/* Live Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#171B20] border border-[#252A30] rounded-full text-xs font-mono text-[#8B949E] ml-4">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              <span className="text-[#22D3EE] font-semibold">RANGE_ONLINE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-150 ${
                    isActive
                      ? 'bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/40 shadow-[0_0_10px_rgba(255,107,0,0.2)]'
                      : 'text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#171B20]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            {user?.is_admin && (
              <Link
                href="/admin"
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-150 flex items-center gap-2 ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'text-[#EF4444] hover:bg-[#EF4444]/15 border border-[#EF4444]/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
                ⚡ ADMIN PANEL
              </Link>
            )}
          </nav>

          {/* User / Auth State */}
          <div className="hidden sm:flex items-center gap-4">
            {!loading && user ? (
              <div className="flex items-center gap-3">
                {/* Score Pill */}
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#171B20] border border-[#252A30] rounded-lg">
                  <span className="text-xs font-mono text-[#8B949E]">OPERATIVE:</span>
                  <span className="text-xs font-mono font-bold text-[#F5F5F5]">
                    {user.username}
                  </span>
                  <span className="text-[#252A30]">|</span>
                  <span className="text-xs font-mono font-bold text-[#FF6B00]">
                    {user.total_points} XP
                  </span>
                  <span className="text-[#252A30]">|</span>
                  <span className="text-xs font-mono text-[#22D3EE]">
                    {user.challenges_solved}/8
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-mono font-bold text-[#8B949E] hover:text-[#EF4444] hover:bg-[#171B20] border border-[#252A30] rounded-lg transition-colors cursor-pointer"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="btn-secondary text-xs px-4 py-2"
                >
                  LOGIN
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-xs px-5 py-2"
                >
                  REGISTER →
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg bg-[#171B20] border border-[#252A30] text-[#F5F5F5] font-mono text-sm"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#252A30] space-y-2 font-mono text-xs">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-[#8B949E] hover:text-[#FF6B00] hover:bg-[#171B20]"
              >
                {link.name}
              </Link>
            ))}
            {user?.is_admin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 font-bold"
              >
                ⚡ ADMIN PANEL
              </Link>
            )}
            <div className="pt-2 border-t border-[#252A30] flex flex-col gap-2">
              {!loading && user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-[#EF4444]"
                >
                  LOGOUT ({user.username})
                </button>
              ) : (
                <div className="flex items-center gap-2 px-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary text-center flex-1 text-xs py-2"
                  >
                    LOGIN
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary text-center flex-1 text-xs py-2"
                  >
                    REGISTER
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
