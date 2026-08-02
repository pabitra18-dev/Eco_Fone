
'use server';

import { z } from 'zod';

const apiKey = process.env.IMGBB_API_KEY;

if (!apiKey) {
    console.error("IMGBB_API_KEY is not set in the environment variables.");
}

const ImageFileSchema = z.instanceof(File, { message: "Image is required." })
  .refine(file => file.size > 0, "Image file cannot be empty.")
  .refine(file => file.size <= 5 * 1024 * 1024, "Image file size must be less than 5MB.");

export async function uploadImageAndGetUrl(imageFile: File): Promise<string> {
    if (!apiKey) {
        throw new Error('Image upload service is not configured.');
    }

    const validatedFile = ImageFileSchema.safeParse(imageFile);
    if (!validatedFile.success) {
        throw new Error(validatedFile.error.errors[0].message);
    }
    
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error('imgbb upload failed:', result);
            throw new Error(`Image upload failed: ${result?.error?.message || 'Unknown error'}`);
        }

        return result.data.url;
    } catch (error) {
        console.error('Error in uploadImageAndGetUrl:', error);
        throw new Error('Image upload failed.');
    }
}
