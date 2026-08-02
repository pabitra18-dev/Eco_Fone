
"use client";

import { useState } from 'react';
import Image from "next/image";
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface ProductImagesProps {
    images: string[];
    productName: string;
}

export function ProductImages({ images, productName }: ProductImagesProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    return (
        <div className="md:sticky md:top-24">
            <Card className="overflow-hidden">
                <Image
                    src={images[selectedImage]}
                    alt={`${productName} view ${selectedImage + 1}`}
                    width={600}
                    height={600}
                    className="w-full aspect-square object-cover"
                    data-ai-hint={`${productName.split(' ')[0]} smartphone`}
                    priority
                />
            </Card>
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={cn(
                                "border rounded-lg overflow-hidden cursor-pointer transition-all",
                                selectedImage === index ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                            )}
                            onClick={() => setSelectedImage(index)}
                        >
                            <Image 
                                src={img} 
                                alt={`${productName} thumbnail ${index + 1}`} 
                                width={150} 
                                height={150} 
                                className="object-cover h-full w-full aspect-square" 
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
