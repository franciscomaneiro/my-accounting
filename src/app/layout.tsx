import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FinanceProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Cashflow & AI Budgeting',
  description: 'Gestor de finanzas personales bi-semanales con asesor financiero Gemini IA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cashflow AI',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cashflow AI" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-black">
        <FinanceProvider>
          {children}
        </FinanceProvider>
      </body>
    </html>
  );
}
