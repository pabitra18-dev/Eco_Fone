
'use server';
import type { Demand, ProductCategoryRating } from './types';
import { db } from './firebaseAdmin';
import { z } from 'zod';
import type { DemandFormValues } from '@/components/demand-form';
import { Timestamp } from 'firebase-admin/firestore';
import { createNotification } from './notifications';

const RATING_LEVELS: [ProductCategoryRating, ...ProductCategoryRating[]] = ['GOAT', 'Great', 'Good', 'OK'];

const baseSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  socialMedia: z.string().url().or(z.literal('')).optional(),
  expectedPrice: z.array(z.number()).length(2).optional(),
});

const specificDemandSchema = baseSchema.extend({
  demandType: z.literal('specific'),
  brand: z.string().min(1, "Brand is required."),
  model: z.string().min(1, "Model is required."),
  storage: z.string().optional(),
  ram: z.string().optional(),
  batteryHealth: z.string().optional().nullable(),
});

const generalDemandSchema = baseSchema.extend({
  demandType: z.literal('general'),
  storage: z.string().min(1, "Storage is required."),
  ram: z.string().min(1, "RAM is required."),
  categories: z.object({
    gamingPerformance: z.enum(RATING_LEVELS),
    camera: z.enum(RATING_LEVELS),
    battery: z.enum(RATING_LEVELS),
    looksAndFeel: z.enum(RATING_LEVELS),
    valueForMoney: z.enum(RATING_LEVELS),
  }),
});

const demandSchema = z.discriminatedUnion("demandType", [specificDemandSchema, generalDemandSchema]);

export async function submitDemand(userId: string, data: DemandFormValues) {
    const validated = demandSchema.safeParse(data);

    if (!validated.success) {
        console.error("Validation failed:", validated.error.flatten().fieldErrors);
        throw new Error('Invalid data provided.');
    }

    try {
        const userRecord = await db.collection('users').doc(userId).get();
        const userEmail = userRecord.data()?.email;
        if (!userEmail) throw new Error("Could not find user email.");
        
        let categoriesWithValues: Partial<Demand['categories']> = {};
        if ('categories' in validated.data && validated.data.categories) {
            for (const [key, value] of Object.entries(validated.data.categories)) {
                if (value && value !== 'any') {
                    categoriesWithValues[key as keyof Demand['categories']] = value;
                }
            }
        }
        
        const dataToSave = {
            ...validated.data,
            userId,
            email: userEmail,
            batteryHealth: 'batteryHealth' in validated.data ? validated.data.batteryHealth || null : null,
            categories: categoriesWithValues,
            createdAt: Timestamp.now(),
            status: 'new'
        };

        if (dataToSave.demandType === 'general') {
            delete (dataToSave as any).brand;
            delete (dataToSave as any).model;
        }

        await db.collection("demands").add(dataToSave);
        
        await createNotification({ forAdmins: true }, {
            title: 'New Phone Demand',
            body: `${validated.data.fullName} submitted a new demand.`,
            link: `/admin/demands`
        });

    } catch (error) {
        console.error("Error submitting demand to Firestore:", error);
        throw new Error('Failed to submit your demand to the database.');
    }
}

export async function updateDemand(id: string, userId: string, data: DemandFormValues) {
    const validated = demandSchema.safeParse(data);

    if (!validated.success) {
        console.error("Validation failed for update:", validated.error.flatten().fieldErrors);
        throw new Error('Invalid data provided for update.');
    }

    try {
        const demandRef = db.collection('demands').doc(id);
        const docSnap = await demandRef.get();
        if (!docSnap.exists || docSnap.data()?.userId !== userId) {
            throw new Error("Permission denied or demand not found.");
        }
        
        let categoriesWithValues: Partial<Demand['categories']> = {};
        if ('categories' in validated.data && validated.data.categories) {
            for (const [key, value] of Object.entries(validated.data.categories)) {
                if (value && value !== 'any') {
                    categoriesWithValues[key as keyof Demand['categories']] = value;
                }
            }
        }
        
        const dataToSave = {
            ...validated.data,
            batteryHealth: 'batteryHealth' in validated.data ? validated.data.batteryHealth || null : null,
            categories: categoriesWithValues,
            updatedAt: Timestamp.now(),
        };

        if (dataToSave.demandType === 'general') {
            delete (dataToSave as any).brand;
            delete (dataToSave as any).model;
        }

        await demandRef.update(dataToSave);

    } catch (error) {
        console.error("Error updating demand in Firestore:", error);
        throw new Error('Failed to update your demand in the database.');
    }
}
