
import type { Metadata } from 'next';
import { ContactSection } from '@/components/common/contact-section';
import { PopularPages } from '@/components/common/popular-pages';
import { Cookie, Layers, Settings2, FileText } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Cookie Policy | Eco-Fone Nepal',
    description: 'Learn about how Eco-Fone Nepal uses cookies to improve your browsing experience on our website.',
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

export default function CookiePolicyPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
         <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <Cookie className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
            <p className="mt-2 text-lg text-muted-foreground">Understanding how we use cookies.</p>
        </div>

        <div className="space-y-8">
            <p className="text-sm text-center text-muted-foreground">Last updated: July 2024</p>
            
            <Section icon={FileText} title="1. What Are Cookies?">
                <p>Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the site owners.</p>
            </Section>
            
            <Section icon={Layers} title="2. How We Use Cookies">
                <p>We use cookies for several reasons:</p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                    <li><strong>Essential Cookies:</strong> To manage your authentication, login status, and shopping cart.</li>
                    <li><strong>Preference Cookies:</strong> To remember your preferences, like your chosen theme (light/dark mode).</li>
                    <li><strong>Analytics Cookies:</strong> To understand how you interact with our site, helping us to improve your experience.</li>
                </ul>
            </Section>

            <Section icon={Settings2} title="3. Managing Cookies">
                <p>You can prevent the setting of cookies by adjusting your browser settings. However, disabling cookies may affect the functionality of this and many other websites you visit. It is generally recommended that you do not disable cookies to ensure the best experience.</p>
            </Section>
        </div>
        
        <ContactSection />
        <PopularPages />
      </div>
    </div>
  );
}
