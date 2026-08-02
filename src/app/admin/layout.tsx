
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, Users, LogOut, LineChart, Bell, Star, MessageSquare, Settings, Handshake, DollarSign, User as UserIcon, Image as ImageIcon, HelpCircle, History } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/common/theme-provider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { AdminNotificationCounts } from "./actions";
import { getNotificationCounts } from "./actions";


const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/buy", label: "Sell Requests", icon: DollarSign },
    { href: "/admin/sales", label: "Sales & Analytics", icon: LineChart },
    { href: "/admin/demands", label: "Demands", icon: Handshake },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/announcements", label: "Announcements", icon: Bell },
    { href: "/admin/featured", label: "Featured Products", icon: Star },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
    { href: "/admin/audit-log", label: "Audit Log", icon: History },
    { 
        label: "Settings", 
        icon: Settings,
        subItems: [
            { href: "/admin/settings", label: "General" },
            { href: "/admin/settings/images", label: "Site Images" },
        ]
    },
];

function BreadcrumbNav() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    const getLabel = (segment: string, fullPath: string) => {
        if (segment === 'admin' && segments.length === 1) return 'Dashboard';
        for (const item of navItems) {
            if ('href' in item && item.href === fullPath) return item.label;
            if ('subItems' in item) {
                for (const subItem of item.subItems) {
                    if (subItem.href === fullPath) return subItem.label;
                }
            }
        }
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    };

    const breadcrumbItems = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const label = getLabel(segment, href);
        const isLast = index === segments.length - 1;
        
        let navItemExists = false;
        for (const item of navItems) {
            if ('href' in item && item.href === href) {
                navItemExists = true;
                break;
            }
            if ('subItems' in item) {
                if (item.subItems.some(sub => sub.href === href)) {
                    navItemExists = true;
                    break;
                }
            }
        }

        const isDynamicSegment = index > 0 && !navItemExists;

        if (isDynamicSegment && segments[index-1] !== 'settings') {
          return null; 
        }

        return (
            <React.Fragment key={href}>
                <BreadcrumbItem>
                    {isLast ? (
                        <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink asChild>
                            <Link href={href}>{label}</Link>
                        </BreadcrumbLink>
                    )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
        );
    }).filter(Boolean);


    return (
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                {breadcrumbItems}
            </BreadcrumbList>
        </Breadcrumb>
    );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const pathname = usePathname();
  const [notificationCounts, setNotificationCounts] = React.useState<AdminNotificationCounts>({ orders: 0, sells: 0, demands: 0 });

  const fetchCounts = React.useCallback(async () => {
    const counts = await getNotificationCounts();
    setNotificationCounts(counts);
  }, []);

  React.useEffect(() => {
    if (isAdmin) {
      fetchCounts();
      const interval = setInterval(fetchCounts, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAdmin, fetchCounts]);

  React.useEffect(() => {
      if (
          (pathname.includes('/admin/orders') && notificationCounts.orders > 0) ||
          (pathname.includes('/admin/buy') && notificationCounts.sells > 0) ||
          (pathname.includes('/admin/demands') && notificationCounts.demands > 0)
      ) {
          setTimeout(fetchCounts, 1000);
      }
  }, [pathname, fetchCounts, notificationCounts]);


  if (isAuthenticated === null || isAdmin === null) {
    return (
        <div className="flex h-screen w-full items-center justify-center">Loading...</div>
    );
  }
  
  if (isAuthenticated === false || (isAuthenticated === true && isAdmin === false)) {
    return <div className="flex h-screen w-full items-center justify-center">Redirecting to login...</div>;
  }

  const getNotificationCountForItem = (href: string) => {
    if (href.startsWith('/admin/orders')) return notificationCounts.orders;
    if (href.startsWith('/admin/buy')) return notificationCounts.sells;
    if (href.startsWith('/admin/demands')) return notificationCounts.demands;
    return 0;
  }

  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
    >
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <Link href="/admin" className="flex items-center gap-2 font-semibold">
                        <Package className="h-6 w-6 text-primary" />
                        <span className="text-lg">Eco-Fone</span>
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {navItems.map((item) => {
                           if ('subItems' in item) {
                                const isSettingsActive = pathname.startsWith('/admin/settings');
                                return (
                                    <Collapsible key={item.label} defaultOpen={isSettingsActive}>
                                        <SidebarMenuItem as="div">
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton as="button" isCollapsible={true} tooltip={item.label} className={cn("w-full", isSettingsActive && "bg-muted")}>
                                                    <item.icon />
                                                    <span>{item.label}</span>
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                        </SidebarMenuItem>
                                        <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                                            <SidebarMenu className="pl-6">
                                                {item.subItems.map(subItem => (
                                                     <SidebarMenuItem key={subItem.href}>
                                                        <SidebarMenuButton href={subItem.href} isActive={pathname === subItem.href} size="sm">
                                                            {subItem.label}
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </SidebarMenu>
                                        </CollapsibleContent>
                                    </Collapsible>
                                )
                            }
                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                            const notificationCount = getNotificationCountForItem(item.href);
                            return (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton href={item.href} isActive={isActive} tooltip={item.label} notification={notificationCount}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={logout} tooltip="Logout" href="#">
                               <LogOut />
                               <span>Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset>
                <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="md:hidden" />
                        <BreadcrumbNav />
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'Admin'} />
                                <AvatarFallback>{user?.displayName?.charAt(0) ?? 'A'}</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Toggle user menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>My Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem asChild>
                                <Link href="/admin/settings">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                           </DropdownMenuItem>
                           <DropdownMenuItem asChild>
                                <Link href="/faq">
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    <span>Support</span>
                                </Link>
                           </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
        <Toaster />
    </ThemeProvider>
  );
}
