'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Leaf } from 'lucide-react';
import Image from 'next/image';
import { getActiveAnnouncement } from '@/lib/announcements';
import type { Announcement } from '@/lib/types';
import { cn } from '@/lib/utils';
import { convertGoogleDriveLink } from '@/lib/utils';

export function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const activeAnnouncement = await getActiveAnnouncement();
      if (activeAnnouncement) {
        const hasBeenSeen = sessionStorage.getItem(`popup_${activeAnnouncement.id}`);
        if (hasBeenSeen !== 'true') {
          setAnnouncement(activeAnnouncement);
          setIsOpen(true);
        }
      }
    };
    fetchAnnouncement();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (announcement) {
      sessionStorage.setItem(`popup_${announcement.id}`, 'true');
    }
  };

  if (!announcement || !isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 border-0 max-w-md bg-card shadow-lg rounded-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">{announcement.title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          {announcement.imageUrl && (
            <div className="relative w-full aspect-video">
              <Image
                src={convertGoogleDriveLink(announcement.imageUrl)}
                alt={announcement.title}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="p-6 text-center">
            
            <h3 className="text-2xl font-bold tracking-tight mb-2">{announcement.title}</h3>
            
            <p className="text-muted-foreground whitespace-pre-line text-sm">{announcement.content}</p>

          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleClose}
            className="absolute top-2 right-2 h-7 w-7 rounded-full z-20"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
