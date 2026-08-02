
import Link from "next/link";
import { Leaf, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: Partial<SiteSettings> }) {
 return (
 <footer className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground pt-12 pb-8">
 <div className="container mx-auto px-4">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 {/* First Column: Logo, Description, and Copyright */}
 <div className="flex flex-col items-center text-center md:items-start md:text-left">
 <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-4 justify-center md:justify-start transition-colors hover:text-accent">
 <Leaf className="h-7 w-7" />
 <span>{settings?.storeName || 'EcoFone Nepal'}</span>
 </Link>
 <p className="text-sm leading-relaxed text-muted-foreground mb-4">
 Nepal&apos;s premier marketplace for sustainable smartphones. Quality
 refurbished devices at unbeatable prices.
 </p>
 <div className="mt-6 flex space-x-4 text-primary justify-center md:justify-start">
              {settings.socialFacebook && <Link href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Facebook /></Link>}
              {settings.socialInstagram && <Link href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Instagram /></Link>}
              {settings.socialX && <Link href={settings.socialX} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Twitter /></Link>}
            </div>
 {/* Copyright Notice */}
 <div className="mt-8 text-center text-xs text-muted-foreground w-full md:text-left md:pl-0">
 <p>&copy; {new Date().getFullYear()} {settings?.storeName || 'Eco-Fone Nepal'}. All rights reserved.</p>
 </div>
 </div>
 {/* Second Column: Quick Links */}
 <div>
 <h3 className="font-semibold text-primary mb-6">Quick Links</h3>
 <ul className="space-y-3 text-sm text-muted-foreground">
 <li>
 <Link href="/products" className="hover:text-primary transition-colors">
 All Phones
 </Link>
 </li>
 <li>
 <Link href="/sell" className="hover:text-primary transition-colors">
 Sell Your Phone
 </Link>
 </li>
 <li>
 <Link href="/why-us" className="hover:text-primary transition-colors">
 Why Us
 </Link>
 </li>
 <li>
 <Link href="/cart" className="hover:text-primary transition-colors">
 Your Cart
 </Link>
 </li>
 <li>
 <Link href="/faq" className="hover:text-primary transition-colors">
 FAQ
 </Link>
 </li>
 </ul>
 </div>
 {/* Third Column: Legal & Policies */}
 <div>
 <h3 className="font-semibold text-primary mb-6">Legal & Policies</h3>
 <ul className="space-y-3 text-sm">
 <li>
 <Link href="/terms-of-service" className="hover:text-primary transition-colors">
 Terms of Service
 </Link>
 </li>
 <li>
 <Link href="/privacy-policy" className="hover:text-primary transition-colors">
 Privacy Policy
 </Link>
 </li>
 <li>
 <Link href="/warranty-and-returns" className="hover:text-primary transition-colors">
 Warranty & Returns
 </Link>
 </li>
 <li>
 <Link href="/cookie-policy" className="hover:text-primary transition-colors">
      Cookie Policy
    </Link>
  </li>
 </ul>
 </div>
 {/* Fourth Column: Contact Us */}
 <div>
 <h3 className="font-semibold text-primary mb-6">Contact Us</h3>
 <div className="space-y-3 text-sm text-foreground">
 <p className="flex items-start gap-2 hover:text-primary transition-colors">
 <MapPin className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
 Hetauda, Nepal
 </p>
 <p className="flex items-start gap-2">
 <Phone className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
 {settings?.contactPhone || '+977-9820736354'}
 </p>
 <p className="flex items-start gap-2">
 <Mail className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
 {settings?.contactEmail || 'ecofonenepal@gmail.com'}
 </p>
 </div>
 </div>
 </div>
 </div>
 </footer>
 );
}
