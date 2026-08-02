
import { getProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { FeaturedProductToggle, HeroProductButton } from "@/components/admin/featured-product-toggle";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default async function FeaturedProductsPage() {
    const products = await getProducts();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Manage Homepage Features</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Homepage Products</CardTitle>
                    <CardDescription>
                        Select which products appear on the homepage, including the main hero product.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Desktop Table */}
                    <div className="hidden md:block border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden w-[100px] sm:table-cell">
                                        <span className="sr-only">Image</span>
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Image
                                                alt={product.name}
                                                className="aspect-square rounded-md object-cover"
                                                height="64"
                                                src={product.images[0]}
                                                width="64"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <p>{product.name}</p>
                                            {product.hero && <Badge className="mt-1">Hero</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <HeroProductButton id={product.id} isHero={product.hero ?? false} />
                                            <Link href={`/admin/products/edit/${product.id}`} passHref>
                                                <Button variant="outline" size="sm">Edit</Button>
                                            </Link>
                                        <FeaturedProductToggle id={product.id} isFeatured={product.featured ?? false} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                     {/* Mobile Accordion */}
                    <div className="md:hidden space-y-3">
                        {products.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                                {products.map((product) => (
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
                                                    {product.hero && <Badge className="mt-1">Hero</Badge>}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 border-t space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Set as Hero</span>
                                                <HeroProductButton id={product.id} isHero={product.hero ?? false} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Featured on Homepage</span>
                                                <FeaturedProductToggle id={product.id} isFeatured={product.featured ?? false} />
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <Link href={`/admin/products/edit/${product.id}`} passHref>
                                                    <Button variant="outline" size="sm">Edit Product</Button>
                                                </Link>
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
        </div>
    )
}
