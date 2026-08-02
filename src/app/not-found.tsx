
import Link from 'next/link';
import { Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4 py-8">
      <Frown className="w-24 h-24 text-primary mb-4" />
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <h2 className="mt-2 text-2xl font-semibold text-foreground">Page Not Found</h2>
      <p className="mt-4 max-w-md text-muted-foreground">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <p>You can checkout our Products or even can sell yours!</p>
      <Button asChild className="mt-8">
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  );
}
