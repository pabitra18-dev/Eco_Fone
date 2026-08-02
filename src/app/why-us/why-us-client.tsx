
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Leaf, BadgePercent, MapPin, Headset, ShieldCheck, Award, Star, Loader2 } from 'lucide-react';
import { getTestimonials } from '@/lib/testimonials';
import type { SiteImageKeys, Testimonial } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import imageData from '@/lib/placeholder-images.json';
import { getSiteImages } from '../admin/settings/images/actions';
import { ContactSection } from '@/components/common/contact-section';


const benefits = [
  {
    icon: BadgePercent,
    title: 'Unbeatable Affordability',
    description: 'Get access to premium smartphones at prices that don’t break the bank. Quality tech is now within your reach.',
  },
  {
    icon: Leaf,
    title: 'Commitment to Sustainability',
    description: 'Join us in reducing e-waste. Every purchase contributes to a greener planet by giving phones a second life.',
  },
  {
    icon: ShieldCheck,
    title: 'Certified Quality',
    description: 'Every device undergoes a rigorous testing process to ensure it meets our high standards for performance and reliability.',
  },
  {
    icon: Award,
    title: '3-Month Warranty',
    description: 'Shop with confidence. All our products come with a 3-month hardware warranty for your peace of mind.',
  },
  {
    icon: MapPin,
    title: 'Local Nepali Expertise',
    description: 'We are a team based in Nepal, with a deep understanding of the local market and our customers’ unique needs.',
  },
  {
    icon: Headset,
    title: 'Dedicated Customer Support',
    description: 'Our friendly and knowledgeable team is always here to help you, from purchase to after-sales support.',
  },
];

const WhyUsPageSkeleton = () => (
    <div className="bg-background text-foreground">
        <section className="relative bg-primary/5 py-4 md:py-8">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Why Choose Eco-Fone Nepal?</h1>
                <div className="flex justify-center">
                  <p className="mt-4 max-w-3xl text-lg md:text-xl text-muted-foreground text-center">
                      Because we're more than just a phone store. We are your partners in sustainable technology, committed to quality, affordability, and a greener Nepal.
                  </p>
                </div>
            </div>
        </section>
        <section className="py-4 md:py-8">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <Skeleton className="w-full h-[400px] rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-4/5" />
                    </div>
                </div>
            </div>
        </section>
    </div>
);


export function WhyUsClient() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [siteImages, setSiteImages] = useState<Partial<Record<SiteImageKeys, string>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [testimonialsData, imagesData] = await Promise.all([
                getTestimonials(),
                getSiteImages()
            ]);
            setTestimonials(testimonialsData);
            setSiteImages(imagesData);
        } catch (error) {
            console.error("Failed to fetch page data:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  if (loading) {
    return <WhyUsPageSkeleton />;
  }

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-primary/5 py-4 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Why Choose Eco-Fone Nepal?</h1>
          <div className="flex justify-center">
            <p className="mt-4 max-w-3xl text-lg md:text-xl text-muted-foreground text-center">
              Because we're more than just a phone store. We are your partners in sustainable technology, committed to quality, affordability, and a greener Nepal.
            </p>
          </div>
        </div>
        <div
          className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-background"
        />
      </section>

      {/* Key Benefits Section */}
      <section className="bg-primary/5 py-4 md:py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">What Sets Us Apart</h2>
            <div className="flex justify-center">
              <p className="mt-2 max-w-2xl text-lg text-muted-foreground text-center">
                We focus on what truly matters: quality, trust, and our shared environment.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center bg-card hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-4 md:py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Loved by Our Community</h2>
            <div className="flex justify-center">
              <p className="mt-2 max-w-2xl text-lg text-muted-foreground text-center">
                Don't just take our word for it. Here's what our customers have to say.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="flex flex-col justify-between bg-card">
                <CardHeader className="flex-row items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.dataAiHint} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-muted-foreground">{testimonial.location}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center text-yellow-400 mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                  </div>
                  <blockquote className="text-muted-foreground italic text-center">"{testimonial.quote}"</blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <div className="py-4 md:py-8 container mx-auto px-4">
        <ContactSection />
      </div>

      {/* Call to Action Section */}
      <section className="bg-primary/5 py-4 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to Join the Movement?</h2>
          <div className="flex justify-center">
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-center">
              Explore our collection of certified refurbished smartphones and make a choice that's good for your pocket and the planet.
            </p>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/products">Shop All Phones</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sell">Sell Your Phone</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
