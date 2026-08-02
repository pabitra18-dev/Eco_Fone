export const dynamic = 'force-dynamic';

import { TestimonialsManager } from "@/components/admin/testimonials-manager";

export default async function TestimonialsPage() {
    // 1. Immediately bypass if Next.js is running a static build phase
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return <TestimonialsManager testimonials={[]} />;
    }

    try {
        // 2. Dynamically import the testimonials lib ONLY at runtime
        const { getTestimonials } = await import("@/lib/testimonials");
        const testimonials = await getTestimonials();
        
        return <TestimonialsManager testimonials={testimonials} />;
    } catch (error) {
        console.error("Failed to load testimonials:", error);
        return <TestimonialsManager testimonials={[]} />;
    }
}
