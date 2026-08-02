
"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, ShoppingCart as ShoppingCartIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function CartClient() {
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  const originalTotal = cartItems.reduce((total, item) => {
    const priceToUse = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : item.price;
    return total + (priceToUse * item.quantity);
  }, 0);

  const discount = originalTotal - cartTotal;

  const VAT_RATE = 0.13;
  const subtotal = cartTotal / (1 + VAT_RATE);
  const vat = cartTotal - subtotal;


  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <ShoppingCartIcon className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-semibold">You need to be logged in</h2>
        <p className="text-muted-foreground mt-2">Please log in to view your cart and continue shopping.</p>
        <Button asChild className="mt-6">
          <Link href="/auth/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Your Cart</h1>
          <p className="mt-2 text-lg text-muted-foreground">Review your items and proceed to checkout.</p>
      </div>
      {cartItems.length === 0 ? (
         <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <Button asChild className="mt-4">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-2xl">Your Items</CardTitle>
                <Button variant="outline" size="sm" onClick={clearCart}>Clear Cart</Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cartItems.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={item.images[0]}
                                        alt={item.name}
                                        width={64}
                                        height={64}
                                        className="rounded-md object-cover border"
                                    />
                                    <div>
                                        <Link href={`/products/${item.slug}`} className="font-medium hover:text-primary leading-tight">{item.name}</Link>
                                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-medium whitespace-nowrap">NPR {item.price.toLocaleString()}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 <div className="flex justify-between text-sm">
                  <span>Original Price</span>
                  <span className="line-through">NPR {originalTotal.toLocaleString()}</span>
                </div>
                 {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>- NPR {discount.toLocaleString()}</span>
                  </div>
                )}
                <Separator/>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>NPR {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>VAT (13%)</span>
                  <span>NPR {vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-4">
                  <span>Total Payable</span>
                  <span>NPR {cartTotal.toLocaleString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
