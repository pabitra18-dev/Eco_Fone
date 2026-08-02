
import type { Metadata } from 'next';
import { ContactSection } from '@/components/common/contact-section';
import { PopularPages } from '@/components/common/popular-pages';
import { Undo2, ShieldCheck, XCircle, LifeBuoy } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Warranty & Returns | Eco-Fone Nepal',
    description: 'Understand our warranty and return policies for refurbished smartphones. We offer a 3-month hardware warranty and a 7-day return policy for defective products.',
};

const Section = ({ icon: Icon, title, children, id }: { icon: React.ElementType, title: string, children: React.ReactNode, id: string }) => (
    <div id={id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
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

export default function WarrantyReturnsPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <Undo2 className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Warranty & Returns Policy</h1>
            <p className="mt-2 text-lg text-muted-foreground">Our commitment to quality and your satisfaction.</p>
        </div>
        
        <div className="space-y-8">
          <p className="text-sm text-center text-muted-foreground">Last updated: July 2024</p>
          <Section id="warranty" icon={ShieldCheck} title="3-Month Hardware Warranty">
              <p>At Eco-Fone Nepal, we stand by the quality of our products. All our refurbished smartphones come with a 3-month hardware warranty to give you peace of mind.</p>
              <h3 className="text-lg font-semibold !mt-4 !mb-2 text-foreground">What's Covered:</h3>
              <ul className="list-disc list-inside space-y-1">
                  <li>Hardware malfunctions not caused by accidental damage.</li>
                  <li>Manufacturing defects affecting functionality.</li>
                  <li>Issues with internal components like the motherboard or speakers under normal use.</li>
              </ul>
          </Section>

          <Section id="exclusions" icon={XCircle} title="Warranty Exclusions">
              <h3 className="text-lg font-semibold !mb-2 text-foreground">What's Not Covered:</h3>
              <ul className="list-disc list-inside space-y-1">
                  <li>Software issues, viruses, or problems from third-party apps.</li>
                  <li>Physical damage (e.g., cracked screens, dents) from drops or mishandling.</li>
                  <li>Water or liquid damage of any kind.</li>
                  <li>Normal battery degradation.</li>
                  <li>Damage from unauthorized repairs or modifications.</li>
              </ul>
          </Section>

          <Section id="returns" icon={LifeBuoy} title="7-Day Return & Claim Process">
               <h3 className="text-lg font-semibold !mb-2 text-foreground">Initiating a Return:</h3>
               <p>If you believe your product is defective and qualifies for a return within 7 days of delivery, please contact our support team immediately.</p>
               <h3 className="text-lg font-semibold mt-4 !mb-2 text-foreground">How to Claim Warranty:</h3>
              <p>To make a warranty claim, present your proof of purchase within the 3-month period. All warranty service is provided at our Hetauda location. For qualifying returns due to defects, we will cover the return shipping costs.</p>
          </Section>
        </div>

        <ContactSection />
        <PopularPages />
      </div>
    </div>
  );
}
