
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order } from "@/lib/types";
import { updateOrderStatus } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";

export function OrderStatusSelector({ orderId, currentStatus }: { orderId: string, currentStatus: Order['status']}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: Order['status']) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        toast({ title: "Success", description: "Order status updated." });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };

  return (
    <Select defaultValue={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Pending Payment">Pending Payment</SelectItem>
        <SelectItem value="Payment Verified">Payment Verified</SelectItem>
        <SelectItem value="Processing">Processing</SelectItem>
        <SelectItem value="Shipped">Shipped</SelectItem>
        <SelectItem value="Delivered">Delivered</SelectItem>
        <SelectItem value="Cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  )
}
