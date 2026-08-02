"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteTestimonialAction } from "@/app/admin/homepage/actions"
import { useToast } from "@/hooks/use-toast";
import React from "react";

export function DeleteTestimonialDialog({ testimonialId }: { testimonialId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const handleDelete = async () => {
    try {
      await deleteTestimonialAction(testimonialId);
      toast({
        title: "Testimonial Deleted",
        description: "The testimonial has been successfully deleted.",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the testimonial.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <span onClick={() => setOpen(true)} className="text-destructive w-full">Delete</span>
        </DropdownMenuItem>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                testimonial.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}
