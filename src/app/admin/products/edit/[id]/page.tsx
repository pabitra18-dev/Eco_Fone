
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById } from "@/lib/products";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const product = await getProductById(id);
  
  if (!product) {
    notFound();
  }

  return (
    <div>
        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
        <Card>
            <CardHeader>
                <CardTitle>Edit Product Details</CardTitle>
                <CardDescription>Update the product information below. The product slug will be automatically updated.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProductForm product={product} />
            </CardContent>
        </Card>
    </div>
  )
}
