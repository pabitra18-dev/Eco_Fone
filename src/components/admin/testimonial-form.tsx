
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Testimonial } from "@/lib/types";
import { addOrUpdateTestimonialAction } from "@/app/admin/homepage/actions";
import React from 'react';
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const testimonialFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required."),
  location: z.string().min(2, "Location is required."),
  quote: z.string().min(10, "Quote must be at least 10 characters."),
  rating: z.coerce.number().min(1).max(5).default(5),
  avatarFile: z.any().optional(),
});

type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

interface TestimonialFormProps {
  testimonial: Testimonial | null;
  onSuccess: () => void;
}

export function TestimonialForm({ testimonial, onSuccess }: TestimonialFormProps) {
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(testimonial?.avatar || null);
  
  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: testimonial ? {
      ...testimonial,
      rating: testimonial.rating || 5,
      avatarFile: undefined,
    } : { 
      name: "", 
      location: "", 
      quote: "", 
      avatarFile: undefined, 
      rating: 5 
    },
  });

  const onSubmit = async (data: TestimonialFormValues) => {
    const formData = new FormData();
    if (testimonial?.id) {
        formData.append('id', testimonial.id);
    }
    formData.append('name', data.name);
    formData.append('location', data.location);
    formData.append('quote', data.quote);
    formData.append('rating', String(data.rating));
    
    if (testimonial?.avatar) {
        formData.append('avatar', testimonial.avatar);
    }
    
    if (data.avatarFile && data.avatarFile.length > 0) {
      formData.append('avatarFile', data.avatarFile[0]);
    }

    try {
      const result = await addOrUpdateTestimonialAction(formData);
      if (result.success) {
        toast({ title: "Success", description: `Testimonial ${testimonial ? 'updated' : 'added'} successfully.` });
        onSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Something went wrong.", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="location" render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="quote" render={({ field }) => (
          <FormItem>
            <FormLabel>Quote</FormLabel>
            <FormControl><Textarea {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Rating (1-5 Stars)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a rating" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {[1, 2, 3, 4, 5].map(r => <SelectItem key={r} value={String(r)}>{r} Star{r > 1 ? 's' : ''}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField control={form.control} name="avatarFile" render={({ field: { onChange, ...rest } }) => (
          <FormItem>
            <FormLabel>Avatar (Optional)</FormLabel>
            <FormControl>
              <Input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setAvatarPreview(reader.result as string);
                      reader.readAsDataURL(file);
                      onChange(e.target.files);
                  }
              }} {...rest} />
            </FormControl>
             {avatarPreview && (
                <Image src={avatarPreview} alt="Avatar preview" width={80} height={80} className="mt-2 rounded-full object-cover"/>
              )}
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Testimonial"}
        </Button>
      </form>
    </Form>
  )
}
