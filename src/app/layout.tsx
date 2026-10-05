import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ShadowNet CTF | Enterprise Attack Simulation & Cyber Range',
  description: 'Enterprise multi-stage penetration testing CTF simulation platform. Infiltrate simulated corporate networks across 8 progressive killchain stages.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#090B0D]">
      <body className="bg-[#090B0D] bg-cyber-grid bg-cyber-radial text-[#F5F5F5] min-h-screen flex flex-col antialiased selection:bg-[#FF6B00]/30 selection:text-white overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full app-container py-8 sm:py-12 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
