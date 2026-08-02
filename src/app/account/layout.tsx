
"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { User, ShoppingCart, LogOut, Smartphone, Handshake } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const accountNavLinks = [
    { name: "Profile", href: "/account/profile", icon: User },
    { name: "Order History", href: "/account/orders", icon: ShoppingCart },
    { name: "My Sell Requests", href: "/account/sells", icon: Smartphone },
    { name: "My Demands", href: "/account/demands", icon: Handshake },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                <aside className="w-full md:w-1/4 lg:w-1/5">
                    <nav className="flex flex-col space-y-1">
                        {accountNavLinks.map(link => {
                            const isActive = pathname === link.href;
                            return (
                                <Link href={link.href} key={link.href} className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm md:text-base",
                                    isActive && "bg-muted text-primary font-semibold"
                                )}>
                                    <link.icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            )
                        })}
                         <Button variant="ghost" className="flex items-center justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm md:text-base" onClick={handleLogout}>
                           <LogOut className="h-4 w-4" />
                           Logout
                         </Button>
                    </nav>
                </aside>
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
