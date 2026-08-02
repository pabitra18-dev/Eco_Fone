
"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";
import { ShoppingCart } from "lucide-react";

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Button
      size="lg"
      className="w-full text-lg"
      onClick={() => addToCart(product)}
      disabled={product.stock === 0}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
    </Button>
  );
}
