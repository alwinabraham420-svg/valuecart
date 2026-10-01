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

import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
        {pixelId && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
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
