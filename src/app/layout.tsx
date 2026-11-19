import type { Metadata } from 'next';
import './globals.css';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ShadowNet CTF | NexaCorp Infiltration Campaign',
  description: 'Underground collective cyber warfare CTF simulation. Infiltrate simulated NexaCorp corporate perimeters and internal datacenters across 8 progressive killchain vectors.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#070B14]">
      <body className="relative bg-[#070B14] text-[#F5F5F5] min-h-screen flex flex-col antialiased overflow-x-hidden">
        {/* Ambient Cyber Glass Backdrop */}
        <div className="ambient-glass-backdrop" aria-hidden="true">
          <div className="ambient-orb ambient-orb-lime" />
          <div className="ambient-orb ambient-orb-cyan" />
          <div className="ambient-orb ambient-orb-amber" />
          <div className="ambient-grid-layer" />
        </div>

        <Navbar />
        <main className="relative z-10 flex-1 w-full app-container py-6 sm:py-8 lg:py-10 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
