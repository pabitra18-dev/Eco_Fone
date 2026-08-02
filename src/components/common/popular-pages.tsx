import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PopularPages() {
  const pages = [
    { name: 'Warranty Claims', href: '/warranty-and-returns#warranty' },
    { name: 'Returns & Refunds', href: '/warranty-and-returns#returns' },
    { name: 'Shipping Info', href: '/faq' }, 
    { name: 'Terms of Service', href: '/terms-of-service' },
  ];
  return (
    <div className="mt-16 border-t pt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Popular Pages</h2>
        <div className="flex flex-wrap justify-center gap-4">
            {pages.map(page => (
                <Button key={page.name} variant="outline" asChild>
                    <Link href={page.href}>{page.name}</Link>
                </Button>
            ))}
        </div>
    </div>
  )
}