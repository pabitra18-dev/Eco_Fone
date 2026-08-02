"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from 'next/link';
import { getOrdersByUserId } from "@/app/account/orders/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const statusVariantMap: { [key in Order['status']]: "default" | "secondary" | "destructive" | "outline" } = {
    "Delivered": "default",
    "Shipped": "secondary",
    "Processing": "outline",
    "Pending Payment": "outline",
    "Payment Verified": "default",
    "Cancelled": "destructive"
};

const OrdersPageSkeleton = () => (
    <Card>
        <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>A list of your past purchases.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Desktop Skeleton */}
           <div className="hidden md:block border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
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

export default function UserOrdersPage() {
    const { isAuthenticated, getIdToken } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        const idToken = await getIdToken();
        if (!idToken) {
            setError("You are not logged in.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const userOrders = await getOrdersByUserId(idToken);
            setOrders(userOrders);
        } catch (err: any) {
            console.error("Failed to fetch orders:", err);
            setError(err.message || "An unexpected error occurred.");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [getIdToken]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        } else if (isAuthenticated === false) {
            setLoading(false);
            setOrders([]);
        }
    }, [isAuthenticated, fetchOrders]); 

    if (loading || isAuthenticated === null) {
        return (
             <div>
                <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
                <OrdersPageSkeleton />
            </div>
        )
    }
    
    if (isAuthenticated === false) {
        return (
             <div>
                <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
                <Card className="mt-8">
                    <CardContent className="pt-6 text-center">
                        <p>Please log in to see your orders.</p>
                        <Button asChild className="mt-4">
                            <Link href="/auth/login?redirect=/account/orders">Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
             <div>
                <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
                <p className="text-destructive">Error fetching orders: {error}</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>A list of your past purchases.</CardDescription>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">You have no orders yet.</div>
                    ) : (
                        <>
                        {/* Desktop Table */}
                        <div className="hidden md:block border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/order/${order.id}`} className="text-primary hover:underline">
                                                    #{order.id.slice(0, 7)}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{format(new Date(order.orderDate), 'PPP')}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariantMap[order.status]}>{order.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">NPR {order.totalAmount.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Accordion */}
                        <div className="md:hidden">
                            <Accordion type="single" collapsible className="w-full space-y-3">
                                {orders.map((order) => (
                                    <AccordionItem value={order.id} key={order.id} className="border rounded-lg">
                                        <AccordionTrigger className="p-4 text-sm">
                                             <div className="flex-1 flex justify-between items-center mr-4">
                                                <div className="text-left">
                                                    <p className="font-semibold text-primary">#{order.id.slice(0, 7)}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(order.orderDate), 'PPP')}</p>
                                                </div>
                                                <Badge variant={statusVariantMap[order.status]} className="text-xs">{order.status}</Badge>
                                             </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="border-t">
                                            <div className="p-4 space-y-4 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">Total Amount</span>
                                                    <span className="font-bold">NPR {order.totalAmount.toLocaleString()}</span>
                                                </div>
                                                <Link href={`/order/${order.id}`} className="block w-full">
                                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                                        View Order Details
                                                    </Button>
                                                </Link>
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
