
'use client';

import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductImages } from "@/components/products/product-images";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Star, Smartphone, Cpu, MemoryStick, Camera, Battery, ListChecks, Volume2, Wifi, Share2, UserCircle, Tv } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { useEffect, useState, useCallback } from "react";
import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateAverageRating } from "@/lib/utils";

function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                <div className="space-y-4">
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <div className="grid grid-cols-4 gap-2">
                        <Skeleton className="w-full aspect-square rounded-lg" />
                        <Skeleton className="w-full aspect-square rounded-lg" />
                        <Skeleton className="w-full aspect-square rounded-lg" />
                        <Skeleton className="w-full aspect-square rounded-lg" />
                    </div>
                </div>
                <div>
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-10 w-3/4 mb-1" />
                    <Skeleton className="h-6 w-1/4 mb-3" />
                    <Skeleton className="h-5 w-1/2 mb-4" />
                    <Skeleton className="h-8 w-1/3 mb-6" />
                    <Skeleton className="h-12 w-full mb-2" />
                    <div className="p-6 border rounded-lg">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-5 w-20 mx-auto mt-4" />
                    </div>
                </div>
            </div>
        </div>
    )
}

const SpecDetail = ({ label, value }: { label: string; value: React.ReactNode }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="grid grid-cols-3 gap-2 border-b py-3 text-sm last:border-b-0">
            <p className="col-span-1 text-muted-foreground capitalize">{label.replace(/_/g, ' ')}</p>
            <p className="col-span-2 text-foreground font-medium text-right">{value}</p>
        </div>
    );
};


export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, allProductsRes] = await Promise.all([
          fetch(`/api/products/${slug}`),
          fetch('/api/products'),
        ]);

        if (!productRes.ok) {
          throw new Error('Product not found from API');
        }

        const productData: Product = await productRes.json();
        const allProductsData: Product[] = await allProductsRes.json();
        
        setProduct(productData);
        setRelatedProducts(allProductsData.filter(p => p.brand === productData.brand && p.id !== productData.id).slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch product data", error);
        setProduct(null); // Explicitly set to null on error
        toast({ title: "Error", description: "Could not load product details.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, toast]);

const handleShare = useCallback(async () => {
    if (!product) return;

    const shareData = {
        title: product.name,
        text: `Check out the ${product.name} on Eco-Fone Nepal!`,
        url: window.location.href,
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link Copied!",
                description: "The product link has been copied to your clipboard.",
            });
        } else {
            // Fallback for insecure contexts (HTTP) or older browsers
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            textArea.style.position = "absolute";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            toast({
                title: "Link Copied!",
                description: "The product link has been copied to your clipboard.",
            });
        }
    } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.error('Error sharing or copying:', error);
            toast({
                title: "Error",
                description: "Could not share or copy the product link.",
                variant: "destructive"
            });
        }
    }
}, [product, toast]);

  
  if (loading) {
    return <ProductDetailSkeleton />;
  }
  
  if (!product) {
      // This will be shown if fetching fails or product is null
      notFound();
      return null;
  }
  
  const averageRating = calculateAverageRating(product.categories);


  const specGroups = [
    { title: 'Network', icon: Wifi, data: { Technology: product.specs.network } },
    { title: 'Body', icon: Smartphone, data: { Dimensions: product.specs.dimensions, Weight: product.specs.weight, Build: product.specs.build, SIM: product.specs.sim } },
    { title: 'Display', icon: Tv, data: product.specs.display },
    { title: 'Platform', icon: Cpu, data: product.specs.platform },
    { title: 'Memory', icon: MemoryStick, data: product.specs.memory },
    { title: 'Main Camera', icon: Camera, data: product.specs.mainCamera },
    { title: 'Selfie Camera', icon: UserCircle, data: product.specs.selfieCamera },
    { title: 'Sound', icon: Volume2, data: product.specs.sound },
    { title: 'Features', icon: ListChecks, data: { Sensors: product.specs.features?.join(', ') } },
    { title: 'Battery', icon: Battery, data: product.specs.battery },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">All Phones</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          <div className="md:sticky md:top-24 h-fit">
            <ProductImages images={product.images} productName={product.name} />
          </div>
          
          <div>
            <Badge variant={product.condition === 'Excellent' ? 'default' : 'secondary'} className="mb-2">{product.condition} Condition</Badge>
            <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-lg mt-1 text-muted-foreground">{product.brand}</p>
            
             {averageRating > 0 && (
                <div className="flex items-center mt-3 gap-2">
                    <div className="flex items-center text-primary">
                        {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`h-5 w-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                        />
                        ))}
                    </div>
                    <span className="text-muted-foreground text-sm">({averageRating.toFixed(1)} based on category ratings)</span>
                </div>
              )}
            
            <div className="flex items-baseline gap-2 my-4">
              <p className="text-3xl font-bold text-primary">NPR {product.price.toLocaleString()}</p>
              {product.originalPrice && (
                <p className="text-lg text-muted-foreground line-through">NPR {product.originalPrice.toLocaleString()}</p>
              )}
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
            
            <Card className="bg-muted/50">
                <CardContent className="p-6">
                    <AddToCartButton product={product} />
                    <p className="text-sm text-center text-muted-foreground mt-4">
                        {product.stock > 0 ? `${product.stock} units in stock` : "Out of stock"}
                    </p>
                </CardContent>
            </Card>

            <div className="mt-6 flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
                <span className="text-sm text-muted-foreground">Share this product</span>
            </div>
          </div>
        </div>

        <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">Technical Specifications</h2>
            <div className="md:columns-2 md:gap-6 lg:columns-3 lg:gap-8 space-y-6">
                {specGroups.map(group => {
                     const dataEntries = Object.entries(group.data);
                     const hasData = dataEntries.some(([, value]) => value && (!Array.isArray(value) || value.length > 0));
                     if (!hasData) return null;

                    return (
                        <Card key={group.title} className="break-inside-avoid">
                            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                                <group.icon className="h-6 w-6 text-primary" />
                                <CardTitle className="text-lg">{group.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                               {dataEntries.map(([key, value]) => (
                                   <SpecDetail key={key} label={key} value={value} />
                               ))}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>

        {relatedProducts.length > 0 && (
            <div className="mt-20">
                <h2 className="text-3xl font-bold text-center mb-8">Related Products</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedProducts.map(relatedProduct => (
                        <ProductCard key={relatedProduct.id} product={relatedProduct} />
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

    