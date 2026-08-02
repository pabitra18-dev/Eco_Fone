'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Handshake } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Loading Skeleton UI used during Client Component lazy loading
const DemandPageSkeleton = () => (
    <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-full max-w-3xl">
            <div className="text-center mb-12">
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto mt-2" />
            </div>
        </div>
    </div>
);

// 1. Force Next.js to load the actual page content purely on the client side.
// This completely destroys the build error AND stops the "Unauthorized" server bug.
const DemandContentClient = dynamic(
    () => import('./DemandContent').then((mod) => mod.DemandContent),
    { 
        ssr: false,
        loading: () => <DemandPageSkeleton />
    }
);

export default function DemandPage() {
    return <DemandContentClient />;
}
