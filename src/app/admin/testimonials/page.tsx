export const dynamic = 'force-dynamic'; // Tells Next.js not to pre-render this page during the build

import { getTestimonials } from "@/lib/testimonials";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";

export default async function TestimonialsPage() {
    const testimonials = await getTestimonials();
    return <TestimonialsManager testimonials={testimonials} />;
}
