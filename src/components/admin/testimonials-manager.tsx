"use client";

import * as React from "react";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Testimonial } from "@/lib/types";
import { TestimonialForm } from "./testimonial-form";
import { DeleteTestimonialDialog } from "./delete-testimonial-dialog";

export function TestimonialsManager({ testimonials: initialTestimonials }: { testimonials: Testimonial[] }) {
    const [open, setOpen] = React.useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = React.useState<Testimonial | null>(null);

    const handleEdit = (testimonial: Testimonial) => {
        setSelectedTestimonial(testimonial);
        setOpen(true);
    };

    const handleAddNew = () => {
        setSelectedTestimonial(null);
        setOpen(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Testimonials</h1>
                    <p className="text-muted-foreground">Manage customer testimonials shown on the homepage.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Testimonial
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{selectedTestimonial ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
                            <DialogDescription>
                                {selectedTestimonial ? "Update the details below." : "Fill in the details for the new testimonial."}
                            </DialogDescription>
                        </DialogHeader>
                        <TestimonialForm
                            testimonial={selectedTestimonial}
                            onSuccess={() => setOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Existing Testimonials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {initialTestimonials.map((testimonial) => (
                        <div key={testimonial.id} className="flex items-start justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">&quot;{testimonial.quote}&quot;</p>
                                </div>
                            </div>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleEdit(testimonial)}>Edit</DropdownMenuItem>
                                    <DeleteTestimonialDialog testimonialId={testimonial.id} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                    {initialTestimonials.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center">No testimonials yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
