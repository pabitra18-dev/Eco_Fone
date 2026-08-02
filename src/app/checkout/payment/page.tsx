
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { initiateOrderForPayment } from '@/app/checkout/actions';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, Truck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [shippingDetails, setShippingDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod' | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false); // More robust guard state

  const COD_FEE = 100;
  const COD_PREPAYMENT = 1000;
  const VAT_RATE = 0.13;
  
  const onlineTotal = cartTotal;
  const codTotal = cartTotal + COD_FEE;
  
  const subtotal = cartTotal / (1 + VAT_RATE);
  const vat = cartTotal - subtotal;

  useEffect(() => {
    // This guard prevents redirection if an order is currently being processed.
    if (orderProcessing) return;

    const details = sessionStorage.getItem('shippingDetails');
    if (cartItems.length === 0 || !details) {
      router.replace('/checkout');
    } else {
      setShippingDetails(JSON.parse(details));
    }
  }, [cartItems, orderProcessing, router]);

  const handlePlaceOrder = async () => {
    if (!paymentMethod || !shippingDetails || !user) {
      toast({ title: "Error", description: "Something went wrong. Please start checkout again.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setOrderProcessing(true); // Set guard state immediately

    const totalAmount = paymentMethod === 'cod' ? codTotal : onlineTotal;
    
    try {
      const orderData: Omit<Order, 'id' | 'orderDate' | 'status'> = {
        userId: user.uid,
        email: user.email!,
        items: cartItems.map(item => ({ productId: item.id, productName: item.name, quantity: item.quantity, price: item.price })),
        subtotal: subtotal + (paymentMethod === 'cod' ? COD_FEE : 0),
        vat: vat,
        totalAmount: totalAmount,
        shippingAddress: shippingDetails,
        paymentMethod: paymentMethod,
        codFee: paymentMethod === 'cod' ? COD_FEE : undefined,
        codPrepayment: paymentMethod === 'cod' ? COD_PREPAYMENT : undefined,
      };

      const order = await initiateOrderForPayment(orderData, user.uid);
      
      if (order && order.id) {
        clearCart();
        sessionStorage.removeItem('shippingDetails');
        toast({ title: "Order Placed!", description: "Your order has been successfully placed." });
        router.push(`/order/${order.id}`);
        // No need to reset loading/processing state as we are navigating away
      } else {
        throw new Error('Order creation failed on the server.');
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      toast({ title: "Error", description: "Failed to place your order. Please try again.", variant: "destructive" });
      // On error, reset states to allow the user to try again.
      setIsLoading(false);
      setOrderProcessing(false);
    }
  };

  if (!shippingDetails) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="bg-background">
        <div className="container mx-auto px-4 py-12">
             <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink asChild><Link href="/cart">Cart</Link></BreadcrumbLink></BreadcrumbItem>
                     <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink asChild><Link href="/checkout">Shipping</Link></BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>Payment</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="flex justify-center">
                 <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Select Payment Method</CardTitle>
                        <CardDescription>Choose how you'd like to pay for your order.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <RadioGroup value={paymentMethod} onValueChange={(value: 'online' | 'cod') => setPaymentMethod(value)}>
                             <Label htmlFor="online" className="flex flex-col md:flex-row items-start space-x-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary">
                                <RadioGroupItem value="online" id="online" className="mt-1" />
                                <div className="flex-1">
                                    <h3 className="font-semibold flex items-center gap-2"><Wallet className="h-5 w-5 text-primary"/> Online Payment</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Pay securely with eSewa or Bank Transfer. No extra fees.</p>
                                </div>
                                <p className="font-bold text-lg md:ml-auto mt-2 md:mt-0">Total: NPR {onlineTotal.toLocaleString()}</p>
                            </Label>
                            <Label htmlFor="cod" className="flex flex-col md:flex-row items-start space-x-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary">
                                <RadioGroupItem value="cod" id="cod" className="mt-1" />
                                <div className="flex-1">
                                    <h3 className="font-semibold flex items-center gap-2"><Truck className="h-5 w-5 text-primary"/> Cash on Delivery</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Pay the remaining amount upon delivery.</p>
                                    <div className="mt-2 text-xs p-2 bg-yellow-100/50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 rounded-md">
                                        <p className="font-semibold flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5"/>Please Note:</p>
                                        <ul className="list-disc list-inside pl-1 mt-1">
                                            <li>A <span className="font-bold">NPR {COD_FEE}</span> delivery charge will be added.</li>
                                            <li>A <span className="font-bold">NPR {COD_PREPAYMENT}</span> security deposit is required now to confirm your order.</li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="font-bold text-lg md:ml-auto mt-2 md:mt-0">Total: NPR {codTotal.toLocaleString()}</p>
                            </Label>
                        </RadioGroup>
                         <Button onClick={handlePlaceOrder} disabled={!paymentMethod || isLoading} className="w-full" size="lg">
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Placing Order...</> : `Place Order`}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
