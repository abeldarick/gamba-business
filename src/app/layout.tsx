import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GambaProvider } from '@/context/GambaContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileMoneyModal from '@/components/MobileMoneyModal';

export const metadata: Metadata = {
  title: 'GAMBA BUSINESS | Le Bon Coin de Gamba, Gabon - Commerces, Motels & Services',
  description:
    'Tout Gamba dans votre poche ! Trouvez Motels, Restaurants, Bars, Boutiques, Salons de coiffure et Services à Gamba (Gabon). Publiez vos annonces et payez par Airtel Money & Moov Money.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gamba Business',
  },
};

export const viewport: Viewport = {
  themeColor: '#FF6B00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
        <GambaProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileMoneyModal />
        </GambaProvider>
      </body>
    </html>
  );
}
