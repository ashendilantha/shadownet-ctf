import type { Metadata } from 'next';
import './globals.css';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ShadowNet CTF | Enterprise Cyber Range & Threat Simulation',
  description: 'Multi-stage enterprise penetration testing CTF simulation platform. Infiltrate simulated corporate perimeters across 8 progressive killchain vectors.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#090B0D]">
      <body className="bg-[#090B0D] bg-cyber-grid bg-cyber-radial text-[#F5F5F5] min-h-screen flex flex-col antialiased selection:bg-[#FF6B00]/25 selection:text-[#FF9F43] overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full app-container py-6 sm:py-8 lg:py-10 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
