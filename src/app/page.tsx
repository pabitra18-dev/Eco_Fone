
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, ShieldCheck, Heart, ArrowRight, Star, Recycle, PackageCheck, Headset, Loader2, CheckSquare } from 'lucide-react';
import { getProducts } from '@/lib/products';
import { getTestimonials } from '@/lib/testimonials';
import { ProductCard } from '@/components/product-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { Product, Testimonial } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import imageData from '@/lib/placeholder-images.json';

const HomePageSkeleton = () => (
    <div className="container mx-auto px-4 py-12">
        {/* Hero Section Skeleton */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <Skeleton className="h-6 w-48 rounded-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-10 w-4/5" />
                <Skeleton className="h-8 w-full max-w-lg" />
                <div className="flex gap-4">
                    <Skeleton className="h-12 w-36 rounded-full" />
                    <Skeleton className="h-12 w-36 rounded-full" />
                </div>
            </div>
            <div className="hidden lg:block">
                <Skeleton className="h-[450px] w-full max-w-sm mx-auto rounded-xl" />
            </div>
        </div>

        {/* Featured Products Skeleton */}
        <div className="py-24">
            <div className="text-center mb-12">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <Skeleton className="h-48 w-full" />
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-8 w-1/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </div>
);


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, testimonialsData] = await Promise.all([
          getProducts(),
          getTestimonials(),
        ]);
        setProducts(productsData);
        setTestimonials(testimonialsData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching homepage data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredProducts = products.filter(p => p.featured);
  const heroProduct = products.find(p => p.hero) || null;

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (error) {
    return (
      <main>
        <div className="container mx-auto px-4 py-12 text-center text-destructive">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="bg-background text-foreground relative pt-8 pb-8 md:py-12">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-start text-left">
              <div className="inline-flex items-center bg-primary/10 text-primary text-sm font-semibold mb-4 px-4 py-1.5 rounded-full">
                <Leaf className="h-4 w-4 mr-2" aria-hidden="true" />
                Sustainable Tech Solutions
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Your Next <span className="text-primary">Smart Phone</span> Awaits
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                Discover premium pre-owned smartphones at unbeatable prices. Quality guaranteed, planet-friendly, and perfect for students and budget-conscious buyers.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-full px-8" aria-label="Shop now">
                  <Link href="/products">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8" aria-label="Sell your phone">
                  <Link href="/sell">
                    Sell Your Phone
                  </Link>
                </Button>
              </div>
              <div className="mt-6 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-card p-4 rounded-xl border space-y-3">
                    <div className="text-primary bg-primary/10 p-2 rounded-lg w-fit">
                      <Leaf className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold">Eco-Friendly</p>
                      <p className="text-sm text-muted-foreground">Reduce e-waste</p>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-xl border space-y-3">
                    <div className="text-primary bg-primary/10 p-2 rounded-lg w-fit">
                      <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold">Quality Tested</p>
                      <p className="text-sm text-muted-foreground">100% verified</p>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-xl border space-y-3">
                    <div className="text-primary bg-primary/10 p-2 rounded-lg w-fit">
                      <Heart className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold">Fair Prices</p>
                      <p className="text-sm text-muted-foreground">Up to 60% off</p>
                    </div>
                  </div>
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center">
              {heroProduct ? (
                <Link href={`/products/${heroProduct.slug}`} className="group block">
                  <div className="relative w-full max-w-sm">
                    <div className="bg-card p-3 rounded-2xl shadow-2xl transition-all group-hover:ring-2 group-hover:ring-primary">
                      <Image
                        src={heroProduct.images[0]}
                        alt={heroProduct.name}
                        width={500}
                        height={500}
                        className="rounded-xl w-full h-auto transition-transform group-hover:scale-105 duration-300"
                        priority
                      />
                    </div>
                     <div className="absolute top-4 left-4 bg-card border text-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center shadow-md">
                      <span className="w-2 h-2 bg-primary rounded-full mr-2"></span> In Stock
                    </div>
                  </div>
                </Link>
              ) : (
                 <div className="relative w-full max-w-sm">
                    <div className="bg-card p-3 rounded-2xl shadow-2xl">
                      <Image
                        src={imageData.defaultPlaceholder.src}
                        alt={imageData.defaultPlaceholder.alt}
                        width={500}
                        height={500}
                        className="rounded-xl w-full h-auto"
                        data-ai-hint={imageData.defaultPlaceholder.aiHint}
                        priority
                      />
                    </div>
                    <div className="absolute top-4 left-4 bg-card border text-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center shadow-md">
                      <span className="w-2 h-2 bg-primary rounded-full mr-2"></span> In Stock
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Products</h2>
            <p className="mt-2 max-w-2xl mx-auto text-lg text-muted-foreground text-center">
              Handpicked for quality and value. Get the best deals on our top-rated phones.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" aria-label="View all phones">
              <Link href="/products">
                View All Phones <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Eco-Fone Nepal?</h2>
            <p className="mt-2 max-w-2xl mx-auto text-lg text-muted-foreground">
              We are dedicated to providing a smarter, more sustainable way to own technology.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center flex flex-col items-center">
              <div className="p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <Recycle className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sustainability First</h3>
              <p className="text-muted-foreground">Reduce e-waste and make an eco-friendly choice. Every phone you buy or sell helps the planet.</p>
            </Card>
            <Card className="p-6 text-center flex flex-col items-center">
              <div className="p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <CheckSquare className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-2">You Get What You See</h3>
              <p className="text-muted-foreground">We provide transparent listings and clear photos so you know exactly what to expect.</p>
            </Card>
            <Card className="p-6 text-center flex flex-col items-center">
              <div className="p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <PackageCheck className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rigorous Quality Checks</h3>
              <p className="text-muted-foreground">Our expert technicians perform multi-point inspections to ensure every device is 100% functional.</p>
            </Card>
            <Card className="p-6 text-center flex flex-col items-center">
              <div className="p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <Headset className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Nepali Support</h3>
              <p className="text-muted-foreground">Get friendly and reliable customer service from a team that understands your needs.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Loved by Our Community</h2>
            <p className="mt-2 max-w-2xl mx-auto text-lg text-muted-foreground text-center">
              See what our happy customers are saying about their Eco-Fone experience.
            </p>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <Card className="flex flex-col justify-between h-full">
                      <CardContent className="p-6 pt-6 flex-grow">
                        <div className="flex items-center text-yellow-400 mb-4">
                          {[...Array(testimonial.rating || 5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" aria-hidden="true" />
                          ))}
                        </div>
                        <blockquote className="text-muted-foreground italic">"{testimonial.quote}"</blockquote>
                      </CardContent>
                      <CardHeader className="flex-row items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            data-ai-hint={testimonial.dataAiHint || 'user avatar'}
                          />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{testimonial.name}</p>
                          <p className="text-muted-foreground">{testimonial.location}</p>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-8" />
            <CarouselNext className="hidden md:flex -right-8" />
          </Carousel>
        </div>
      </section>
    </main>
  );
}
