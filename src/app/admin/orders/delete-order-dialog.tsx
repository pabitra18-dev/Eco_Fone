
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteOrder } from "@/app/admin/orders/actions"
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";

interface DeleteOrderDialogProps {
    orderId: string;
    onOrderDeleted: () => void;
}

export function DeleteOrderDialog({ orderId, onOrderDeleted }: DeleteOrderDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
        const result = await deleteOrder(orderId);
        if (result.success) {
            toast({
                title: "Order Deleted",
                description: "The order has been successfully deleted.",
            });
            onOrderDeleted();
        } else {
            toast({
                title: "Error",
                description: result.message || "Failed to delete the order.",
                variant: "destructive",
            });
        }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon" disabled={isPending}>
            <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this order from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
