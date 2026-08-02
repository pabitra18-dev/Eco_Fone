
'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/common/theme-provider';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { Toaster } from '@/components/ui/toaster';
import { useEffect, useState } from 'react';
import { getSettings } from '@/lib/settings';
import type { SiteSettings } from '@/lib/types';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/auth');
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  if (isAdminRoute) {
    return (
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
      >
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <div className="flex flex-col min-h-screen">
        {!isAuthRoute && <Header />}
        <main className={cn("flex-grow", isAuthRoute && "flex items-center justify-center")}>
            {children}
        </main>
        {!isAuthRoute && <Footer settings={settings} />}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
