'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DemandForm } from "@/components/demand-form";
import { Handshake, LogIn, Smartphone } from "lucide-react";
import { getDemandById } from "@/app/account/demands/actions";
import type { Demand } from '@/lib/types';
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DemandContent() {
    const searchParams = useSearchParams();
    const editingId = searchParams.get('edit');
    const { isAuthenticated, getIdToken } = useAuth();
    const [initialData, setInitialData] = useState<Demand | null>(null);
    const [loading, setLoading] = useState(!!editingId);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDemandData = async () => {
            if (!editingId) {
                setLoading(false);
                return;
            }

            const idToken = await getIdToken();
            if (!idToken) {
                setError("Authentication session has expired. Please log in again.");
                setLoading(false);
                return;
            }

            try {
                const data = await getDemandById(idToken, editingId);
                if (data) {
                    setInitialData(data);
                } else {
                   setError("Demand not found or you don't have permission to edit it.");
                }
            } catch (error: any) {
                console.error("Failed to fetch demand data:", error);
                setError(error.message || "Failed to load demand data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchDemandData();
        } else if (isAuthenticated === false) {
             setLoading(false);
        }
    }, [editingId, isAuthenticated, getIdToken]);

    if (loading || isAuthenticated === null) {
        return <div className="text-center py-16 text-muted-foreground">Verifying secure session...</div>;
    }

    if (!isAuthenticated) {
       return (
         <section className="py-16 bg-background">
             <div className="container flex flex-col items-center justify-center px-4">
                 <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold">Demand a Phone</h2>
                        <p className="text-muted-foreground">Please log in to submit a new phone demand.</p>
                    </CardHeader>
                    <CardContent>
                        <Button asChild size="lg">
                            <Link href={`/auth/login?redirect=/demand${editingId ? `?edit=${editingId}`:''}`}><LogIn className="mr-2 h-4 w-4" /> Login to Continue</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
         </section>
       );
    }
    
    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4 flex justify-center">
                <div className="w-full max-w-3xl">
                    <div className="text-center mb-12">
                        <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Handshake className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">{editingId ? 'Update Your Demand' : 'Demand a Phone'}</h1>
                    </div>
                    <DemandForm initialData={initialData} editingId={editingId ?? undefined} />
                </div>
            </div>
        </section>
    );
}
