
"use client"

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from '@/components/ui/input';
import { Search, HelpCircle, ShieldCheck, Smartphone, ShoppingCart } from 'lucide-react';
import { ContactSection } from '@/components/common/contact-section';
import { PopularPages } from '@/components/common/popular-pages';

const faqData = [
  {
    category: "General Information",
    icon: HelpCircle,
    questions: [
      {
          question: "What is Eco-Fone Nepal?",
          answer: "Eco-Fone Nepal is a marketplace for high-quality, refurbished smartphones. Our mission is to make technology more affordable and sustainable for everyone in Nepal by giving pre-owned devices a new life."
      },
      {
          question: "How can I contact customer support?",
          answer: "Our team is here to help! You can reach us via the contact details on our footer or by emailing us at ecofonenepal@gmail.com. We typically respond within one business day."
      }
    ]
  },
  {
    category: "Buying & Warranty",
    icon: ShieldCheck,
    questions: [
      {
          question: "Are the phones you sell new or used?",
          answer: "We specialize in refurbished smartphones. This means they are pre-owned devices that have been professionally inspected, tested, and restored to full working condition. They are not brand new but offer the same great performance at a lower price."
      },
      {
          question: "What does the 'condition' of a phone mean?",
          answer: "Each phone is graded based on its cosmetic condition. 'Excellent' means the device is like-new with minimal to no signs of wear. 'Very Good' may have very light scratches, and 'Good' will have visible signs of use but is fully functional. All devices, regardless of condition, are 100% functional."
      },
      {
          question: "Do your phones come with a warranty?",
          answer: "Yes! We stand by our products. All our smartphones come with a 3-month hardware warranty that covers any functional defects not caused by accidental damage."
      },
    ]
  },
    {
    category: "Orders & Shipping",
    icon: ShoppingCart,
    questions: [
      {
          question: "What is included with my purchase?",
          answer: "Each phone comes with a compatible charging cable. Original boxes and other accessories are not typically included unless specified in the product description."
      },
      {
          question: "Do you deliver all over Nepal?",
          answer: "Yes, we offer delivery services across Nepal. Shipping times and costs may vary depending on your location. We provide detailed information at checkout."
      },
    ]
  },
  {
    category: "Selling Your Phone",
    icon: Smartphone,
    questions: [
      {
          question: "How does selling my phone to you work?",
          answer: "You can use our 'Sell Your Phone' page to submit details about your device. We'll provide you with a competitive quote. If you accept, we arrange for pickup and verification, and you get paid. It's simple, safe, and fast."
      }
    ]
  }
];

export default function FAQPage() {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredFaqData = React.useMemo(() => {
        if (!searchTerm) return faqData;
    
        const lowercasedFilter = searchTerm.toLowerCase();
    
        return faqData
          .map(category => ({
            ...category,
            questions: category.questions.filter(
              q =>
                q.question.toLowerCase().includes(lowercasedFilter) ||
                q.answer.toLowerCase().includes(lowercasedFilter)
            ),
          }))
          .filter(category => category.questions.length > 0);
      }, [searchTerm]);


  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <HelpCircle className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
            <p className="mt-2 text-lg text-muted-foreground">Find answers to common questions about Eco-Fone Nepal</p>
        </div>
        
        <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search FAQ..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="space-y-8">
            {filteredFaqData.length > 0 ? filteredFaqData.map((category, index) => (
                <div key={index} className="border rounded-lg p-6 bg-card shadow-sm">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center">
                        <category.icon className="h-6 w-6 mr-3 text-primary" />
                        {category.category}
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((faq, qIndex) => (
                            <AccordionItem value={`item-${index}-${qIndex}`} key={qIndex} className={qIndex === category.questions.length - 1 ? "border-b-0" : ""}>
                                <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground [&_p]:leading-relaxed">
                                    <p>{faq.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )) : (
                <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg font-semibold">No questions found</p>
                    <p>We couldn't find any questions matching your search.</p>
                </div>
            )}
        </div>
        
        <ContactSection />
        <PopularPages />
      </div>
    </div>
  );
}
