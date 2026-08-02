
import type { Metadata } from 'next';
import './globals.css';
import '@radix-ui/themes/styles.css';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/context/cart-context';
import { AppLayout } from './app-layout';
import type { Viewport } from 'next'
import { AnnouncementPopup } from '@/components/common/announcement-popup';
import { Theme } from '@radix-ui/themes';
import { NotificationListener } from '@/components/common/notification-listener';
 
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: "Eco-Fone Nepal",
    template: "%s | Eco-Fone Nepal",
  },
  description: "Sustainable and affordable phones in Nepal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased transition-colors duration-300">
        <AuthProvider>
          <CartProvider>
            <Theme>
              <AppLayout>
                {children}
              </AppLayout>
            </Theme>
            <AnnouncementPopup />
            <NotificationListener />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
