'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import OperativeArtwork from '@/components/OperativeArtwork';

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
    setMobileMenuOpen(false);
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
    { name: 'Target Deck', href: '/dashboard/challenges' },
    { name: 'Leaderboard', href: '/dashboard/leaderboard' },
    { name: 'Killchain Progress', href: '/dashboard/progress' },
  ];

  return (
    <div className="relative z-40 w-full app-container pt-4">
      <header className="site-header w-full rounded-2xl">
        <div className="w-full px-4 sm:px-6 lg:px-7">
          <div className="flex items-center justify-between gap-3 h-16">
            {/* Left: Brand Logo & Desktop Nav Links */}
            <div className="flex items-center gap-4 xl:gap-7 min-w-0">
              <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
                <div className="operative-avatar relative w-9 h-9 rounded-lg bg-[#141920] border border-[#FF6B00]/70 overflow-hidden transition-all group-hover:border-[#FF8533]">
                  <OperativeArtwork
                    alt=""
                    sizes="36px"
                    loading="eager"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono font-black text-base tracking-wider text-[#F5F5F5] group-hover:text-[#FF8533] transition-colors leading-none whitespace-nowrap">
                    SHADOW<span className="text-[#FF6B00]">NET</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#FF9F43] tracking-widest uppercase mt-0.5 font-bold whitespace-nowrap">
                    UNDERGROUND COLLECTIVE
                  </span>
                </div>
              </Link>

              {/* Nav Divider */}
              <div className="hidden lg:block w-px h-5 bg-white/10 flex-shrink-0"></div>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-[#FF6B00]/15 text-[#FF8533] border border-[#FF6B00]/35 shadow-[0_0_8px_rgba(255,107,0,0.15)]'
                          : 'text-[#8B949E] border border-transparent hover:text-[#F5F5F5] hover:bg-white/[0.06]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                {user?.is_admin && (
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ml-1 ${
                      pathname.startsWith('/admin')
                        ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40'
                        : 'text-[#EF4444] hover:bg-[#EF4444]/15 border border-[#EF4444]/30'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse flex-shrink-0"></span>
                    <span>COMMAND CORE</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Right: Live Status Pill + Auth / User Area (Desktop lg+) */}
            <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
              {/* Live Target Status Indicator (shown on xl+ so admin navbar never crowds) */}
              <div className="glass-pill hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono text-[#A4B1CD] whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9FEF00] shadow-[0_0_8px_#9FEF00] animate-pulse flex-shrink-0"></span>
                <span className="text-[#9FEF00] font-bold">NexaCorp Uplink</span>
              </div>

              {!loading && user ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Operative Score Pill */}
                  <div className="glass-pill flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap">
                    <span className="hidden 2xl:inline text-[10px] font-mono text-[#A4B1CD]">OPERATIVE</span>
                    <span className="text-xs font-mono font-bold text-[#F8FAFC] max-w-[110px] truncate">
                      {user.username}
                    </span>
                    <span className="text-white/15">|</span>
                    <span className="text-xs font-mono font-black text-[#9FEF00]">
                      {user.total_points} XP
                    </span>
                    <span className="text-white/15">|</span>
                    <span className="text-xs font-mono text-[#38BDF8] font-bold">
                      {user.challenges_solved}/8
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs font-mono font-semibold text-[#A4B1CD] hover:text-[#F87171] hover:bg-white/[0.06] border border-white/[0.1] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Sign out
                  </button>
                </div>
              ) : !loading ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href="/auth/login"
                    className="btn-secondary text-xs h-9 px-3.5 whitespace-nowrap"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-primary text-xs h-9 px-4 whitespace-nowrap"
                  >
                    Join Collective
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Mobile & Tablet Menu Button (< lg) */}
            <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
              {!loading && user && (
                <div className="glass-pill hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap">
                  <span className="font-bold text-[#F8FAFC] max-w-[90px] truncate">{user.username}</span>
                  <span className="text-white/15">|</span>
                  <span className="font-black text-[#9FEF00]">{user.total_points} XP</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                className="w-10 h-10 p-2 rounded-xl bg-white/[0.05] border border-white/[0.12] text-[#F8FAFC] font-mono text-sm hover:border-[#9FEF00]/50 transition-colors cursor-pointer flex items-center justify-center"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Dropdown Menu (< lg) */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3.5 border-t border-white/[0.08] space-y-2 font-mono text-xs animate-fade-in">
              {user && (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.09] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#A4B1CD] text-[10px]">OPERATIVE</span>
                    <span className="font-bold text-[#F8FAFC] truncate">{user.username}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-black text-[#9FEF00]">{user.total_points} XP</span>
                    <span className="text-[#38BDF8] font-bold">({user.challenges_solved}/8)</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-1.5">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3.5 py-2.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-[#9FEF00]/15 text-[#9FEF00] font-bold border border-[#9FEF00]/40'
                          : 'text-[#A4B1CD] hover:text-[#F8FAFC] hover:bg-white/[0.05] border border-transparent'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                {user?.is_admin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold transition-colors ${
                      pathname.startsWith('/admin')
                        ? 'text-[#9FEF00] bg-[#9FEF00]/15 border border-[#9FEF00]/45'
                        : 'text-[#9FEF00] bg-[#9FEF00]/10 border border-[#9FEF00]/30'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9FEF00] animate-pulse"></span>
                    <span>COMMAND CORE</span>
                  </Link>
                )}
              </div>

              <div className="pt-2.5 mt-1 border-t border-white/[0.08] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#9FEF00]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9FEF00] animate-pulse"></span>
                  <span>NexaCorp Uplink</span>
                </div>

                {!loading && user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="px-3.5 py-2 text-[#F87171] bg-[#F87171]/10 border border-[#F87171]/30 hover:bg-[#F87171]/20 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                ) : null}
              </div>

              {!loading && !user && (
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary text-center flex-1 text-xs py-2"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary text-center flex-1 text-xs py-2"
                  >
                    Join Collective
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
