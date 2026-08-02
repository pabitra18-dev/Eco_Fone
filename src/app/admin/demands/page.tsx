
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDemands, updateDemandStatus, deleteDemand } from "./actions";
import type { Demand, ProductCategories } from '@/lib/types';
import { format } from "date-fns";
import { Handshake, Mail, Phone, ExternalLink, Wallet, Trash2, Camera, Gamepad2, BatteryFull, Hand, Diamond } from "lucide-react";
import Link from 'next/link';
import { useEffect, useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


type DemandStatus = Demand['status'];

const statusVariantMap: { [key in DemandStatus]: "default" | "secondary" | "destructive" | "outline" } = {
  new: "outline",
  'in progress': "secondary",
  fulfilled: "default",
  rejected: "destructive"
};

const CATEGORIES: { id: keyof ProductCategories; label: string, icon: React.ElementType }[] = [
    { id: 'gamingPerformance', label: 'Gaming Performance', icon: Gamepad2 },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'battery', label: 'Battery', icon: BatteryFull },
    { id: 'looksAndFeel', label: 'Looks & In-hand feel', icon: Hand },
    { id: 'valueForMoney', label: 'Value for Money', icon: Diamond }
];

function StatusSelector({ demand, onStatusChange, onDelete }: { demand: Demand, onStatusChange: (id: string, status: DemandStatus) => void, onDelete: (id: string) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: DemandStatus) => {
    startTransition(() => {
      onStatusChange(demand.id, newStatus);
    });
  };

  const handleDelete = () => {
    startTransition(() => {
      onDelete(demand.id);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={handleStatusChange} defaultValue={demand.status} disabled={isPending}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="in progress">In Progress</SelectItem>
          <SelectItem value="fulfilled">Fulfilled</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      {demand.status === 'rejected' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" disabled={isPending}><Trash2 className="h-4 w-4" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete the demand.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

const DemandsPageSkeleton = () => (
    <Card>
        <CardHeader>
          <CardTitle>All Demands</CardTitle>
          <CardDescription>A list of all phones requested by customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Demand</TableHead>
                <TableHead>Requested On</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-56" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
    </Card>
);

const DetailRow = ({ label, value, href }: { label: string, value: React.ReactNode, href?: string }) => (
    <div className="flex justify-between items-start">
        <span className="font-medium text-foreground">{label}:</span>
        {href ? <Link href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{value}</Link> : <span className="text-muted-foreground text-right">{value}</span>}
    </div>
);


const DemandDetailsModal = ({ demand }: { demand: Demand }) => (
    <DialogContent className="max-w-2xl">
        <DialogHeader>
            <DialogTitle>Demand Details</DialogTitle>
            <DialogDescription>
                Request from {demand.fullName} on {format(new Date(demand.createdAt), 'PPP')}
            </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto p-1">
            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Customer Information</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <DetailRow label="Name" value={demand.fullName} />
                        <DetailRow label="Email" value={demand.email} href={`mailto:${demand.email}`} />
                        <DetailRow label="Phone" value={demand.phone} />
                        {demand.socialMedia && <DetailRow label="Social Media" value={demand.socialMedia} href={demand.socialMedia}/>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-lg">Requested Device</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <DetailRow label="Device" value={`${demand.brand} ${demand.model}`} />
                        <DetailRow label="Storage" value={demand.storage} />
                        <DetailRow label="RAM" value={demand.ram} />
                        {demand.batteryHealth && <DetailRow label="Battery Health" value={demand.batteryHealth} />}
                        {demand.expectedPrice && <DetailRow label="Expected Price" value={`NPR ${demand.expectedPrice[0].toLocaleString()} - ${demand.expectedPrice[1].toLocaleString()}`} />}
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Performance Preferences</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {demand.categories && Object.keys(demand.categories).length > 0 ? (
                             CATEGORIES.filter(cat => demand.categories[cat.id]).map(cat => (
                                <DetailRow key={cat.id} label={cat.label} value={<Badge variant="secondary">{demand.categories[cat.id]}</Badge>} />
                            ))
                        ) : <p className="text-muted-foreground text-sm">No specific preferences provided.</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Request Status</CardTitle></CardHeader>
                    <CardContent>
                        <Badge variant={statusVariantMap[demand.status]}>{demand.status}</Badge>
                    </CardContent>
                </Card>
            </div>
        </div>
    </DialogContent>
);

export default function DemandsPage() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const { toast } = useToast();

  const fetchDemands = async () => {
    setLoading(true);
    const data = await getDemands();
    setDemands(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchDemands();
  }, []);

  const handleStatusChange = async (id: string, status: DemandStatus) => {
    const result = await updateDemandStatus(id, status);
    if (result.success) {
      toast({ title: "Status Updated", description: `Demand status has been updated to ${status}.` });
      fetchDemands(); // Re-fetch to show the latest status
    } else {
      toast({ title: 'Update Failed', description: result.message, variant: 'destructive' });
    }
  };
  
  const handleDelete = async (id: string) => {
    const result = await deleteDemand(id);
    if (result.success) {
      toast({ title: "Demand Deleted", description: `The demand has been successfully deleted.` });
      fetchDemands();
    } else {
      toast({ title: 'Deletion Failed', description: result.message, variant: 'destructive' });
    }
  }

  if (loading) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Handshake className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Demands</h1>
                    <p className="text-muted-foreground">Customer requests for specific phones.</p>
                </div>
            </div>
            <DemandsPageSkeleton />
        </div>
    );
  }

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedDemand(null)}>
        <div>
        <div className="flex items-center gap-4 mb-8">
            <Handshake className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-3xl font-bold">Demands</h1>
                <p className="text-muted-foreground">Customer requests for specific phones.</p>
            </div>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>All Demands</CardTitle>
            <CardDescription>A list of all phones requested by customers.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Demand</TableHead>
                            <TableHead>Requested On</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {demands.length > 0 ? (
                            demands.map((demand) => (
                            <DialogTrigger asChild key={demand.id}>
                                <TableRow onClick={() => setSelectedDemand(demand)} className="cursor-pointer">
                                    <TableCell>
                                    <div className="font-medium">{demand.fullName}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                        <Mail className="h-3.5 w-3.5" />
                                        <a href={`mailto:${demand.email}`} onClick={(e) => e.stopPropagation()} className="hover:underline">{demand.email}</a>
                                    </div>
                                    </TableCell>
                                    <TableCell>
                                    <div className="font-medium">{demand.brand} {demand.model}</div>
                                    {demand.expectedPrice && (
                                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                            <Wallet className="h-3.5 w-3.5" />
                                            <span>NPR {demand.expectedPrice[0].toLocaleString()} - {demand.expectedPrice[1].toLocaleString()}</span>
                                        </div>
                                    )}
                                    </TableCell>
                                    <TableCell>{format(new Date(demand.createdAt), 'PPP')}</TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <StatusSelector demand={demand} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                                    </TableCell>
                                </TableRow>
                            </DialogTrigger>
                            ))
                        ) : (
                            <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No demands yet.
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
                {/* Mobile Accordion */}
                <div className="md:hidden space-y-3">
                    {demands.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                        {demands.map((demand) => (
                            <AccordionItem value={demand.id} key={demand.id} className="border rounded-lg">
                                <AccordionTrigger className="p-4 text-sm hover:no-underline">
                                    <div className="flex-1 flex justify-between items-center mr-4 text-left">
                                        <div>
                                            <p className="font-semibold">{demand.brand} {demand.model}</p>
                                            <p className="text-xs text-muted-foreground">{demand.fullName}</p>
                                        </div>
                                        <Badge variant={statusVariantMap[demand.status]}>{demand.status}</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 border-t space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Requested:</span>
                                        <span>{format(new Date(demand.createdAt), 'PPP')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Budget:</span>
                                        <span className="font-bold">
                                        {demand.expectedPrice ? `NPR ${demand.expectedPrice[0].toLocaleString()} - ${demand.expectedPrice[1].toLocaleString()}` : "N/A"}
                                        </span>
                                    </div>
                                    <div className="pt-2 flex flex-col gap-2">
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedDemand(demand)}>View Details</Button>
                                        </DialogTrigger>
                                        <StatusSelector demand={demand} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                        </Accordion>
                    ) : (
                        <div className="text-center h-24 text-muted-foreground flex items-center justify-center">No demands yet.</div>
                    )}
                </div>
            </CardContent>
        </Card>
        </div>
        {selectedDemand && <DemandDetailsModal demand={selectedDemand} />}
    </Dialog>
  );
}
