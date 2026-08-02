import { CartClient } from "./cart-client";

export default function CartPage() {
  return (
    <div className="bg-background">
        <div className="container mx-auto px-4 py-12">
            <CartClient />
        </div>
    </div>
  );
}
