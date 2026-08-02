
"use client";

import Link from "next/link";
import { Leaf, ShoppingCart, User, Menu, LogOut, Shield, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import * as React from 'react';
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Phones" },
  { href: "/demand", label: "Demand" },
  { href: "/sell", label: "Sell" },
  { href: "/why-us", label: "Why Us" },
  { href: "/faq", label: "FAQ" },
];

const NavLink = ({ href, label, onClick }: { href: string, label: string, onClick?: () => void }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Button variant="ghost" asChild className={cn(isActive && "bg-accent text-accent-foreground")}>
            <Link href={href} onClick={onClick}>{label}</Link>
        </Button>
    );
}

const DesktopNav = () => (
    <nav className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
        ))}
    </nav>
);

const MobileNav = ({ onLinkClick }: { onLinkClick: () => void }) => (
    <nav className="flex flex-col items-start gap-4 pt-8">
        {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} onClick={onLinkClick} />
        ))}
    </nav>
);

const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => {
    const { isAuthenticated, isAdmin, user, logout } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            await logout();
            if (isMobile) setIsOpen(false);
            toast({ title: "Logged out successfully." });
            router.push('/');
        } catch (error: any) {
            toast({ title: "Logout failed", description: "Something went wrong during logout.", variant: "destructive" });
        }
    }

    if (!isAuthenticated || !user) {
      return (
        <Button variant="ghost" asChild className={cn(isMobile ? "w-full justify-start" : "")}>
          <Link href="/auth/login" onClick={() => isMobile && setIsOpen(false)}>
            <User className="mr-2 h-4 w-4" />
            Login
          </Link>
        </Button>
      );
    }
    
    if (isMobile) {
      return (
        <div className="flex flex-col items-start gap-4 w-full">
            <div className="flex items-center gap-3 px-2">
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <p className="text-sm font-medium">{user.displayName || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
            </div>
             <DropdownMenuSeparator />
             <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/account/profile" onClick={() => setIsOpen(false)}>
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                  </Link>
              </Button>
            {isAdmin && (
              <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/admin" onClick={() => setIsOpen(false)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                  </Link>
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
        </div>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
             <DropdownMenuItem asChild>
                <Link href="/account/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/account/orders">
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
};


const ClientOnlyHeaderItems = () => {
    const { isAuthenticated } = useAuth();
    const { itemCount } = useCart();
    
    return (
        <>
            {isAuthenticated && (
                <Button variant="ghost" size="icon" asChild className="relative h-10 w-10">
                    <Link href="/cart">
                        <ShoppingCart className="h-5 w-5" />
                        {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                            {itemCount}
                        </span>
                        )}
                        <span className="sr-only">Shopping Cart</span>
                    </Link>
                </Button>
            )}
            <ThemeToggle />
            <div className="hidden md:flex">
                <AuthButtons />
            </div>
        </>
    )
}

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left section for logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Leaf className="h-6 w-6" />
            <span className="text-base sm:text-lg">Eco-Fone Nepal</span>
          </Link>
        </div>

        {/* Center section for navigation */}
        {isClient && <DesktopNav />}

        {/* Right section for actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isClient && <ClientOnlyHeaderItems />}
          
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                      <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary" onClick={() => setIsOpen(false)}>
                          <Leaf className="h-6 w-6" />
                          <span>Eco-Fone Nepal</span>
                      </Link>
                  </SheetTitle>
                </SheetHeader>
                {isClient && (
                    <>
                        <MobileNav onLinkClick={() => setIsOpen(false)} />
                        <div className="border-t pt-4 mt-4 w-full flex flex-col items-start gap-4">
                          <AuthButtons isMobile={true} />
                        </div>
                    </>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
