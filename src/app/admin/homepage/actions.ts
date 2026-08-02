
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateProductFeaturedStatus, setHeroProduct as dbSetHeroProduct } from "@/lib/products";
import { addTestimonial, updateTestimonial, deleteTestimonial as dbDeleteTestimonial } from "@/lib/testimonials";
import { uploadImageAndGetUrl } from "@/lib/file-upload";

export async function toggleFeaturedProductAction(id: string, featured: boolean) {
    try {
        await updateProductFeaturedStatus(id, featured);
        revalidatePath('/');
        revalidatePath('/admin/featured');
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Failed to update product.' };
    }
}

export async function setHeroProductAction(productId: string) {
    try {
        await dbSetHeroProduct(productId);
        revalidatePath('/');
        revalidatePath('/admin/featured');
        return { success: true };
    } catch (error) {
        console.error("Error in setHeroProductAction:", error);
        return { success: false, message: 'Failed to set hero product.' };
    }
}

const testimonialSchema = z.object({
  id: z.string().optional(),
  quote: z.string().min(10, 'Quote must be at least 10 characters.'),
  name: z.string().min(2, 'Name is required.'),
  location: z.string().min(2, 'Location is required.'),
  avatar: z.string().url('Must be a valid URL.').optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
});


export async function addOrUpdateTestimonialAction(formData: FormData) {
    const id = formData.get('id') as string | null;
    let avatarUrl = formData.get('avatar') as string | null;
    const imageFile = formData.get('avatarFile') as File | null;
    
    try {
        if (imageFile && imageFile.size > 0) {
            avatarUrl = await uploadImageAndGetUrl(imageFile);
        } else if (!avatarUrl) {
            avatarUrl = "https://storage.googleapis.com/eco-fone-nepal.appspot.com/assets/default-avatar.png";
        }

        const rawData = {
          id: id || undefined,
          name: formData.get('name') as string,
          location: formData.get('location') as string,
          quote: formData.get('quote') as string,
          rating: formData.get('rating') ? Number(formData.get('rating')) : undefined,
          avatar: avatarUrl || undefined,
        };

        const validated = testimonialSchema.safeParse(rawData);

        if (!validated.success) {
            console.error(validated.error);
            return { success: false, message: 'Invalid data.' };
        }
    
        const { id: testimonialId, ...data } = validated.data;
        if (testimonialId) {
            await updateTestimonial(testimonialId, data);
        } else {
            await addTestimonial(data);
        }
        revalidatePath('/');
        revalidatePath('/admin/testimonials');
        revalidatePath('/why-us');
        return { success: true };
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Failed to save testimonial.' };
    }
}


export async function deleteTestimonialAction(id: string) {
    try {
        await dbDeleteTestimonial(id);
        revalidatePath('/');
        revalidatePath('/admin/testimonials');
        revalidatePath('/why-us');
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Failed to delete testimonial.' };
    }
}
