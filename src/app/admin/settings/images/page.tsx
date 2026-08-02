
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import type { SiteImageKeys } from '@/lib/types';
import { getSiteImages, updateSiteImageAction } from './actions';
import imageData from '@/lib/placeholder-images.json';

type ImageField = {
  id: SiteImageKeys;
  label: string;
  description: string;
};

const imageFields: ImageField[] = [
  { id: 'whyUsHero', label: 'Why Us Page Hero', description: 'Main image on the "Why Us" page (recommends 600x400).' },
  { id: 'reviewerAvatar1', label: 'Product Reviewer Avatar 1', description: 'Avatar for the first reviewer on product pages.' },
];

export default function SiteImagesPage() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<Partial<Record<SiteImageKeys, boolean>>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const siteImages = await getSiteImages();
      setImages(siteImages);
      setLoading(false);
    };
    fetchImages();
  }, []);
  
  const handleFileChange = async (key: SiteImageKeys, file: File | null) => {
    if (!file) return;

    setIsUploading(prev => ({...prev, [key]: true}));
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setImages(prev => ({ ...prev, [key]: previewUrl }));
    
    try {
        const formData = new FormData();
        formData.append('key', key);
        formData.append('file', file);
        
        const newUrl = await updateSiteImageAction(formData);
        
        setImages(prev => ({ ...prev, [key]: newUrl }));
        URL.revokeObjectURL(previewUrl); // Clean up the object URL

        toast({
            title: 'Image Updated',
            description: `Successfully updated the ${imageFields.find(f => f.id === key)?.label}.`,
        });

    } catch (error) {
        console.error("Failed to upload image:", error);
        toast({
            title: 'Upload Failed',
            description: 'Could not update the image. Please try again.',
            variant: 'destructive',
        });
        // Revert to old image on failure if possible, or refetch
    } finally {
        setIsUploading(prev => ({...prev, [key]: false}));
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Manage Site Images</h1>
        <p className="text-muted-foreground">Upload and update images used across your website.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme & Content Images</CardTitle>
          <CardDescription>
            Change the images for key areas of your site. Uploading a new image will automatically save and update it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {imageFields.map(({ id, label, description }) => (
            <div key={id} className="grid md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1">
                <Label className="font-semibold">{label}</Label>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                  {images[id] ? (
                      <Image src={images[id]} alt={label} width={80} height={80} className="rounded-md bg-muted object-cover aspect-square" />
                  ) : (
                      <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                          No Image
                      </div>
                  )}
                 <div className="relative flex-1">
                    <Input
                        id={id}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => handleFileChange(id as SiteImageKeys, e.target.files?.[0] ?? null)}
                        className="w-full"
                        disabled={!!isUploading[id]}
                    />
                    {isUploading[id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
