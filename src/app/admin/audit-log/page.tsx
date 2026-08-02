
'use client';

import React, { useEffect, useState } from 'react';
import { getAuditLogs, type AuditLog } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { History, UserCog, UserX, UserPlus, FilePlus, FilePen, FileX, Bell } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const actionDisplayMap: { [key: string]: { icon: React.ElementType, label: string, variant: 'default' | 'secondary' | 'destructive' } } = {
    'changeUserRole': { icon: UserCog, label: 'Role Change', variant: 'secondary' },
    'deleteUser': { icon: UserX, label: 'User Deletion', variant: 'destructive' },
    'orderStatusUpdate': { icon: UserPlus, label: 'Order Update', variant: 'default' },
    'createAnnouncement': { icon: FilePlus, label: 'Announcement Created', variant: 'default' },
    'updateAnnouncement': { icon: FilePen, label: 'Announcement Updated', variant: 'secondary' },
    'deleteAnnouncement': { icon: FileX, label: 'Announcement Deleted', variant: 'destructive' },
};

const LogDetails = ({ log }: { log: AuditLog }) => {
    switch (log.action) {
        case 'changeUserRole':
            return <p>Changed role of <span className="font-semibold">{log.targetUserEmail}</span> from <Badge variant="outline">{log.oldRole}</Badge> to <Badge>{log.newRole}</Badge>.</p>;
        case 'deleteUser':
            return <p>Permanently deleted user <span className="font-semibold">{log.deletedUserEmail}</span>.</p>;
        case 'orderStatusUpdate':
            return <p>{log.details}</p>
        case 'createAnnouncement':
        case 'updateAnnouncement':
        case 'deleteAnnouncement':
            return <p>Title: <span className="font-semibold">{log.announcementTitle}</span></p>;
        default:
            return <pre className="text-xs bg-muted p-2 rounded-md">{JSON.stringify(log, null, 2)}</pre>;
    }
}


const AuditLogPageSkeleton = () => (
    <Card>
        <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>Tracking important changes made by administrators.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Timestamp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
)

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            const data = await getAuditLogs();
            setLogs(data);
            setLoading(false);
        };
        fetchLogs();
    }, []);

    if (loading) {
        return (
            <div>
                <div className="flex items-center gap-4 mb-8">
                    <History className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Audit Log</h1>
                        <p className="text-muted-foreground">Tracking important changes made by administrators.</p>
                    </div>
                </div>
                <AuditLogPageSkeleton />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <History className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Audit Log</h1>
                    <p className="text-muted-foreground">Tracking important changes made by administrators.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Here are the most recent changes made in the admin panel.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Desktop Table */}
                    <div className="hidden md:block border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Admin</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead className="text-right">When</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length > 0 ? (
                                    logs.map(log => {
                                        const displayInfo = actionDisplayMap[log.action] || { icon: Bell, label: log.action, variant: 'outline' };
                                        return (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-medium">{log.adminEmail || 'System'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={displayInfo.variant}>
                                                        <displayInfo.icon className="h-3.5 w-3.5 mr-1.5" />
                                                        {displayInfo.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    <LogDetails log={log} />
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-muted-foreground" title={format(new Date(log.timestamp), 'PPP p')}>
                                                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No audit logs found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Accordion */}
                    <div className="md:hidden space-y-3">
                        {logs.length > 0 ? (
                           <Accordion type="single" collapsible className="w-full">
                                {logs.map(log => {
                                    const displayInfo = actionDisplayMap[log.action] || { icon: Bell, label: log.action, variant: 'outline' };
                                    return (
                                        <AccordionItem value={log.id} key={log.id} className="border rounded-lg">
                                            <AccordionTrigger className="p-4 text-sm hover:no-underline">
                                                <div className="flex-1 flex justify-between items-center mr-4 text-left">
                                                    <div>
                                                        <p className="font-semibold">{log.adminEmail || 'System'}</p>
                                                        <p className="text-xs text-muted-foreground" title={format(new Date(log.timestamp), 'PPP p')}>
                                                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                    <Badge variant={displayInfo.variant} className="whitespace-nowrap">
                                                        <displayInfo.icon className="h-3.5 w-3.5 mr-1.5" />
                                                        {displayInfo.label}
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="p-4 border-t text-sm text-muted-foreground">
                                                <LogDetails log={log} />
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                            </Accordion>
                        ) : (
                             <div className="text-center h-24 text-muted-foreground flex items-center justify-center">No audit logs found.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
