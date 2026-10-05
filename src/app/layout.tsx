import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ShadowNet CTF | Cyber Range & Attack Simulation',
  description: 'Multi-stage enterprise CTF challenge platform featuring OSINT, Stego, Cryptography, Web Security, Scripting, Reverse Engineering, Linux PrivEsc, and Network Pivoting.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="bg-[#090B0D] text-[#F5F5F5] min-h-screen flex flex-col antialiased selection:bg-[#FF6B00]/30 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
