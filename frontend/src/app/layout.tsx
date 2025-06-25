import type { Metadata } from 'next';
import './globals.css';
import BackgroundOverlay from '@/components/background/overlay';
import { Toaster } from '@/components/ui/sonner';
import Footer from '@/components/footer/footer';

export const metadata: Metadata = {
  title: 'Poké league',
  description: 'Pokemon battle simulation game. Created by Dushyant25609 just for fun',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-image bg-cover bg-center h-screen bg-no-repeat flex flex-col justify-between">
        <BackgroundOverlay />
        <Toaster />
        {children}
        <Footer />
      </body>
    </html>
  );
}
