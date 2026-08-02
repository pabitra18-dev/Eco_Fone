
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProduct, updateProduct } from "@/app/admin/products/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Product, ProductCategories, ProductCategoryRating } from "@/lib/types";
import phoneData from '@/lib/phone_data.json';
import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Gamepad2, Camera, BatteryFull, Hand, Diamond, ChevronsUpDown, Check, Star } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";


const OTHER_VALUE = "__other__";
const RATING_LEVELS: ProductCategoryRating[] = ['GOAT', 'Great', 'Good', 'OK'];
const CATEGORIES: { id: keyof ProductCategories; label: string, icon: React.ElementType }[] = [
    { id: 'gamingPerformance', label: 'Gaming Performance', icon: Gamepad2 },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'battery', label: 'Battery', icon: BatteryFull },
    { id: 'looksAndFeel', label: 'Looks & In-hand feel', icon: Hand },
    { id: 'valueForMoney', label: 'Value for Money', icon: Diamond }
];

const productSchema = z.object({
  name: z.string().min(1, "Model name is required."),
  customModel: z.string().optional(),
  brand: z.string().min(1, "Brand is required."),
  customBrand: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  originalPrice: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0, "Stock must be a positive integer."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  condition: z.enum(['Excellent', 'Very Good', 'Good', 'Fair']),
  imageUrls: z.object({
      front: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
      back: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
      left: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
      right: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
      top: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
      bottom: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  }),
  tags: z.string().optional(),
  fullSpecsGsmArena: z.string().optional(),
  categories: z.object({
    gamingPerformance: z.enum(RATING_LEVELS).optional(),
    camera: z.enum(RATING_LEVELS).optional(),
    battery: z.enum(RATING_LEVELS).optional(),
    looksAndFeel: z.enum(RATING_LEVELS).optional(),
    valueForMoney: z.enum(RATING_LEVELS).optional(),
  }),
  specs: z.object({
    network: z.string().optional(),
    dimensions: z.string().optional(),
    weight: z.string().optional(),
    build: z.string().optional(),
    sim: z.string().optional(),
    display: z.object({
      type: z.string().optional(),
      size: z.string().optional(),
      resolution: z.string().optional(),
      protection: z.string().optional(),
    }),
    platform: z.object({
      os: z.string().optional(),
      chipset: z.string().optional(),
      cpu: z.string().optional(),
      gpu: z.string().optional(),
    }),
    memory: z.object({
        ram: z.string().optional(),
        storage: z.string().min(1, "Storage is required"),
        card_slot: z.string().optional(),
    }),
    mainCamera: z.object({
      modules: z.string().optional(),
      features: z.string().optional(),
      video: z.string().optional(),
    }),
    selfieCamera: z.object({
      modules: z.string().optional(),
      features: z.string().optional(),
      video: z.string().optional(),
    }),
    sound: z.object({
      loudspeaker: z.string().optional(),
      jack_3_5mm: z.string().optional(),
    }),
    features: z.string().optional(),
    battery: z.object({
      type: z.string().optional(),
      charging: z.string().optional(),
    }),
  }),
  batteryHealth: z.string().optional(),
  paymentMobileNumber: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

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

export function ProductForm({ product }: { product?: Product }) {
  const { toast } = useToast();
  const router = useRouter();
  const [openBrandPopover, setOpenBrandPopover] = React.useState(false);
  const [openModelPopover, setOpenModelPopover] = React.useState(false);

  const isBrandCustom = product && !Object.keys(phoneData).some(brand => brand.toLowerCase() === product.brand.toLowerCase());
  const isModelCustom = product && !isBrandCustom && !((phoneData as Record<string, string[]>)[product.brand] || []).some(model => model.toLowerCase() === product.name.toLowerCase());


  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      ...product,
      name: isModelCustom ? OTHER_VALUE : product.name,
      customModel: isModelCustom ? product.name : '',
      brand: isBrandCustom ? OTHER_VALUE : product.brand,
      customBrand: isBrandCustom ? product.brand : '',
      originalPrice: product.originalPrice ?? undefined,
      tags: product.tags?.join(', ') || '',
      fullSpecsGsmArena: product.fullSpecsGsmArena || '',
      specs: {
        ...product.specs,
        features: product.specs.features?.join(', ') || '',
      },
      categories: product.categories || {},
      imageUrls: {
        front: product.images[0] || '',
        back: product.images[1] || '',
        left: product.images[2] || '',
        right: product.images[3] || '',
        top: product.images[4] || '',
        bottom: product.images[5] || '',
      },
      paymentMobileNumber: product.paymentMobileNumber ?? '',
    } : {
      name: "",
      brand: "",
      price: 0,
      originalPrice: undefined,
      stock: 0,
      description: "",
      condition: "Good",
      imageUrls: { front: '', back: '', left: '', right: '', top: '', bottom: '' },
      customBrand: '',
      customModel: '',
      tags: '',
      fullSpecsGsmArena: '',
      categories: {},
      specs: {
        network: '', dimensions: '', weight: '', build: '', sim: '',
        display: { type: '', size: '', resolution: '', protection: '' },
        platform: { os: '', chipset: '', cpu: '', gpu: '' },
        memory: { ram: '', storage: '', card_slot: '' },
        mainCamera: { modules: '', features: '', video: '' },
        selfieCamera: { modules: '', features: '', video: '' },
        sound: { loudspeaker: '', jack_3_5mm: '' },
        features: '',
        battery: { type: '', charging: '' }
      },
      batteryHealth: '',
      paymentMobileNumber: '',
    },
  });
  
  const watchedBrand = form.watch("brand");
  const watchedModel = form.watch("name");
  const watchedImageUrls = form.watch("imageUrls");


  const onSubmit = async (data: ProductFormValues) => {
    const formData = new FormData();

    if (product?.id) {
        formData.append('id', product.id);
    }
    
    const finalBrand = data.brand === OTHER_VALUE ? data.customBrand || '' : data.brand;
    const finalModel = data.name === OTHER_VALUE ? data.customModel || '' : data.name;

    formData.append('brand', finalBrand);
    formData.append('name', finalModel);
    formData.append('price', String(data.price));
    formData.append('stock', String(data.stock));
    formData.append('description', data.description);
    formData.append('condition', data.condition);
    if (data.originalPrice !== undefined && data.originalPrice !== null) formData.append('originalPrice', String(data.originalPrice));
    if (data.paymentMobileNumber) formData.append('paymentMobileNumber', data.paymentMobileNumber);
    if(data.batteryHealth) formData.append('batteryHealth', data.batteryHealth);
    formData.append('tags', data.tags || '');
    if (data.fullSpecsGsmArena) formData.append('fullSpecsGsmArena', data.fullSpecsGsmArena);

    // Append all specs
    for (const [key, value] of Object.entries(data.specs)) {
      if (typeof value === 'object' && value !== null) {
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subValue) formData.append(`specs.${key}.${subKey}`, subValue as string);
        }
      } else {
        if (value !== undefined && value !== null) {
          formData.append(`specs.${key}`, value as string || '');
        }
      }
    }
    
    // Append all categories
    if(data.categories) {
        for (const [key, value] of Object.entries(data.categories)) {
            if (value) {
                formData.append(`categories.${key}`, value);
            }
        }
    }
    
    const imageUrls = [
        data.imageUrls.front,
        data.imageUrls.back,
        data.imageUrls.left,
        data.imageUrls.right,
        data.imageUrls.top,
        data.imageUrls.bottom,
    ].filter(Boolean); // Filter out empty strings

    if (imageUrls.length > 0) {
      formData.append('images', JSON.stringify(imageUrls));
    }
    
    try {
      if (product) {
        await updateProduct(product.id, formData);
        toast({ title: "Success", description: "Product updated successfully." });
      } else {
        await createProduct(formData);
        toast({ title: "Success", description: "Product created successfully." });
      }
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
  };

  const brands = Object.keys(phoneData).sort();
  const models = React.useMemo(() => watchedBrand && watchedBrand !== OTHER_VALUE ? (phoneData as Record<string, string[]>)[watchedBrand].sort() : [], [watchedBrand]);

  const ImageUrlInput = ({ name, label }: { name: `imageUrls.${"front"|"back"|"left"|"right"|"top"|"bottom"}`, label: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder="https://example.com/image.png" {...field} />
          </FormControl>
          {watchedImageUrls?.[name.split('.')[1] as keyof typeof watchedImageUrls] && (
              <Image
                src={watchedImageUrls[name.split('.')[1] as keyof typeof watchedImageUrls]!}
                alt={`${label} preview`}
                width={80}
                height={80}
                className="mt-2 rounded-md object-cover"
              />
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
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
                                                <CommandItem value={b} key={b} onSelect={() => {
                                                    form.setValue('brand', b);
                                                    form.setValue('name', '');
                                                    form.setValue('customModel', '');
                                                    setOpenBrandPopover(false);
                                                }}>
                                                    <Check className={cn("mr-2 h-4 w-4", b === field.value ? "opacity-100" : "opacity-0")} />
                                                    {b}
                                                </CommandItem>
                                            ))}
                                            <CommandItem value={OTHER_VALUE} key={OTHER_VALUE} onSelect={() => {
                                                form.setValue('brand', OTHER_VALUE);
                                                form.setValue('name', '');
                                                form.setValue('customModel', '');
                                                setOpenBrandPopover(false);
                                            }}>
                                                <Check className={cn("mr-2 h-4 w-4", OTHER_VALUE === field.value ? "opacity-100" : "opacity-0")} />
                                                Other (Specify)
                                            </CommandItem>
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedBrand === OTHER_VALUE && (
                    <FormField
                        control={form.control}
                        name="customBrand"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Custom Brand</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter brand name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name</FormLabel>
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
                                              {models.map(m => (
                                                  <CommandItem value={m} key={m} onSelect={() => {
                                                      form.setValue('name', m);
                                                      setOpenModelPopover(false);
                                                  }}>
                                                      <Check className={cn("mr-2 h-4 w-4", m === field.value ? "opacity-100" : "opacity-0")} />
                                                      {m}
                                                  </CommandItem>
                                              ))}
                                              <CommandItem value={OTHER_VALUE} key={OTHER_VALUE} onSelect={() => {
                                                  form.setValue('name', OTHER_VALUE);
                                                  setOpenModelPopover(false);
                                              }}>
                                                  <Check className={cn("mr-2 h-4 w-4", OTHER_VALUE === field.value ? "opacity-100" : "opacity-0")} />
                                                  Other (not listed)
                                              </CommandItem>
                                          </CommandGroup>
                                      </CommandList>
                                  </Command>
                              </PopoverContent>
                          </Popover>
                      ) : (
                        <FormControl>
                            <Input placeholder="e.g., iPhone 14 Pro" {...field} value={field.value === OTHER_VALUE ? '' : field.value} onChange={(e) => field.onChange(e.target.value)} />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {watchedModel === OTHER_VALUE && (
                    <FormField
                        control={form.control}
                        name="customModel"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Custom Model Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter model name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the product..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. apple, new, camera-phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Pricing &amp; Inventory</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (NPR)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 95000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 120000" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Mobile Number (eSewa/Khalti)</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="e.g., 98********" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>)} />
                </div>
                 <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a condition" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Excellent">Excellent</SelectItem>
                                <SelectItem value="Very Good">Very Good</SelectItem>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Fair">Fair</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Category Ratings</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {CATEGORIES.map(cat => (
                    <FormField
                        key={cat.id}
                        control={form.control}
                        name={`categories.${cat.id}`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><cat.icon className="h-4 w-4" />{cat.label}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a rating" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {RATING_LEVELS.map(level => <SelectItem key={level} value={level}><StarDisplay rating={level}/></SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
            </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Images</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUrlInput name="imageUrls.front" label="Front View URL" />
            <ImageUrlInput name="imageUrls.back" label="Back View URL" />
            <ImageUrlInput name="imageUrls.left" label="Left Side URL" />
            <ImageUrlInput name="imageUrls.right" label="Right Side URL" />
            <ImageUrlInput name="imageUrls.top" label="Top View URL" />
            <ImageUrlInput name="imageUrls.bottom" label="Bottom View URL" />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Detailed Specifications</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <FormField control={form.control} name="fullSpecsGsmArena" render={({ field }) => (<FormItem><FormLabel>GSM Arena Raw Text</FormLabel><FormControl><Textarea placeholder="Paste full specs from GSM Arena here..." {...field} rows={10} /></FormControl><FormMessage /></FormItem>)} />
                <Separator/>
                <h3 className="text-lg font-medium">Memory</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="specs.memory.ram" render={({ field }) => (<FormItem><FormLabel>RAM</FormLabel><FormControl><Input placeholder="e.g., 8GB" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.memory.storage" render={({ field }) => (<FormItem><FormLabel>Internal Storage</FormLabel><FormControl><Input placeholder="e.g., 128GB" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.memory.card_slot" render={({ field }) => (<FormItem><FormLabel>Card Slot</FormLabel><FormControl><Input placeholder="e.g., microSDXC (dedicated)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <Separator/>
                <h3 className="text-lg font-medium">Display</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="specs.display.type" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="e.g., Super Retina XDR OLED" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="specs.display.size" render={({ field }) => (<FormItem><FormLabel>Size</FormLabel><FormControl><Input placeholder="e.g., 6.1 inches" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="specs.display.resolution" render={({ field }) => (<FormItem><FormLabel>Resolution</FormLabel><FormControl><Input placeholder="e.g., 1170 x 2532 pixels" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="specs.display.protection" render={({ field }) => (<FormItem><FormLabel>Protection</FormLabel><FormControl><Input placeholder="e.g., Ceramic Shield glass" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 </div>
                 <Separator/>
                 <h3 className="text-lg font-medium">Platform</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="specs.platform.os" render={({ field }) => (<FormItem><FormLabel>OS</FormLabel><FormControl><Input placeholder="e.g., iOS 15" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.platform.chipset" render={({ field }) => (<FormItem><FormLabel>Chipset</FormLabel><FormControl><Input placeholder="e.g., Apple A15 Bionic" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.platform.cpu" render={({ field }) => (<FormItem><FormLabel>CPU</FormLabel><FormControl><Input placeholder="e.g., Hexa-core..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.platform.gpu" render={({ field }) => (<FormItem><FormLabel>GPU</FormLabel><FormControl><Input placeholder="e.g., Apple GPU (4-core)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 </div>
                <Separator/>
                <h3 className="text-lg font-medium">Main Camera</h3>
                 <div className="space-y-4">
                    <FormField control={form.control} name="specs.mainCamera.modules" render={({ field }) => (<FormItem><FormLabel>Modules</FormLabel><FormControl><Textarea placeholder="e.g., 12 MP, f/1.6, 26mm (wide)..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.mainCamera.features" render={({ field }) => (<FormItem><FormLabel>Features</FormLabel><FormControl><Input placeholder="e.g., Dual-LED flash, HDR" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.mainCamera.video" render={({ field }) => (<FormItem><FormLabel>Video</FormLabel><FormControl><Input placeholder="e.g., 4K@24/30/60fps" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 </div>
                 <Separator/>
                 <h3 className="text-lg font-medium">Selfie Camera</h3>
                 <div className="space-y-4">
                    <FormField control={form.control} name="specs.selfieCamera.modules" render={({ field }) => (<FormItem><FormLabel>Modules</FormLabel><FormControl><Input placeholder="e.g., 12 MP, f/2.2, 23mm (wide)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.selfieCamera.features" render={({ field }) => (<FormItem><FormLabel>Features</FormLabel><FormControl><Input placeholder="e.g., HDR" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.selfieCamera.video" render={({ field }) => (<FormItem><FormLabel>Video</FormLabel><FormControl><Input placeholder="e.g., 4K@24/25/30/60fps" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 </div>
                 <Separator/>
                <h3 className="text-lg font-medium">Other Specs</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {watchedBrand === 'Apple' && (
                         <FormField
                            control={form.control}
                            name="batteryHealth"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Battery Health</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select battery health" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="100%">100%</SelectItem>
                                        <SelectItem value="90-99%">90-99%</SelectItem>
                                        <SelectItem value="80-89%">80-89%</SelectItem>
                                        <SelectItem value="&lt;80%">&lt;80%</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField control={form.control} name="specs.sound.loudspeaker" render={({ field }) => (<FormItem><FormLabel>Loudspeaker</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.sound.jack_3_5mm" render={({ field }) => (<FormItem><FormLabel>3.5mm Jack</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.network" render={({ field }) => (<FormItem><FormLabel>Network</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.battery.type" render={({ field }) => (<FormItem><FormLabel>Battery Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specs.battery.charging" render={({ field }) => (<FormItem><FormLabel>Charging</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                 </div>
                 <FormField control={form.control} name="specs.features" render={({ field }) => (<FormItem><FormLabel>Features (comma-separated)</FormLabel><FormControl><Textarea placeholder="e.g., Face ID, accelerometer, gyro" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
        </Card>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Product"}
        </Button>
      </form>
    </Form>
  )
}

    