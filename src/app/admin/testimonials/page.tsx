export const dynamic = 'force-dynamic';

import { getTestimonials } from "@/lib/testimonials";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";

export default async function TestimonialsPage() {
    // If Vercel is building the app, skip fetching data to avoid API crashes
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return <TestimonialsManager testimonials={[]} />;
    }

    try {
        const testimonials = await getTestimonials();
        return <TestimonialsManager testimonials={testimonials} />;
    } catch (error) {
        console.error("Failed to load testimonials:", error);
        return <TestimonialsManager testimonials={[]} />;
    }
}
