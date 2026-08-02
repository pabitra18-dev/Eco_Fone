"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
}

export function CheckoutModal({ open, onOpenChange, orderId }: CheckoutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <DialogTitle className="text-2xl font-bold">Order Placed Successfully!</DialogTitle>
          <DialogDescription>
            Your order has been placed. You can view the details and payment information below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-4 mt-4">
          {orderId && (
            <Button asChild>
              <Link href={`/order/${orderId}`}>View Order Details</Link>
            </Button>
          )}
           <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}