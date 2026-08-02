
import type { Metadata } from 'next';
import { ContactSection } from '@/components/common/contact-section';
import { PopularPages } from '@/components/common/popular-pages';
import { Shield, FileText, Database, UserCog, Share2, Gavel, Lock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy | Eco-Fone Nepal',
    description: 'Our privacy policy outlines how we collect, use, and protect your personal information in compliance with Nepalese law.',
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

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="mt-2 text-lg text-muted-foreground">How Eco-Fone Nepal handles your data.</p>
        </div>
        
        <div className="space-y-8">
            <p className="text-sm text-center text-muted-foreground">Last updated: July 2024</p>
            
            <Section icon={FileText} title="1. Introduction">
                <p>Welcome to Eco-Fone Nepal. We are committed to protecting your privacy and handling your personal data in an open and transparent manner. This policy explains how we collect, use, and safeguard your information in accordance with Nepalese law.</p>
            </Section>
            
            <Section icon={Database} title="2. Information We Collect">
                <p className='font-semibold text-foreground'>Personal Data:</p>
                <p>Name, shipping address, email, and phone number you provide during registration or purchase.</p>
                <p className='font-semibold text-foreground mt-2'>Transactional Data:</p>
                <p>Details about your orders, payments, and devices you sell to us.</p>
            </Section>

            <Section icon={UserCog} title="3. How We Use Your Information">
                <p>We use your information to create your account, process transactions, provide quotes, and improve our services. We only use data as necessary to provide a smooth and efficient experience.</p>
            </Section>

            <Section icon={Share2} title="4. Disclosure of Your Information">
                <p>We do not sell or trade your data. We may share it with third-party service providers (e.g., delivery services) or as required by law to protect our rights and comply with legal processes.</p>
            </Section>

            <Section icon={Gavel} title="5. Your Rights Under Nepalese Law">
                <p>As per Nepal's Individual Privacy Act, 2075, you have the right to access, rectify, or erase your personal data, and to object to its processing. Please contact us to exercise these rights.</p>
            </Section>

            <Section icon={Lock} title="6. Data Security">
                <p>We implement administrative, technical, and physical security measures to protect your personal information. However, no method is 100% secure, and we cannot guarantee absolute security.</p>
            </Section>
        </div>

        <ContactSection />
        <PopularPages />
      </div>
    </div>
  );
}
