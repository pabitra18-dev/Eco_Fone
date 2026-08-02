
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { nepalGeoData } from "@/lib/nepal-geo-data";
import { useEffect } from "react";

const shippingSchema = z.object({
  name: z.string().min(2, "Name is required."),
  province: z.string().min(1, "Province is required."),
  district: z.string().min(1, "District is required."),
  localLevel: z.string().min(1, "City/Local Level is required."),
  address: z.string().min(5, "Tole/Street address is required."),
  phone: z.string().min(10, "A valid phone number is required."),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

export function CheckoutForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { cartItems, cartTotal } = useCart();
  const router = useRouter();

  const form = useForm<ShippingFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: user?.displayName || "",
      province: "",
      district: "",
      localLevel: "",
      address: "",
      phone: (user as any)?.phoneNumber || "",
    },
  });

  const watchedProvince = form.watch("province");
  const watchedDistrict = form.watch("district");

  useEffect(() => {
    form.setValue("district", "");
    form.setValue("localLevel", "");
  }, [watchedProvince, form]);

  useEffect(() => {
    form.setValue("localLevel", "");
  }, [watchedDistrict, form]);
  
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: ShippingFormValues) => {
    if (cartItems.length === 0) {
        toast({ title: "Error", description: "Your cart is empty.", variant: "destructive" });
        return;
    }

    try {
      // Store shipping details and navigate to payment selection
      sessionStorage.setItem('shippingDetails', JSON.stringify(data));
      router.push('/checkout/payment');
    } catch (error) {
      console.error("Error storing shipping details:", error);
      toast({ title: "Error", description: "Could not proceed to payment. Please try again.", variant: "destructive" });
    }
  };
  
  const provinces = Object.keys(nepalGeoData);
  const districts = watchedProvince ? Object.keys(nepalGeoData[watchedProvince as keyof typeof nepalGeoData]) : [];
  const localLevels = watchedDistrict ? (nepalGeoData as any)[watchedProvince]?.[watchedDistrict] || [] : [];
  
  const VAT_RATE = 0.13;
  const subtotal = cartTotal / (1 + VAT_RATE);
  const vat = cartTotal - subtotal;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Province</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your province" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>District</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchedProvince}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your district" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
              />
           </div>
           
           <FormField
            control={form.control}
            name="localLevel"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>City / Local Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchedDistrict}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your city or local level" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {localLevels.map((l: string) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tole / Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Ward No. 5, Main Road" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                      <Input placeholder="+977..." {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
          />

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>NPR {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between text-sm"><span>VAT (13%)</span><span>NPR {vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>NPR {cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Proceed to Payment"}
          </Button>
        </form>
      </Form>
    </>
  );
}
