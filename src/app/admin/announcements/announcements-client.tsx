
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateAnnouncement, addAnnouncement, deleteAnnouncement, toggleAnnouncementActive } from "@/lib/announcements";
import type { Announcement } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { convertGoogleDriveLink } from "@/lib/utils";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  content: z.string().min(10, "Content must be at least 10 characters long."),
  imageUrl: z.string().url("Please enter a valid URL for the image.").optional().or(z.literal('')),
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
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingAnnouncement(undefined);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
      const result = await deleteAnnouncement(id);
      if (result.success) {
        toast({ title: "Announcement Deleted" });
        router.refresh();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    };

    const handleToggleActive = (id: string, activate: boolean) => {
        startTransition(async () => {
            try {
                await toggleAnnouncementActive(id, activate);
                toast({ title: "Success", description: "Announcement status updated."});
                router.refresh();
            } catch (error) {
                toast({ title: "Error", description: "Failed to update announcement status.", variant: "destructive"});
            }
        });
    }
    
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
    
     const handleOpenChange = (open: boolean) => {
        if (!open) {
            setEditingAnnouncement(undefined);
        }
        setIsFormOpen(open);
    }

    return (
        <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
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
                        <CardDescription>Manage your current site-wide announcements. The 'Active' one will be shown as a popup.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {announcements.length > 0 ? (
                           <>
                             {/* Desktop Table */}
                             <div className="hidden md:block border rounded-md">
                               <Table>
                                 <TableHeader>
                                   <TableRow>
                                     <TableHead>Announcement</TableHead>
                                     <TableHead className="text-right w-[350px]">Actions</TableHead>
                                   </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                   {announcements.map((announcement) => (
                                     <TableRow key={announcement.id}>
                                       <TableCell>
                                         <div className="flex items-center gap-4">
                                           {announcement.imageUrl && (
                                             <Image src={convertGoogleDriveLink(announcement.imageUrl)} alt={announcement.title} width={64} height={64} className="rounded-md object-cover" />
                                           )}
                                           <div className="space-y-1">
                                             <p className="font-semibold">{announcement.title}</p>
                                             <p className="text-sm text-muted-foreground">{announcement.content}</p>
                                           </div>
                                         </div>
                                       </TableCell>
                                       <TableCell className="text-right">
                                         <div className="flex items-center justify-end gap-4">
                                           <div className="flex items-center space-x-2">
                                             <Switch
                                               id={`active-switch-desktop-${announcement.id}`}
                                               checked={!!announcement.isActive}
                                               onCheckedChange={(checked) => handleToggleActive(announcement.id, checked)}
                                               disabled={isPending}
                                             />
                                             <Label htmlFor={`active-switch-desktop-${announcement.id}`} className="text-sm font-medium">Active</Label>
                                           </div>
                                           <Button variant="outline" size="sm" onClick={() => openEditForm(announcement)}>Edit</Button>
                                           <AlertDialog>
                                             <AlertDialogTrigger asChild>
                                               <Button variant="destructive" size="icon" ><Trash2 className="h-4 w-4" /></Button>
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
                                       </TableCell>
                                     </TableRow>
                                   ))}
                                 </TableBody>
                               </Table>
                             </div>

                             {/* Mobile Accordion */}
                             <div className="md:hidden space-y-3">
                               <Accordion type="single" collapsible className="w-full">
                                 {announcements.map((announcement) => (
                                   <AccordionItem value={announcement.id} key={announcement.id} className="border rounded-lg">
                                     <AccordionTrigger className="p-4 text-sm hover:no-underline">
                                       <div className="flex items-center gap-4 text-left">
                                         {announcement.imageUrl && (
                                           <Image src={convertGoogleDriveLink(announcement.imageUrl)} alt={announcement.title} width={48} height={48} className="rounded-md object-cover" />
                                         )}
                                         <div>
                                           <p className="font-semibold">{announcement.title}</p>
                                           {announcement.isActive && <Badge className="mt-1">Active</Badge>}
                                         </div>
                                       </div>
                                     </AccordionTrigger>
                                     <AccordionContent className="p-4 border-t space-y-4">
                                       <p className="text-sm text-muted-foreground">{announcement.content}</p>
                                       <div className="flex items-center justify-between">
                                         <div className="flex items-center space-x-2">
                                           <Switch
                                             id={`active-switch-mobile-${announcement.id}`}
                                             checked={!!announcement.isActive}
                                             onCheckedChange={(checked) => handleToggleActive(announcement.id, checked)}
                                             disabled={isPending}
                                           />
                                           <Label htmlFor={`active-switch-mobile-${announcement.id}`} className="text-sm font-medium">Active</Label>
                                         </div>
                                         <div className="flex items-center gap-2">
                                           <Button variant="outline" size="sm" onClick={() => openEditForm(announcement)}>Edit</Button>
                                           <AlertDialog>
                                             <AlertDialogTrigger asChild>
                                               <Button variant="destructive" size="icon" ><Trash2 className="h-4 w-4" /></Button>
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
                                     </AccordionContent>
                                   </AccordionItem>
                                 ))}
                               </Accordion>
                             </div>
                           </>
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

    

    