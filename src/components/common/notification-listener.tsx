
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

export function NotificationListener() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        const notificationsRef = collection(db, 'users', user.uid, 'notifications');
        const q = query(notificationsRef, where('read', '==', false));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            if (snapshot.empty) return;
            
            const batch = writeBatch(db);
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    
                    toast({
                        title: data.title,
                        description: data.body,
                        action: data.link ? (
                            <ToastAction altText="View" onClick={() => router.push(data.link)}>View</ToastAction>
                        ) : undefined,
                        duration: 10000, // 10 seconds
                    });
                    
                    const docRef = doc(db, 'users', user.uid, 'notifications', change.doc.id);
                    batch.update(docRef, { read: true });
                }
            });
            
            await batch.commit().catch(err => console.error("Error marking notifications as read:", err));

        }, (error) => {
            console.error("Error listening to notifications:", error);
        });

        return () => unsubscribe();
    }, [user, toast, router]);

    return null;
}
