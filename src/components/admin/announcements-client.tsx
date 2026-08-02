'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addAnnouncement, deleteAnnouncement, updateAnnouncement } from "@/lib/announcements";
import type { Announcement } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { convertGoogleDriveLink } from "@/lib/utils";

const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  content: z.string().min(10, "Content must be at least 10 characters long."),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

function AnnouncementForm({ announcement, onSuccess }: { announcement?: Announcement; onSuccess: () => void }) {
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement?.title || "",
      content: announcement?.content || "",
      imageUrl: announcement?.imageUrl || "",
    },
  });
  const { toast } = useToast();
  const router = useRouter();

  const watchedImageUrl = form.watch("imageUrl");


  const handleSubmit = async (data: AnnouncementFormValues) => {
    try {
        const result = announcement
        ? await updateAnnouncement(announcement.id, data)
        : await addAnnouncement(data as Omit<Announcement, 'id' | 'createdAt'>);

        if (result.success) {
            toast({ title: `Announcement ${announcement ? 'updated' : 'created'}!` });
            onSuccess();
            router.refresh();
        } else {
            throw new Error(result.message);
        }
    } catch(error: any) {
        toast({ title: "Error", description: error.message || "Failed to save announcement.", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Header (Title)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 'New Year Sale!'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body (Description)</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your announcement in detail." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                 <Input type="url" placeholder="https://example.com/image.png" {...field} />
              </FormControl>
               {watchedImageUrl && (
                <Image src={convertGoogleDriveLink(watchedImageUrl)} alt="Image preview" width={100} height={100} className="mt-2 rounded-md object-cover"/>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Announcement"}
        </Button>
      </form>
    </Form>
  );
}

export function AnnouncementsClient({ initialAnnouncements }: { initialAnnouncements: Announcement[] }) {
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | undefined>(undefined);
    const { toast } = useToast();
    const router = useRouter();

    const refreshData = () => {
        router.refresh();
    }

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        refreshData();
    };

    const handleDelete = async (id: string) => {
      const result = await deleteAnnouncement(id);
      if (result.success) {
        toast({ title: "Announcement Deleted" });
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    };
    
    const openEditForm = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setIsFormOpen(true);
    };
    
    const openNewForm = () => {
        setEditingAnnouncement(undefined);
        setIsFormOpen(true);
    }
    
    useEffect(() => {
        setAnnouncements(initialAnnouncements);
    }, [initialAnnouncements])

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                    </div>
                    <Button onClick={openNewForm}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Existing Announcements</CardTitle>
                        <CardDescription>Manage your current site-wide announcements. The latest one will be shown as a popup.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {announcements.length > 0 ? (
                            announcements.map((announcement) => (
                                <div key={announcement.id} className="flex items-start justify-between rounded-lg border p-4">
                                    <div className="flex items-start gap-4">
                                        {announcement.imageUrl && (
                                            <Image src={convertGoogleDriveLink(announcement.imageUrl)} alt={announcement.title} width={64} height={64} className="rounded-md object-cover" />
                                        )}
                                        <div>
                                            <h3 className="font-semibold">{announcement.title}</h3>
                                            <p className="text-sm text-muted-foreground">{announcement.content}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditForm(announcement)}>Edit</Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" ><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the announcement.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(announcement.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center">No announcements yet.</p>
                        )}
                    </CardContent>
                </Card>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}</DialogTitle>
                        <DialogDescription>{editingAnnouncement ? "Update the details for your announcement." : "This will be displayed on the homepage as a popup."}</DialogDescription>
                    </DialogHeader>
                    <AnnouncementForm announcement={editingAnnouncement} onSuccess={handleFormSuccess} />
                </DialogContent>
            </div>
        </Dialog>
    );
}
