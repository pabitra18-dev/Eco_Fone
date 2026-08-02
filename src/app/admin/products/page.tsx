
'use client';

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/products";
import Image from "next/image";
import { DeleteProductDialog } from "@/components/admin/delete-product-dialog";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ProductsPageSkeleton = () => (
     <>
        <div className="flex items-center gap-4">
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Product Management
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Skeleton className="h-7 w-28" />
            </div>
        </div>
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                    Manage your products and view their sales performance.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 max-w-sm mb-4" />
                <Table>
                    <TableHeader>
                        <TableRow>
                             <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                             <TableHead>Name</TableHead>
                             <TableHead>Status</TableHead>
                             <TableHead>Price</TableHead>
                             <TableHead className="hidden md:table-cell">Stock</TableHead>
                             <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                             <TableRow key={i}>
                                <TableCell className="hidden sm:table-cell"><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-10" /></TableCell>
                                <TableCell className="text-right"><div className="flex gap-2 justify-end"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></div></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </>
)

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const productList = await getProducts();
            setProducts(productList);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) {
            return products;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            product.brand.toLowerCase().includes(lowerCaseSearchTerm) ||
            product.tags?.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }, [products, searchTerm]);

    if (loading) {
        return <ProductsPageSkeleton />;
    }

    return (
        <>
            <div className="flex items-center gap-4">
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Product Management
                </h1>
                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                    <Button asChild size="sm" className="h-7 gap-1">
                        <Link href="/admin/products/new">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Add Product
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>
                        Manage your products and view their sales performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input 
                            placeholder="Search by name, brand, or tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    {/* Desktop Table */}
                    <div className="hidden md:block border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden w-[100px] sm:table-cell">
                                        Image
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="hidden md:table-cell">Stock</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Image
                                                alt="Product image"
                                                className="aspect-square rounded-md object-cover"
                                                height="64"
                                                src={product.images[0]}
                                                width="64"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                                                {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>NPR {product.price.toLocaleString()}</TableCell>
                                        <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                                                </Button>
                                                <DeleteProductDialog productId={product.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No products found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Accordion */}
                    <div className="md:hidden space-y-3">
                        {filteredProducts.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                            {filteredProducts.map((product) => (
                                <AccordionItem value={product.id} key={product.id} className="border rounded-lg">
                                    <AccordionTrigger className="p-4 text-sm hover:no-underline">
                                    <div className="flex items-center gap-4 text-left">
                                        <Image
                                            alt={product.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="48"
                                            src={product.images[0]}
                                            width="48"
                                        />
                                        <div>
                                            <p className="font-semibold">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                                        </div>
                                    </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 border-t space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Price:</span>
                                            <span className="font-bold">NPR {product.price.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Status:</span>
                                            <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                                                {product.stock > 0 ? `${product.stock} in Stock` : "Out of Stock"}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2 justify-end pt-2">
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                                            </Button>
                                            <DeleteProductDialog productId={product.id} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                            </Accordion>
                        ) : (
                            <div className="text-center h-24 text-muted-foreground flex items-center justify-center">No products found.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
