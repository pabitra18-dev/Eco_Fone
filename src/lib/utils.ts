import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ProductCategories, ProductCategoryRating } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
  }).format(price);
}

export function generateSlug(name: string, id: string): string {
    const slugPart = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters except spaces and hyphens
        .trim()
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // replace multiple hyphens with a single one
    
    const idPart = id.substring(0, 7); // use a portion of the ID for uniqueness

    return `${slugPart}-${idPart}`;
}

export function convertGoogleDriveLink(url: string): string {
  if (url && url.includes('drive.google.com')) {
    const match = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  return url;
}

const RATING_MAP: Record<ProductCategoryRating, number> = {
  'GOAT': 5,
  'Great': 4,
  'Good': 3,
  'OK': 2,
};

export function calculateAverageRating(categories?: Partial<ProductCategories>): number {
  if (!categories) return 0;

  const ratings = Object.values(categories)
    .filter((rating): rating is ProductCategoryRating => !!rating && rating in RATING_MAP)
    .map(rating => RATING_MAP[rating]);

  if (ratings.length === 0) return 0;

  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return sum / ratings.length;
}
