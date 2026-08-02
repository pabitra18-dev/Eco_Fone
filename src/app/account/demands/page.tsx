'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Demand } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { deleteUserDemand, getDemandsByUserId } from './actions';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type DemandStatus = 'new' | 'in progress' | 'fulfilled' | 'rejected';

const statusVariantMap: { [key in DemandStatus]: "default" | "secondary" | "destructive" | "outline" } = {
  new: "outline",
  'in progress': "secondary",
  fulfilled: "default",
  rejected: "destructive",
};

const DemandsPageSkeleton = () => (
    <Card>
        <CardHeader>
            <CardTitle>Demand History</CardTitle>
            <CardDescription>A list of the phones you've requested.</CardDescription>
        </CardHeader>
        <CardContent>
             {/* Desktop Skeleton */}
            <div className="hidden md:block border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Device</TableHead>
                            <TableHead>Date Submitted</TableHead>
                            <TableHead>Status</TableHead>
                             <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell className="text-right"><div className="flex justify-end gap-2"><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-9" /></div></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Mobile Skeleton */}
            <div className="md:hidden space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1.5">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                            <Skeleton className="h-5 w-5" />
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

export default function UserDemandsPage() {
  const { isAuthenticated, getIdToken } = useAuth();
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchDemands = useCallback(async () => {
    const idToken = await getIdToken();
    if (!idToken) {
        setError("You are not logged in.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const userDemands = await getDemandsByUserId(idToken);
      setDemands(userDemands);
    } catch (err: any) {
      console.error("Failed to fetch demands:", err);
      setError(err.message || "An unexpected error occurred.");
      setDemands([]);
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (isAuthenticated) {
        fetchDemands();
    } else if (isAuthenticated === false) {
        setLoading(false);
        setDemands([]);
    }
  }, [isAuthenticated, fetchDemands]);
  
  const handleDelete = async (id: string) => {
    const idToken = await getIdToken();
    if (!idToken) {
        toast({ title: "Authentication Error", description: "Could not verify your session.", variant: "destructive" });
        return;
    }
    try {
        const result = await deleteUserDemand(idToken, id);
        if(result.success) {
            toast({ title: "Demand Deleted", description: "Your demand has been successfully removed." });
            setDemands(prev => prev.filter(d => d.id !== id));
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to delete demand.", variant: "destructive" });
    }
  };
  
  const handleEdit = (id: string) => {
    router.push(`/demand?edit=${id}`);
  };

  if (loading || isAuthenticated === null) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">My Demands</h1>
        <DemandsPageSkeleton />
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">My Demands</h1>
        <Card className="mt-8">
            <CardContent className="pt-6 text-center">
                <p>Please log in to see your demands.</p>
                <Button asChild className="mt-4">
                    <Link href="/auth/login?redirect=/account/demands">Login</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">My Demands</h1>
            <p className="text-destructive">Error: {error}</p>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Demands</h1>
      <Card>
        <CardHeader>
          <CardTitle>Demand History</CardTitle>
          <CardDescription>A list of the phones you've requested.</CardDescription>
        </CardHeader>
        <CardContent>
          {demands.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">You have no demands yet.</div>
          ) : (
            <>
            {/* Desktop Table */}
            <div className="hidden md:block border rounded-md">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Device</TableHead>
                        <TableHead>Date Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {demands.map((demand) => (
                        <TableRow key={demand.id}>
                            <TableCell className="font-medium">{demand.brand} {demand.model}</TableCell>
                            <TableCell>{format(new Date(demand.createdAt), 'PPP')}</TableCell>
                            <TableCell>
                            <Badge variant={statusVariantMap[demand.status]}>{demand.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(demand.id)}>
                                    <Edit className="h-4 w-4 mr-1"/>
                                    Edit
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone. This will permanently delete your demand request.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(demand.id)}>Delete</AlertDialogAction>
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
            <div className="md:hidden">
              <Accordion type="single" collapsible className="w-full space-y-3">
                {demands.map((demand) => (
                  <AccordionItem value={demand.id} key={demand.id} className="border rounded-lg">
                    <AccordionTrigger className="p-4 text-sm">
                      <div className="flex-1 flex justify-between items-center mr-4">
                        <div className="text-left">
                          <p className="font-semibold">{demand.brand} {demand.model}</p>
                          <p className="text-xs text-muted-foreground mt-1">{format(new Date(demand.createdAt), 'PPP')}</p>
                        </div>
                        <Badge variant={statusVariantMap[demand.status]} className="text-xs">{demand.status}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t">
                      <div className="p-4 flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(demand.id)}>
                            <Edit className="h-4 w-4 mr-1"/>
                            Edit
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete your demand request.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(demand.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
