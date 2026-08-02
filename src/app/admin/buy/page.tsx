
'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { getAllBuyRequests, updateBuyRequestStatus, deleteBuyRequest } from '@/app/admin/buy/actions';
import type { Sell } from '@/lib/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Facebook, Link as LinkIcon, MessageSquare, Phone, Trash2, Handshake, Send } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


type BuyRequestStatus = Sell['status'];

const statusVariantMap: { [key in BuyRequestStatus]: "default" | "secondary" | "destructive" | "outline" } = {
  pending: "outline",
  negotiating: "default",
  accepted: "secondary",
  rejected: "destructive",
  completed: "default",
};

const SocialIcon = ({ platform }: { platform?: string }) => {
    switch (platform) {
        case 'facebook': return <Facebook className="h-3.5 w-3.5" />;
        case 'whatsapp': return <MessageSquare className="h-3.5 w-3.5" />;
        case 'viber': return <Phone className="h-3.5 w-3.5" />;
        default: return <LinkIcon className="h-3.5 w-3.5" />;
    }
}


function StatusSelector({ sell, onStatusChange, onDelete }: { sell: Sell; onStatusChange: (id: string, newStatus: BuyRequestStatus, price?: number) => void, onDelete: (id: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const [price, setPrice] = useState(sell.acceptedPrice || '');
  const [currentStatus, setCurrentStatus] = useState(sell.status);

  const handleStatusChange = (newStatus: BuyRequestStatus) => {
    setCurrentStatus(newStatus);
    if (newStatus !== 'negotiating') {
      startTransition(() => {
        onStatusChange(sell.id, newStatus, Number(price));
      });
    }
  };
  
  const handlePropose = () => {
    startTransition(() => {
      onStatusChange(sell.id, 'negotiating', Number(price));
    });
  };

  const handleDeleteClick = () => {
     startTransition(() => {
        onDelete(sell.id);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <Input
        type="number"
        className="w-full sm:w-28"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        disabled={isPending}
      />
      <div className="flex gap-2">
        <Select onValueChange={handleStatusChange} value={currentStatus} disabled={isPending}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="negotiating">Negotiating</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {currentStatus === 'negotiating' && (
             <Button variant="outline" size="icon" onClick={handlePropose} disabled={isPending || !price} title="Propose new price">
                <Send className="h-4 w-4" />
            </Button>
        )}
      </div>
       <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" disabled={isPending}><Trash2 className="h-4 w-4" /></Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this sell request.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteClick}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}

const DetailSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
        <h4 className="font-semibold text-md mb-2 border-b pb-2">{title}</h4>
        <div className="space-y-1 text-sm text-muted-foreground">{children}</div>
    </div>
);

const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between">
        <span className="font-medium text-foreground">{label}:</span>
        <span>{value}</span>
    </div>
);

function SellRequestDetailsModal({ sell }: { sell: Sell }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">View Details</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Sell Request Details</DialogTitle>
                    <DialogDescription>
                        Full submission for {sell.brand} {sell.model} from {sell.fullName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto p-1">
                    {/* Left Column */}
                    <div className="space-y-6">
                         <DetailSection title="Customer Information">
                            <DetailRow label="Name" value={sell.fullName} />
                            <DetailRow label="Email" value={sell.email} />
                            <DetailRow label="Phone" value={sell.phone} />
                            <DetailRow label="Location" value={sell.location} />
                            {sell.socialMediaHandle && <DetailRow label={sell.socialMediaPlatform || 'Social'} value={sell.socialMediaHandle} />}
                        </DetailSection>

                        <DetailSection title="Device Information">
                            <DetailRow label="Device" value={`${sell.brand} ${sell.model}`} />
                            <DetailRow label="Storage" value={sell.storage} />
                            <DetailRow label="RAM" value={sell.ram} />
                             <DetailRow label="Device Age" value={`${sell.age} years`} />
                            <DetailRow label="Switches On?" value={sell.deviceSwitchesOn ? 'Yes' : 'No'} />
                            <DetailRow label="MDMS Registered?" value={sell.isMDMSRegistered ? 'Yes' : 'No'} />
                        </DetailSection>

                        <DetailSection title="Condition Assessment">
                            <DetailRow label="Overall Condition" value={sell.overallCondition} />
                            <DetailRow label="Screen Condition" value={sell.screenCondition} />
                            <DetailRow label="Battery Health" value={sell.batteryHealth || 'N/A'} />
                        </DetailSection>

                        <DetailSection title="Problems Reported">
                            <p>{sell.deviceProblems.join(', ')}</p>
                        </DetailSection>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {sell.status === 'negotiating' && (
                             <DetailSection title="Negotiation Details">
                                <div className="space-y-2 rounded-md border p-4 bg-muted/50">
                                    <DetailRow label="Customer Ask" value={sell.negotiationPriceRange ? `NPR ${sell.negotiationPriceRange[0].toLocaleString()} - ${sell.negotiationPriceRange[1].toLocaleString()}`: 'N/A'} />
                                    <div>
                                        <h5 className="font-medium text-foreground mb-1">Customer's Reason</h5>
                                        <p className="text-xs italic">{sell.negotiationReason || 'No reason provided.'}</p>
                                    </div>
                                </div>
                            </DetailSection>
                        )}
                        <DetailSection title="Accessories & Purchase">
                            <DetailRow label="Original Accessories" value={sell.hasOriginalAccessories ? 'Yes' : 'No'} />
                            {sell.hasOriginalAccessories && <DetailRow label="Included" value={sell.accessories.join(', ') + (sell.otherAccessory ? `, ${sell.otherAccessory}` : '')} />}
                            {sell.accessoryDetails && <p className="mt-2 text-xs italic">{sell.accessoryDetails}</p>}
                            <DetailRow label="Purchase Bill" value={sell.hasPurchaseBill ? 'Yes' : 'No'} />
                            <DetailRow label="IMEI Matches Box" value={sell.imeiMatchesBox ? 'Yes' : 'No'} />
                        </DetailSection>

                        <DetailSection title="Additional Info">
                            <p className="text-xs italic">{sell.additionalInfo || 'No additional information provided.'}</p>
                        </DetailSection>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


export default function AdminSellRequestsPage() {
  const [quotes, setQuotes] = useState<Sell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const allQuotes = await getAllBuyRequests();
      setQuotes(allQuotes);
    } catch (err) {
      setError('Failed to fetch sell requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleStatusChange = async (id: string, status: BuyRequestStatus, acceptedPrice?: number) => {
    const result = await updateBuyRequestStatus(id, status, acceptedPrice);
    if (result.success) {
      toast({ title: 'Status Updated', description: `Sell request has been updated to ${status}.` });
      fetchQuotes(); // Re-fetch to show the latest status
    } else {
      toast({ title: 'Update Failed', description: result.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteBuyRequest(id);
    if (result.success) {
      toast({ title: 'Request Deleted', description: 'The sell request has been removed.' });
      fetchQuotes(); // Re-fetch to show the latest status
    } else {
      toast({ title: 'Deletion Failed', description: result.message, variant: 'destructive' });
    }
  };


  if (loading) {
    return <div className="text-center p-8">Loading sell requests...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-destructive">Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Sell Requests</CardTitle>
        <CardDescription>Manage and review all incoming requests from customers wanting to sell their devices.</CardDescription>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No sell requests found.</p>
        ) : (
            <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Device</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead>Quoted Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {quotes.map((quote) => (
                            <TableRow key={quote.id}>
                            <TableCell>
                                <div className="font-medium">{quote.fullName}</div>
                                <div className="text-sm text-muted-foreground">{quote.email}</div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{quote.brand} {quote.model}</div>
                                <div className="text-sm text-muted-foreground">{quote.storage} / {quote.ram}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge variant={statusVariantMap[quote.status as BuyRequestStatus]}>{quote.status}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm font-medium">NPR {quote.acceptedPrice?.toLocaleString() || '-'}</div>
                                {quote.status === 'negotiating' && quote.negotiationPriceRange && (
                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Handshake className="h-3 w-3" /> 
                                        Cust. Ask: NPR {quote.negotiationPriceRange[0].toLocaleString()} - {quote.negotiationPriceRange[1].toLocaleString()}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <SellRequestDetailsModal sell={quote} />
                                    <StatusSelector sell={quote} onStatusChange={handleStatusChange} onDelete={handleDelete} />
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
                        {quotes.map((quote) => (
                        <AccordionItem value={quote.id} key={quote.id} className="border rounded-lg">
                            <AccordionTrigger className="p-4 text-sm hover:no-underline">
                                <div className="flex-1 flex justify-between items-center mr-4 text-left">
                                    <div>
                                        <p className="font-semibold">{quote.fullName}</p>
                                        <p className="text-xs text-muted-foreground">{quote.brand} {quote.model}</p>
                                    </div>
                                    <Badge variant={statusVariantMap[quote.status as BuyRequestStatus]}>{quote.status}</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 border-t space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Quoted Price:</span>
                                    <div className="font-medium">NPR {quote.acceptedPrice?.toLocaleString() || '-'}</div>
                                </div>
                                {quote.status === 'negotiating' && quote.negotiationPriceRange && (
                                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Handshake className="h-3 w-3" />
                                            <span>Customer Ask:</span>
                                        </div>
                                        <span>NPR {quote.negotiationPriceRange[0].toLocaleString()} - {quote.negotiationPriceRange[1].toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="pt-2">
                                     <StatusSelector sell={quote} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                                </div>
                                <SellRequestDetailsModal sell={quote} />
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
