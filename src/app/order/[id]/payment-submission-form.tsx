
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, QrCode } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutPaymentModal } from "@/components/checkout-payment-modal";
import { updateOrderPaymentDetails } from "./actions";


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

const paymentSubmissionSchema = z.object({
  esewaTransactionCode: z.string().min(1, "Transaction code is required."),
  paymentScreenshot: z.any()
    .refine((files): files is FileList => files instanceof FileList, "File is required.")
    .refine(files => files?.length > 0, "Payment screenshot is required.")
    .refine(files => files?.[0]?.size <= MAX_FILE_SIZE, "File size must be less than 5MB.")
    .refine(files => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), "Only .jpg, .jpeg, .png, and .pdf formats are supported."),
});

type PaymentSubmissionFormValues = z.infer<typeof paymentSubmissionSchema>;

interface PaymentSubmissionFormProps {
  orderId: string;
  totalAmount: number;
  esewaMobileNumber: string;
}

export function PaymentSubmissionForm({ orderId, totalAmount, esewaMobileNumber }: PaymentSubmissionFormProps) {
  const { toast } = useToast();
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const form = useForm<PaymentSubmissionFormValues>({
    resolver: zodResolver(paymentSubmissionSchema),
    defaultValues: {
      esewaTransactionCode: "",
      paymentScreenshot: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: PaymentSubmissionFormValues) => {
    try {
      const formData = new FormData();
      formData.append('esewaTransactionCode', data.esewaTransactionCode);
      formData.append('paymentScreenshot', data.paymentScreenshot[0]);

      const result = await updateOrderPaymentDetails(orderId, formData);

      if (result.success) {
          toast({ title: "Success", description: "Payment details submitted successfully." });
          setIsSubmittedSuccessfully(true);
      } else {
          throw new Error(result.message);
      }

    } catch (error: any) {
      console.error("Payment submission failed:", error);
      toast({ title: "Error", description: error.message || "Something went wrong during submission.", variant: "destructive" });
    }
  };

  if (isSubmittedSuccessfully) {
    return (
      <Card className="mt-8 border-green-500 bg-green-50 dark:bg-green-900/20">
        <CardHeader><CardTitle className="text-green-700 dark:text-green-300">Payment Details Submitted!</CardTitle></CardHeader>
        <CardContent>
            <CardDescription className="text-green-600 dark:text-green-400">Thank you for submitting your payment details. Your order status has been updated to 'Processing' and will be verified shortly.</CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <div className="bg-muted/50 p-4 rounded-md space-y-3 mb-6">
        <h4 className="font-semibold">How to Pay</h4>
        <p className="text-sm text-muted-foreground">
            You can pay via E-Sewa. Click the button below to see the QR code, or transfer directly to <span className="font-semibold text-foreground">{esewaMobileNumber}</span>. After payment, please enter the transaction details and upload a screenshot below.
        </p>
        <Button variant="outline" onClick={() => setIsQrModalOpen(true)}>
            <QrCode className="mr-2 h-4 w-4" />
            Show QR Code
        </Button>
    </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="esewaTransactionCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Sewa Transaction Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter transaction code" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentScreenshot"
          render={({ field: { onChange, value, ...rest }}) => (
            <FormItem>
              <FormLabel>Payment Screenshot (PNG, JPEG, PDF)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".png, .jpg, .jpeg, .pdf"
                  onChange={(event) => {
                    onChange(event.target.files);
                  }}
                  disabled={isSubmitting}
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Payment Details"}
        </Button>
      </form>
    </Form>

    <CheckoutPaymentModal
        open={isQrModalOpen}
        onOpenChange={setIsQrModalOpen}
        orderId={orderId}
        totalAmount={totalAmount}
        esewaMobile={esewaMobileNumber}
    />
    </>
  );
}
