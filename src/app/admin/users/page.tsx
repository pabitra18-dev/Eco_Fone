
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, UserX, UserCheck, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { getUsers } from '@/lib/users';
import type { SiteUser } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { changeUserRole, deleteUser as deleteUserAction } from "./actions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function UsersPage() {
    const { isMasterAdmin, user: currentUser } = useAuth();
    const [users, setUsers] = useState<SiteUser[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        const userList = await getUsers();
        setUsers(userList);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (targetUserId: string, newRole: 'Admin' | 'User') => {
        const result = await changeUserRole(targetUserId, newRole);
        if (result.success) {
            toast({ title: 'Success', description: `User role has been updated to ${newRole}.` });
            fetchUsers(); // Re-fetch to update UI
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    };
    
    const handleDeleteUser = async (targetUserId: string) => {
        if(targetUserId === currentUser?.uid) {
            toast({ title: 'Error', description: "You cannot delete your own account.", variant: 'destructive' });
            return;
        }
        const result = await deleteUserAction(targetUserId);
         if (result.success) {
            toast({ title: 'Success', description: `User has been deleted.` });
            fetchUsers(); // Re-fetch to update UI
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    }
    
    const getRoleBadgeVariant = (role: SiteUser['role']) => {
        switch (role) {
            case 'Master Admin': return 'default';
            case 'Admin': return 'secondary';
            default: return 'outline';
        }
    }


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">View and manage all registered users, sorted by join date.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A complete list of your registered users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Desktop Table */}
                    <div className="hidden md:block border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? users.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            #{String(index + 1).padStart(8, '0')}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{user.email}</div>
                                            {user.phone && <div className="text-sm text-muted-foreground">{user.phone}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{format(new Date(user.joinedDate), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
                                            {isMasterAdmin && user.role !== 'Master Admin' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        {user.role === 'User' && (
                                                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'Admin')}>
                                                                <UserCheck className="mr-2 h-4 w-4" /> Make Admin
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.role === 'Admin' && (
                                                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'User')}>
                                                                <UserX className="mr-2 h-4 w-4" /> Revoke Admin
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator/>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No users found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Mobile Accordion */}
                    <div className="md:hidden space-y-3">
                        {users.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                                {users.map((user, index) => (
                                    <AccordionItem value={user.id} key={user.id} className="border rounded-lg">
                                        <AccordionTrigger className="p-4 text-sm hover:no-underline">
                                            <div className="flex items-center gap-3 text-left">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="border-t p-4 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-muted-foreground">Role:</span>
                                                <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-muted-foreground">Joined:</span>
                                                <span>{format(new Date(user.joinedDate), 'PPP')}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-muted-foreground">Member ID:</span>
                                                <span className="font-mono text-xs">#{String(index + 1).padStart(8, '0')}</span>
                                            </div>
                                            {isMasterAdmin && user.role !== 'Master Admin' && (
                                                <div className="flex justify-end pt-2">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                Actions <MoreHorizontal className="ml-2 h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            {user.role === 'User' && (
                                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'Admin')}>
                                                                    <UserCheck className="mr-2 h-4 w-4" /> Make Admin
                                                                </DropdownMenuItem>
                                                            )}
                                                            {user.role === 'Admin' && (
                                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'User')}>
                                                                    <UserX className="mr-2 h-4 w-4" /> Revoke Admin
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator/>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                            ) : (
                            <div className="text-center h-24 text-muted-foreground flex items-center justify-center">No users found.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
