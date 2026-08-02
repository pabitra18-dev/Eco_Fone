
import { getOrderById } from "@/lib/orders";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Wallet, Truck } from "lucide-react";
import { InvoiceDownloadButton } from "./invoice-download-button";
import { PaymentSubmissionForm } from "./payment-submission-form";
import { getAdminSettings } from "@/lib/users";

export default async function OrderDetailsPage({ params: { id } }: { params: { id: string } }) {
    const order = await getOrderById(id);

    if (!order) {
        notFound();
    }
    
    let adminSettings = null;
    try {
        adminSettings = await getAdminSettings();
    } catch(e) {
        console.error("Could not fetch admin settings for order page", e)
    }

    const statusVariantMap: { [key in typeof order.status]: "default" | "secondary" | "destructive" | "outline" } = {
        "Delivered": "default",
        "Shipped": "secondary",
        "Processing": "outline",
        "Payment Verified": "default",
        "Pending Payment": "outline",
        "Cancelled": "destructive"
    };
    
    const isPaymentPending = order.status === 'Pending Payment';
    const isCod = order.paymentMethod === 'cod';

    let totalToPayNow = order.totalAmount;
    if (isCod && isPaymentPending) {
        totalToPayNow = order.codPrepayment || 0;
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Card className="w-full">
                <CardHeader className="text-center bg-muted/20 p-8">
                    {order.status !== 'Pending Payment' && order.status !== 'Cancelled' ? (
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    ) : (
                        <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
                    )}
                    <CardTitle className="mt-4 text-3xl">
                        {isPaymentPending ? "Action Required" : "Thank You For Your Order!"}
                    </CardTitle>
                    <CardDescription className="text-lg">
                        {isPaymentPending 
                            ? `Your order requires payment to proceed. We've sent a confirmation to ${order.email}.`
                            : `Your order status is '${order.status}'.`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Order ID</span>
                            <span className="font-medium">#{order.id.slice(0, 7)}...</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Order Date</span>
                            <span className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={statusVariantMap[order.status]}>{order.status}</Badge>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Method</span>
                            <span className="font-medium capitalize flex items-center gap-2">
                                {order.paymentMethod === 'cod' ? <Truck className="h-4 w-4"/> : <Wallet className="h-4 w-4"/>}
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Order Summary</h3>
                        <div className="space-y-2 rounded-md border p-4">
                            {order.items.map((item) => (
                                <div key={item.productId} className="flex justify-between items-center text-sm">
                                    <span>{item.productName} (x{item.quantity})</span>
                                    <span>NPR {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            {isCod && order.codFee && (
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Fee (COD)</span>
                                    <span>NPR {order.codFee.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="border-t my-2"></div>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>NPR {order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">VAT (13%)</span>
                                <span>NPR {order.vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span>NPR {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                             {isCod && order.codPrepayment && (
                                <>
                                 <div className="flex justify-between font-semibold text-primary">
                                    <span>Security Deposit (Due Now)</span>
                                    <span>NPR {order.codPrepayment.toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Remaining on Delivery</span>
                                    <span>NPR {(order.totalAmount - order.codPrepayment).toLocaleString()}</span>
                                 </div>
                                </>
                            )}
                        </div>
                    </div>

                     <div>
                        <h3 className="font-semibold mb-2">Shipping Address</h3>
                        <div className="text-sm text-muted-foreground">
                            <p>{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.localLevel}, {order.shippingAddress.district}, {order.shippingAddress.province}</p>
                            <p>{order.shippingAddress.phone}</p>
                        </div>
                    </div>
                     
                    {isPaymentPending && (
                        <Card className="mt-6 bg-blue-50/50 dark:bg-blue-900/10 border-blue-500/30">
                             <CardHeader>
                                <CardTitle className="text-blue-800 dark:text-blue-300">Submit Payment Proof</CardTitle>
                                <CardDescription>To confirm your order, please complete the payment and upload the proof.</CardDescription>
                             </CardHeader>
                             <CardContent>
                                <PaymentSubmissionForm 
                                    orderId={order.id} 
                                    totalAmount={totalToPayNow}
                                    esewaMobileNumber={adminSettings?.esewaMobileNumber ?? ''}
                                />
                             </CardContent>
                        </Card>
                    )}
                </CardContent>
                <CardFooter className="p-6 md:p-8 border-t flex justify-center gap-4">
                    <Button asChild><Link href="/products">Continue Shopping</Link></Button>
                    <InvoiceDownloadButton order={order} />
                </CardFooter>
            </Card>
        </div>
    );
}
