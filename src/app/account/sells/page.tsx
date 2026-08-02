'use client';

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Sell } from '@/lib/types';
import { getSellRequestsByUserId, acceptOffer, declineOffer, negotiateOffer } from '@/app/account/sells/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, Handshake, ThumbsDown, ThumbsUp, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type SellStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'negotiating';

const statusVariantMap: { [key in SellStatus]: "default" | "secondary" | "destructive" | "outline" } = {
  pending: "outline",
  negotiating: "default",
  accepted: "secondary",
  rejected: "destructive",
  completed: "default",
};

const SellsPageSkeleton = () => (
    <Card>
        <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>A list of the phones you've submitted to sell.</CardDescription>
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
                            <TableHead className="text-right">Admin Quote</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
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

function NegotiationModal({ sell, onAction, trigger }: { sell: Sell, onAction: () => void, trigger: React.ReactNode }) {
    const { getIdToken } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [priceRange, setPriceRange] = useState<[number, number]>(sell.negotiationPriceRange || [sell.acceptedPrice || 0, (sell.acceptedPrice || 0) + 10000]);
    const [reason, setReason] = useState(sell.negotiationReason || '');
    const [open, setOpen] = useState(false);

    const handleNegotiate = async () => {
        const idToken = await getIdToken();
        if (!idToken) {
            toast({ title: "Authentication Error", description: "Could not verify your session.", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            try {
                const result = await negotiateOffer(idToken, sell.id, priceRange, reason);
                if (result.success) {
                    toast({ title: "Negotiation Submitted", description: "Your new price range has been sent to the admin." });
                    onAction();
                    setOpen(false);
                } else {
                    throw new Error("Could not submit negotiation. Please try again.");
                }
            } catch(error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Negotiate Your Price</DialogTitle>
                    <DialogDescription>
                        Propose a new price range for your {sell.brand} {sell.model}. The admin's current offer is NPR {sell.acceptedPrice?.toLocaleString()}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="pt-4">
                        <Label>Your Desired Price Range</Label>
                        <p className="text-sm text-muted-foreground">NPR {priceRange[0].toLocaleString()} - NPR {priceRange[1].toLocaleString()}</p>
                        <Slider
                            min={0}
                            max={150000}
                            step={500}
                            value={priceRange}
                            onValueChange={(value: [number, number]) => setPriceRange(value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="negotiationReason">Reason for Negotiation (Optional)</Label>
                        <Textarea id="negotiationReason" placeholder="e.g., I believe the condition warrants a higher price..." value={reason} onChange={(e) => setReason(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleNegotiate} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Offer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function NegotiationActions({ sell, onAction }: { sell: Sell, onAction: () => void }) {
    const { getIdToken } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleAction = async (action: 'accept' | 'decline') => {
        const idToken = await getIdToken();
        if (!idToken) {
            toast({ title: "Authentication Error", description: "Could not verify your session.", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            try {
                const result = action === 'accept' 
                    ? await acceptOffer(idToken, sell.id)
                    : await declineOffer(idToken, sell.id);
                    
                if (result.success) {
                    toast({ title: `Offer ${action === 'accept' ? 'Accepted' : 'Declined'}!`, description: action === 'accept' ? "We will contact you shortly to finalize the process." : "Thank you for considering our offer." });
                    onAction();
                } else {
                    throw new Error(`Could not ${action} the offer. Please try again.`);
                }
            } catch(error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        });
    }

    return (
        <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button size="sm" onClick={() => handleAction('accept')} disabled={isPending}>
                <ThumbsUp className="h-4 w-4 md:mr-1.5"/> <span className="hidden md:inline">Accept</span>
            </Button>
             <NegotiationModal
                sell={sell}
                onAction={onAction}
                trigger={
                    <Button size="sm" variant="outline" disabled={isPending}>
                        <Handshake className="h-4 w-4 md:mr-1.5" /> <span className="hidden md:inline">Negotiate</span>
                    </Button>
                }
            />
            <Button size="sm" variant="destructive" onClick={() => handleAction('decline')} disabled={isPending}>
                <ThumbsDown className="h-4 w-4 md:mr-1.5"/> <span className="hidden md:inline">Decline</span>
            </Button>
        </div>
    )
}

export default function UserSellsPage() {
  const { isAuthenticated, getIdToken } = useAuth();
  const [requests, setRequests] = useState<Sell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    const idToken = await getIdToken();
    if (!idToken) {
        setError("You are not logged in.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const userRequests = await getSellRequestsByUserId(idToken);
      setRequests(userRequests);
    } catch (err: any) {
      console.error("Failed to fetch sell requests:", err);
      setError(err.message || "An unexpected error occurred.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    } else if (isAuthenticated === false) {
      setLoading(false);
      setRequests([]);
    }
  }, [isAuthenticated, fetchRequests]);

  if (loading || isAuthenticated === null) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">My Sell Requests</h1>
        <SellsPageSkeleton />
      </div>
    );
  }
  
  if (isAuthenticated === false) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">My Sell Requests</h1>
         <Card className="mt-8">
            <CardContent className="pt-6 text-center">
                <p>Please log in to see your sell requests.</p>
                <Button asChild className="mt-4">
                    <Link href="/auth/login?redirect=/account/sells">Login</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">My Sell Requests</h1>
            <p className="text-destructive">Error: {error}</p>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Sell Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>A list of the phones you've submitted to sell.</CardDescription>
        </CardHeader>
        <CardContent>
            {requests.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">You have no sell requests yet.</div>
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
                            <TableHead className="text-right">Admin Quote</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((req) => (
                            <React.Fragment key={req.id}>
                                <TableRow>
                                    <TableCell className="font-medium">{req.brand} {req.model}</TableCell>
                                    <TableCell>{format(new Date(req.createdAt), 'PPP')}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariantMap[req.status as SellStatus]}>{req.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {req.acceptedPrice ? `NPR ${req.acceptedPrice.toLocaleString()}` : (req.negotiationPriceRange ? `~ NPR ${req.negotiationPriceRange[0].toLocaleString()}` : '-')}
                                    </TableCell>
                                </TableRow>
                                {req.status === 'negotiating' && req.acceptedPrice && (
                                    <TableRow className="bg-muted/50 hover:bg-muted">
                                        <TableCell colSpan={4} className="p-0">
                                            <Alert variant="default" className="border-l-4 border-primary rounded-none">
                                                <Handshake className="h-4 w-4" />
                                                <AlertTitle>New Offer Received: NPR {req.acceptedPrice.toLocaleString()}</AlertTitle>
                                                <AlertDescription className="flex justify-between items-center">
                                                    The admin has proposed a new price for your device.
                                                    <NegotiationActions sell={req} onAction={fetchRequests}/>
                                                </AlertDescription>
                                            </Alert>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Accordion */}
                <div className="md:hidden">
                    <Accordion type="single" collapsible className="w-full space-y-3">
                        {requests.map((req) => (
                            <AccordionItem value={req.id} key={req.id} className="border rounded-lg">
                                <AccordionTrigger className="p-4 text-sm">
                                    <div className="flex-1 flex justify-between items-center mr-4">
                                        <div className="text-left">
                                            <p className="font-semibold">{req.brand} {req.model}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{format(new Date(req.createdAt), 'PPP')}</p>
                                        </div>
                                        <Badge variant={statusVariantMap[req.status as SellStatus]} className="text-xs">{req.status}</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="border-t">
                                    <div className="p-4 space-y-4 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Admin Quote</span>
                                            <span className="font-medium">
                                                {req.acceptedPrice ? `NPR ${req.acceptedPrice.toLocaleString()}` : (req.negotiationPriceRange ? `~ NPR ${req.negotiationPriceRange[0].toLocaleString()}` : '-')}
                                            </span>
                                        </div>
                                        {req.status === 'negotiating' && req.acceptedPrice && (
                                            <Alert variant="default" className="border-l-4 border-primary rounded-md !mt-4">
                                                <Handshake className="h-4 w-4" />
                                                <AlertTitle className="text-base">New Offer: NPR {req.acceptedPrice.toLocaleString()}</AlertTitle>
                                                <AlertDescription className="mt-2">
                                                    <p className="mb-3 text-xs">The admin has proposed a new price.</p>
                                                    <NegotiationActions sell={req} onAction={fetchRequests}/>
                                                </AlertDescription>
                                            </Alert>
                                        )}
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
