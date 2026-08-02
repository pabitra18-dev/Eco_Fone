
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrders } from "@/lib/orders";
import type { Order } from "@/lib/types";
import { OrderStatusSelector } from "./order-status-selector";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteOrderDialog } from "./delete-order-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteAllOrders } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const statusVariantMap: { [key in Order['status']]: "default" | "secondary" | "destructive" | "outline" } = {
    "Delivered": "default",
    "Shipped": "secondary",
    "Processing": "outline",
    "Pending Payment": "outline",
    "Payment Verified": "default",
    "Cancelled": "destructive"
};

const OrdersPageSkeleton = () => (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View and manage all customer orders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 max-w-sm" />
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead className="hidden md:table-cell">Date</TableHead>
                                <TableHead className="hidden sm:table-cell">Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    <TableCell className="text-center"><Skeleton className="h-9 w-36 mx-auto" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
);

function DeleteAllOrdersButton({ onAllOrdersDeleted }: { onAllOrdersDeleted: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleDeleteAll = () => {
        startTransition(async () => {
            const result = await deleteAllOrders();
            if (result.success) {
                toast({
                    title: "All Orders Deleted",
                    description: "All existing orders have been removed.",
                });
                onAllOrdersDeleted();
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to delete all orders.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete All Orders
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete ALL orders from the database.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll} disabled={isPending}>
                        {isPending ? "Deleting..." : "Yes, delete all orders"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        const initialOrders = await getOrders();
        setOrders(initialOrders);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        if (!searchTerm) {
            return orders;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return orders.filter(order =>
            order.id.toLowerCase().includes(lowerCaseSearchTerm) ||
            order.shippingAddress.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            order.email.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [orders, searchTerm]);

    if (loading) {
        return <OrdersPageSkeleton />;
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Orders</CardTitle>
                        <CardDescription>View and manage all customer orders.</CardDescription>
                    </div>
                    {orders.length > 0 && <DeleteAllOrdersButton onAllOrdersDeleted={fetchOrders} />}
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Search orders by ID, name, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    {/* Desktop Table */}
                    <div className="hidden md:block border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">{order.shippingAddress.name}</div>
                                            <div className="text-xs text-muted-foreground">#{order.id.slice(0, 7)}</div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                        <TableCell className="hidden sm:table-cell"><Badge variant={statusVariantMap[order.status]}>{order.status}</Badge></TableCell>
                                        <TableCell className="text-right font-medium">NPR {order.totalAmount.toLocaleString()}</TableCell>
                                        <TableCell className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                                            <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                                            {order.paymentScreenshotUrl && (
                                                <Button asChild variant="outline" size="icon">
                                                <Link href={order.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View Proof</span>
                                                </Link>
                                                </Button>
                                            )}
                                            {order.status === 'Cancelled' && (
                                                <DeleteOrderDialog orderId={order.id} onOrderDeleted={fetchOrders} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Accordion */}
                    <div className="md:hidden space-y-3">
                       {filteredOrders.length > 0 ? (
                         <Accordion type="single" collapsible className="w-full">
                            {filteredOrders.map((order) => (
                                <AccordionItem value={order.id} key={order.id} className="border rounded-lg">
                                    <AccordionTrigger className="p-4 text-sm hover:no-underline">
                                    <div className="flex-1 flex justify-between items-center mr-4 text-left">
                                        <div>
                                        <p className="font-semibold">{order.shippingAddress.name}</p>
                                        <p className="text-xs text-muted-foreground">#{order.id.slice(0, 7)} &middot; {new Date(order.orderDate).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant={statusVariantMap[order.status]}>{order.status}</Badge>
                                    </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 border-t space-y-4">
                                        <div className="flex justify-between font-bold text-base">
                                            <span>Total:</span>
                                            <span>NPR {order.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col gap-2 items-center justify-center pt-2">
                                            <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                                            <div className="flex gap-2 w-full">
                                                {order.paymentScreenshotUrl && (
                                                    <Button asChild variant="outline" size="sm" className="flex-1">
                                                    <Link href={order.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Proof
                                                    </Link>
                                                    </Button>
                                                )}
                                                {order.status === 'Cancelled' && (
                                                    <DeleteOrderDialog orderId={order.id} onOrderDeleted={fetchOrders} />
                                                )}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                            </Accordion>
                       ) : (
                            <div className="text-center h-24 text-muted-foreground flex items-center justify-center">No orders found.</div>
                       )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
