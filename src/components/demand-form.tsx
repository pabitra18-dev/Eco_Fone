
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import phoneData from '@/lib/phone_data.json';
import { useAuth } from '@/hooks/use-auth';
import { Gamepad2, Camera, BatteryFull, Hand, Diamond, Check, ChevronsUpDown, User, Smartphone, Settings, Wallet, Loader2, Star, Target, SlidersHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { submitDemand } from '@/app/demand/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Demand, ProductCategoryRating } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const OTHER_VALUE = "__other__";
const RATING_LEVELS: ProductCategoryRating[] = ['GOAT', 'Great', 'Good', 'OK'];

const CATEGORIES: { id: keyof Demand['categories']; label: string, icon: React.ElementType }[] = [
    { id: 'gamingPerformance', label: 'Gaming Performance', icon: Gamepad2 },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'battery', label: 'Battery', icon: BatteryFull },
    { id: 'looksAndFeel', label: 'Looks & In-hand feel', icon: Hand },
    { id: 'valueForMoney', label: 'Value for Money', icon: Diamond }
];

const demandFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phone: z.string().min(10, "A valid phone number is required.").regex(/^\+?[0-9\s-()]+$/, "Invalid phone number format."),
  socialMedia: z.string().url().or(z.literal('')).optional(),
  demandType: z.enum(['specific', 'general'], { required_error: 'Please select an option.' }),
  brand: z.string().optional(),
  customBrand: z.string().optional(),
  model: z.string().optional(),
  customModel: z.string().optional(),
  storage: z.string().optional(),
  ram: z.string().optional(),
  batteryHealth: z.string().optional().nullable(),
  expectedPrice: z.array(z.number()).length(2).optional(),
  categories: z.object({
    gamingPerformance: z.enum(RATING_LEVELS).optional(),
    camera: z.enum(RATING_LEVELS).optional(),
    battery: z.enum(RATING_LEVELS).optional(),
    looksAndFeel: z.enum(RATING_LEVELS).optional(),
    valueForMoney: z.enum(RATING_LEVELS).optional(),
  }).optional(),
}).superRefine((data, ctx) => {
    if (data.demandType === 'specific') {
        if (!data.brand) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Brand is required.", path: ["brand"] });
        }
        if (data.brand === OTHER_VALUE && !data.customBrand) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify the brand name.", path: ["customBrand"] });
        }
        if (!data.model) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Model is required.", path: ["model"] });
        }
        if (data.model === OTHER_VALUE && !data.customModel) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify the model name.", path: ["customModel"] });
        }
    }
    if (data.demandType === 'general') {
        if (!data.storage) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Storage is required.", path: ["storage"] });
        }
        if (!data.ram) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "RAM is required.", path: ["ram"] });
        }
        CATEGORIES.forEach(cat => {
            if (!data.categories?.[cat.id]) {
                 ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Rating is required.",
                    path: [`categories.${cat.id}`],
                });
            }
        });
    }
});


export type DemandFormValues = z.infer<typeof demandFormSchema>;

interface DemandFormProps {
    initialData: Demand | null;
    editingId?: string;
}

const StarDisplay = ({ rating }: { rating: ProductCategoryRating | 'Any' }) => {
    const ratingMap: { [key in ProductCategoryRating | 'Any']: number } = { 'GOAT': 5, 'Great': 4, 'Good': 3, 'OK': 2, 'Any': 0 };
    const starCount = ratingMap[rating];

    if (starCount === 0) {
        return <span className="text-muted-foreground">Any</span>;
    }

    return (
        <div className="flex items-center gap-1.5">
            <span>{rating}</span>
            <div className="flex">
                {[...Array(starCount)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                 {[...Array(5 - starCount)].map((_, i) => (
                    <Star key={i+starCount} className="h-3 w-3 text-muted-foreground" />
                ))}
            </div>
        </div>
    );
};

export function DemandForm({ initialData, editingId }: DemandFormProps) {
  const { user, getIdToken } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [openBrandPopover, setOpenBrandPopover] = useState(false);
  const [openModelPopover, setOpenModelPopover] = useState(false);

  const form = useForm<DemandFormValues>({
    resolver: zodResolver(demandFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      socialMedia: "",
      demandType: undefined,
      brand: "",
      customBrand: "",
      model: "",
      customModel: "",
      storage: "",
      ram: "",
      batteryHealth: null,
      expectedPrice: [0, 100000],
      categories: {},
    },
  });

  useEffect(() => {
    if (initialData) {
        const isBrandCustom = !Object.keys(phoneData).includes(initialData.brand);
        const isModelCustom = isBrandCustom || !((phoneData as Record<string, string[]>)[initialData.brand] || []).includes(initialData.model);
        
        form.reset({
            fullName: initialData.fullName,
            phone: initialData.phone,
            socialMedia: initialData.socialMedia || '',
            demandType: 'specific', // Existing demands are always specific
            brand: isBrandCustom ? OTHER_VALUE : initialData.brand,
            customBrand: isBrandCustom ? initialData.brand : '',
            model: isModelCustom ? OTHER_VALUE : initialData.model,
            customModel: isModelCustom ? initialData.model : '',
            storage: initialData.storage,
            ram: initialData.ram,
            batteryHealth: initialData.batteryHealth || null,
            expectedPrice: initialData.expectedPrice || [0, 100000],
            categories: initialData.categories || {},
        });
    } else if (user) {
        form.reset({
            fullName: user.displayName || "",
            phone: (user as any).phoneNumber || "",
            expectedPrice: [0, 100000],
            categories: {},
        });
    }
  }, [initialData, user, form]);

  const { isSubmitting } = form.formState;
  const watchedDemandType = form.watch("demandType");
  const watchedBrand = form.watch("brand");
  const watchedPrice = form.watch("expectedPrice");

  const brands = Object.keys(phoneData);
  const models = useMemo(() => watchedBrand && watchedBrand !== OTHER_VALUE ? phoneData[watchedBrand as keyof typeof phoneData] : [], [watchedBrand]);

  const storageOptions = useMemo(() => ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"], []);
  const ramOptions = useMemo(() => ["4GB", "6GB", "8GB", "12GB", "16GB"], []);

  const handleBrandChange = (value: string) => {
    form.setValue('brand', value, { shouldValidate: true });
    form.setValue('model', '');
    setOpenBrandPopover(false);
  }
  
  const handleModelChange = (value: string) => {
    form.setValue('model', value, { shouldValidate: true });
    setOpenModelPopover(false);
  }

  const onSubmit = async (data: DemandFormValues) => {
    const idToken = await getIdToken();
    if (!idToken) {
        toast({ title: "Authentication Error", description: "Could not verify your session. Please log in again.", variant: "destructive" });
        return;
    }

    const finalData: Partial<DemandFormValues> = {
        ...data,
        brand: data.demandType === 'specific' ? (data.brand === OTHER_VALUE ? data.customBrand || '' : data.brand) : undefined,
        model: data.demandType === 'specific' ? (data.model === OTHER_VALUE ? data.customModel || '' : data.model) : undefined,
    };
    
    // clean up unnecessary fields
    if (data.demandType === 'general') {
        delete finalData.brand;
        delete finalData.model;
        delete finalData.customBrand;
        delete finalData.customModel;
    }
    
    const result = await submitDemand(finalData as DemandFormValues, idToken, editingId);

    if (result.success) {
      toast({ title: "Success!", description: `Your demand has been ${editingId ? 'updated' : 'submitted'}.` });
      form.reset();
      router.push('/account/demands');
    } else {
      toast({ title: "Submission Failed", description: result.message, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2"><User className="h-5 w-5 text-primary"/>Your Information</CardTitle>
                    <CardDescription>We'll use this to contact you about your request.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl><Input type="tel" placeholder="+977..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="socialMedia" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Social Media (Optional)</FormLabel>
                                <FormControl><Input placeholder="e.g., https://facebook.com/yourprofile" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2"><Smartphone className="h-5 w-5 text-primary"/>Phone Details</CardTitle>
                    <CardDescription>Tell us exactly which phone you're looking for.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="demandType"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-center block">Do you have a specific phone in mind?</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        <FormItem>
                                            <RadioGroupItem value="specific" id="specific" className="peer sr-only" />
                                            <FormLabel htmlFor="specific" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                <Target className="mb-3 h-6 w-6" />
                                                Yes, I know the brand and model.
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                             <RadioGroupItem value="general" id="general" className="peer sr-only" />
                                            <FormLabel htmlFor="general" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                <SlidersHorizontal className="mb-3 h-6 w-6" />
                                                No, I have preferences instead.
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage className="text-center" />
                            </FormItem>
                        )}
                        />

                    {watchedDemandType === 'specific' && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="brand" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Brand</FormLabel>
                                    <Popover open={openBrandPopover} onOpenChange={setOpenBrandPopover}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                    {field.value ? (field.value === OTHER_VALUE ? "Other (Specify)" : field.value) : "Select a brand"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search brand..." />
                                                <CommandList>
                                                    <CommandEmpty>No brand found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {brands.map(b => (
                                                            <CommandItem value={b} key={b} onSelect={() => handleBrandChange(b)}>
                                                                <Check className={cn("mr-2 h-4 w-4", b === field.value ? "opacity-100" : "opacity-0")} />
                                                                {b}
                                                            </CommandItem>
                                                        ))}
                                                        <CommandItem value={OTHER_VALUE} key={OTHER_VALUE} onSelect={() => handleBrandChange(OTHER_VALUE)}>
                                                            <Check className={cn("mr-2 h-4 w-4", OTHER_VALUE === field.value ? "opacity-100" : "opacity-0")} />
                                                            Other (Specify)
                                                        </CommandItem>
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    {form.getValues('brand') === OTHER_VALUE && (
                                        <FormField control={form.control} name="customBrand" render={({ field }) => (
                                            <FormItem className="mt-2"><FormLabel className="sr-only">Specify Brand</FormLabel><FormControl><Input placeholder="Specify Brand Name" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    )}
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="model" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Model</FormLabel>
                                    {watchedBrand && watchedBrand !== OTHER_VALUE ? (
                                        <Popover open={openModelPopover} onOpenChange={setOpenModelPopover}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" role="combobox" disabled={!watchedBrand || watchedBrand === OTHER_VALUE} className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                        {field.value ? (field.value === OTHER_VALUE ? "Other (not listed)" : field.value) : "Select a model"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search model..." />
                                                    <CommandList>
                                                        <CommandEmpty>No model found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {models.map((m: string) => (
                                                                <CommandItem value={m} key={m} onSelect={() => handleModelChange(m)}>
                                                                    <Check className={cn("mr-2 h-4 w-4", m === field.value ? "opacity-100" : "opacity-0")} />
                                                                    {m}
                                                                </CommandItem>
                                                            ))}
                                                            <CommandItem value={OTHER_VALUE} key={OTHER_VALUE} onSelect={() => handleModelChange(OTHER_VALUE)}>
                                                                <Check className={cn("mr-2 h-4 w-4", OTHER_VALUE === field.value ? "opacity-100" : "opacity-0")} />
                                                                Other (not listed)
                                                            </CommandItem>
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <FormControl><Input placeholder="Model Name" {...field} disabled={!watchedBrand} /></FormControl>
                                    )}
                                    <FormMessage />
                                    {form.getValues("model") === OTHER_VALUE && (
                                        <FormField control={form.control} name="customModel" render={({ field }) => (
                                            <FormItem className="mt-2"><FormLabel className="sr-only">Specify Model</FormLabel><FormControl><Input placeholder="Specify Model Name" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    )}
                                </FormItem>
                            )} />
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="storage" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Storage {watchedDemandType === 'general' && <span className="text-destructive">*</span>}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="e.g., 128GB" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {storageOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="ram" render={({ field }) => (
                            <FormItem>
                            <FormLabel>RAM {watchedDemandType === 'general' && <span className="text-destructive">*</span>}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="e.g., 8GB" /></SelectTrigger></FormControl>
                                <SelectContent>
                                {ramOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    {(watchedDemandType === 'specific' && watchedBrand === 'Apple') && (
                        <FormField control={form.control} name="batteryHealth" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Desired Battery Health</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Any battery health" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="any">Any</SelectItem>
                                <SelectItem value="100%">100%</SelectItem><SelectItem value="90-99%">90-99%</SelectItem><SelectItem value="80-89%">80-89%</SelectItem><SelectItem value="&lt;80%">&lt;80%</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )} />
                    )}
                    <FormField control={form.control} name="expectedPrice" render={({ field }) => (
                        <FormItem className="pt-4">
                            <FormLabel className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary"/>Expected Price Range</FormLabel>
                            <div className="text-sm text-muted-foreground">NPR {watchedPrice?.[0]?.toLocaleString()} - NPR {watchedPrice?.[1]?.toLocaleString()}</div>
                            <FormControl>
                            <Slider
                                min={0}
                                max={150000}
                                step={10000}
                                value={field.value}
                                onValueChange={field.onChange}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2"><Settings className="h-5 w-5 text-primary"/>Performance Preferences</CardTitle>
                    <CardDescription>Let us know what's most important to you in a phone.</CardDescription>
                </CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    {CATEGORIES.map((cat, index) => {
                        const isRequired = watchedDemandType === 'general';
                        return(
                            <FormField
                                key={cat.id}
                                control={form.control}
                                name={`categories.${cat.id}`}
                                render={({ field }) => (
                                    <FormItem className={cn(index === 4 && "md:col-span-2 lg:col-span-1 lg:col-start-2")}>
                                        <FormLabel className="flex items-center gap-2">
                                            <cat.icon className="h-4 w-4 text-muted-foreground" />
                                            {cat.label}
                                            {isRequired && <span className="text-destructive">*</span>}
                                        </FormLabel>
                                         <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                     <SelectValue placeholder="Any Rating" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="any">Any</SelectItem>
                                                    {RATING_LEVELS.map(level => (
                                                        <SelectItem key={level} value={level}>
                                                            <StarDisplay rating={level} />
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                         </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )
                    })}
                </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full !mt-8" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {editingId ? 'Updating...' : 'Submitting...'}</> : (editingId ? 'Update Demand' : 'Submit Demand')}
            </Button>
        </form>
    </Form>
  );
}

    