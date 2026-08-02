
import type { Metadata } from 'next';
import { ContactSection } from '@/components/common/contact-section';
import { PopularPages } from '@/components/common/popular-pages';
import { Handshake, Smartphone, ShieldCheck, Ban, Scale, FileText, BadgeInfo, BellRing, Settings, Users, Truck, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms of Service | Eco-Fone Nepal',
    description: 'Read the terms and conditions for using the Eco-Fone Nepal website and services.',
};

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full mt-1">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2 text-foreground">{title}</h2>
                <div className="text-muted-foreground leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    </div>
)

export default function TermsOfServicePage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="mt-2 text-lg text-muted-foreground">The rules and guidelines for using our platform.</p>
        </div>
        
        <div className="space-y-8">
            <p className="text-sm text-center text-muted-foreground">Last updated: July 2024</p>
            
            <Section icon={Handshake} title="Acceptance of Terms">
                <p>By accessing and using Eco-Fone Nepal's website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.</p>
            </Section>
            
            <Section icon={BadgeInfo} title="Product Information">
                 <p>We specialize in quality refurbished and new smartphones. Our products are sourced from brands like Samsung, Apple, OnePlus, Xiaomi, and more. All devices are rigorously tested and graded by condition.</p>
            </Section>

            <Section icon={ShieldCheck} title="Warranty & Return Policy">
                <h3 className="text-lg font-semibold !mb-2 text-foreground">3-Month Hardware Warranty</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>Covers hardware defects and manufacturing malfunctions.</li>
                    <li>Excludes software issues, physical, and water damage.</li>
                    <li>Requires proof of purchase and is serviced at our Hetauda location.</li>
                </ul>
                <h3 className="text-lg font-semibold mt-4 !mb-2 text-foreground">7-Day Return Policy</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>Applicable for products with hardware defects upon arrival.</li>
                    <li>Item must be in original condition with all accessories.</li>
                    <li>We do not accept returns for change of mind.</li>
                </ul>
            </Section>

            <Section icon={Ban} title="Prohibited Uses">
                 <p>You agree not to use our services for any unlawful purpose, to transmit malicious code, to collect personal information without consent, or to interfere with the service's integrity.</p>
            </Section>
            
            <Section icon={Users} title="User Accounts">
                <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
            </Section>
            
            <Section icon={CreditCard} title="Pricing and Payment">
                 <ul className="list-disc list-inside space-y-1">
                    <li>All prices are in Nepalese Rupees (NPR) and include applicable taxes.</li>
                    <li>We accept various payment methods as displayed at checkout.</li>
                    <li>Payment must be completed before product shipment.</li>
                </ul>
            </Section>

            <Section icon={Scale} title="Governing Law">
                <p>These Terms are governed by the laws of Nepal, including the Consumer Protection Act 2075. Any disputes shall be resolved in the competent courts of Hetauda, Nepal.</p>
            </Section>
        </div>

        <ContactSection />
        <PopularPages />
      </div>
    </div>
  );
}
