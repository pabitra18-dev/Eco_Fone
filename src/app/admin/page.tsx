
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProducts } from '@/lib/products';
import { getOrders } from '@/lib/orders';
import Link from 'next/link';
import { getUsers } from '@/lib/users';
import { Button } from '@/components/ui/button';
import { PlusCircle, Package, Users, DollarSign, Activity } from 'lucide-react';
import { getAllBuyRequests } from "./buy/actions";
import { getDemands } from "./demands/actions";

export default async function AdminDashboardPage() {
  const [products, orders, users, sellRequests, demands] = await Promise.all([
    getProducts(),
    getOrders(),
    getUsers(),
    getAllBuyRequests(),
    getDemands(),
  ]);

  if (products.length === 0 && orders.length === 0 && users.length === 0) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome to Your Admin Panel!</CardTitle>
                    <CardDescription>
                        It looks like your database is empty. Get started by adding your first product.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/admin/products/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  const totalRevenue = orders.reduce((sum, order) => order.status === 'Delivered' ? sum + order.totalAmount : sum, 0);
  const totalProducts = products.length;
  const totalUsers = users.length;
  const totalOrders = orders.length;

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Eco-Fone Admin Panel.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/sales" className="group">
          <Card className="transition-all hover:bg-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NPR {totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Based on delivered orders
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/products" className="group">
            <Card className="transition-all hover:bg-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Products
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalProducts}</div>
                    <p className="text-xs text-muted-foreground">
                    Total products in inventory
                    </p>
                </CardContent>
            </Card>
        </Link>
        <Link href="/admin/users" className="group">
            <Card className="transition-all hover:bg-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                    Total registered users
                    </p>
                </CardContent>
            </Card>
        </Link>
         <Link href="/admin/orders" className="group">
            <Card className="transition-all hover:bg-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Orders
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{totalOrders}</div>
                    <p className="text-xs text-muted-foreground">
                    Total orders placed
                    </p>
                </CardContent>
            </Card>
        </Link>
      </div>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Quickly manage your store</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
