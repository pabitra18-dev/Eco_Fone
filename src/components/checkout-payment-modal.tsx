
"use client";

import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface CheckoutPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  totalAmount: number;
  esewaMobile: string;
}

export function CheckoutPaymentModal({
  open,
  onOpenChange,
  orderId,
  totalAmount,
  esewaMobile
}: CheckoutPaymentModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (open && esewaMobile) {
      const payload = `esewa_id=${esewaMobile}&amount=${totalAmount}&remarks=Order_${orderId.slice(0,7)}`;
      QRCode.toDataURL(payload, { errorCorrectionLevel: 'H' })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error("QR Code Generation Error:", err));
    }
  }, [open, totalAmount, orderId, esewaMobile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>
            Scan the QR code with your E-Sewa app to pay. After payment, submit the transaction details on the order page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center p-4 border rounded-md">
          {qrCodeUrl ? <Image src={qrCodeUrl} alt="E-Sewa QR Code" width={250} height={250} /> : <Loader2 className="animate-spin h-10 w-10 text-primary" />}
        </div>
         <div className="space-y-2 text-center">
            <p className="font-semibold">Amount: NPR {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-sm text-muted-foreground">E-Sewa ID: {esewaMobile}</p>
            <p className="text-sm text-muted-foreground">Remarks: Order #{orderId.slice(0, 7)}</p>
        </div>
        <DialogFooter>
           <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
