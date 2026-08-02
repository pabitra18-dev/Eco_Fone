
import Image from "next/image";
import Link from "next/link";
import { Diamond, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import imageData from '@/lib/placeholder-images.json';
import { calculateAverageRating } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  
  const conditionBadgeVariant = (condition: Product['condition']): "default" | "secondary" | "outline" | "destructive" => {
      switch(condition) {
          case 'Excellent': return 'default';
          case 'Very Good': return 'secondary';
          case 'Good': return 'outline';
          case 'Fair': return 'destructive';
          default: return 'outline';
      }
  }

  const productUrl = `/products/${product.slug}`;
  const averageRating = calculateAverageRating(product.categories);

  return (
    <Link href={productUrl} className="group block h-full">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
            <CardHeader className="p-0 relative">
                <div className="aspect-[4/3] w-full bg-muted/30 overflow-hidden">
                    <Image
                        src={product.images[0] || imageData.defaultPlaceholder.src}
                        alt={product.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={`${product.brand} smartphone`}
                    />
                </div>
                {product.featured && <Badge className="absolute top-2 left-2 z-10" variant="default">Featured</Badge>}
                <Badge variant={conditionBadgeVariant(product.condition)} className="absolute top-2 right-2 z-10">
                    {product.condition}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
                  <CardTitle className="text-lg leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">{product.name}</CardTitle>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-0.5 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                    {product.categories?.valueForMoney && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                            <Diamond className="w-3.5 h-3.5 text-primary" />
                            <span>{product.categories.valueForMoney} Value</span>
                        </div>
                    )}
                    <div>
                        <p className="text-xl font-bold text-primary">NPR {product.price.toLocaleString()}</p>
                        {product.originalPrice && (
                            <p className="text-sm text-muted-foreground line-through">NPR {product.originalPrice.toLocaleString()}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    </Link>
  );
}

    