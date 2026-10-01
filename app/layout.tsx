import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { AdminProvider } from '@/context/AdminContext';
import LayoutShell from '@/components/LayoutShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://valuecart.in'),
  title: 'ValueCart – Everyday Essentials at Better Prices',
  description:
    'Shop everyday essentials, fashion, home & kitchen products, bags, electronics and more at great prices. Buy online with Cash on Delivery across India.',
  keywords: [
    'ValueCart',
    'Indian e-commerce',
    'Everyday essentials',
    'Kerala online shopping',
    'Budget friendly shopping',
    'Cash on delivery India',
    'Kitchen essentials',
    'Men fashion deals',
  ],
  authors: [{ name: 'ValueCart Retail India' }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/valuecart-favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'ValueCart – Everyday Essentials at Better Prices',
    description:
      'Shop everyday essentials, fashion, home & kitchen products, bags, electronics and more at great prices. Buy online with Cash on Delivery across India.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'ValueCart',
    images: [
      {
        url: '/images/hero-banner.png',
        width: 1200,
        height: 630,
        alt: 'ValueCart - Everyday Essentials at Better Prices',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-valuecart-warm-white text-valuecart-text-main antialiased selection:bg-valuecart-green/20 selection:text-valuecart-navy">
        <AuthProvider>
          <AdminProvider>
            <StoreProvider>
              <LayoutShell>{children}</LayoutShell>
            </StoreProvider>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
