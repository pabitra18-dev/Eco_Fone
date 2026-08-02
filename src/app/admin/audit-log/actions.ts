
'use server';

import { db } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export interface AuditLog {
    id: string;
    adminId: string;
    adminEmail?: string; // We'll fetch this separately
    action: string;
    timestamp: string;
    [key: string]: any; // For other details
}

export async function getAuditLogs(): Promise<AuditLog[]> {
    try {
        const auditLogsRef = db.collection('auditLogs');

        // Delete logs older than one week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoTimestamp = Timestamp.fromDate(oneWeekAgo);
        
        const oldLogsQuery = auditLogsRef.where('timestamp', '<', oneWeekAgoTimestamp);
        const oldLogsSnapshot = await oldLogsQuery.get();

        if (!oldLogsSnapshot.empty) {
            const batch = db.batch();
            oldLogsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        const snapshot = await auditLogsRef.orderBy('timestamp', 'desc').limit(50).get();
        if (snapshot.empty) {
            return [];
        }
        
        const logs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: (data.timestamp as Timestamp).toDate().toISOString(),
            } as AuditLog;
        });

        // Fetch admin emails
        const adminIds = [...new Set(logs.map(log => log.adminId).filter(id => !!id))];
        if (adminIds.length > 0) {
            const adminDocs = await db.collection('users').where('__name__', 'in', adminIds).get();
            const adminEmailMap = new Map<string, string>();
            adminDocs.forEach(doc => {
                adminEmailMap.set(doc.id, doc.data().email);
            });

            return logs.map(log => ({
                ...log,
                adminEmail: adminEmailMap.get(log.adminId) || 'Unknown Admin'
            }));
        }
        
        return logs;

    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return [];
    }
}
