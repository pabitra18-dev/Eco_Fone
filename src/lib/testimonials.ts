
import { cache } from 'react';
import type { Testimonial } from './types';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';


export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  try {
    const testimonialsCol = collection(db, 'testimonials');
    const testimonialSnapshot = await getDocs(testimonialsCol);
    const testimonialList = testimonialSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
    return testimonialList;
  } catch(error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
});

export async function addTestimonial(data: Omit<Testimonial, 'id'>) {
  try {
    const testimonialsCol = collection(db, 'testimonials');
    const docRef = await addDoc(testimonialsCol, data);
    return { ...data, id: docRef.id };
  } catch(error) {
    console.error("Error adding testimonial:", error);
    throw error;
  }
}

export async function updateTestimonial(id: string, data: Partial<Omit<Testimonial, 'id'>>) {
  try {
    const testimonialDocRef = doc(db, 'testimonials', id);
    await updateDoc(testimonialDocRef, data);
    const updatedDoc = await getDoc(testimonialDocRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Testimonial;
  } catch(error) {
    console.error(`Error updating testimonial ${id}:`, error);
    throw error;
  }
}

export async function deleteTestimonial(id: string) {
  try {
    const testimonialDocRef = doc(db, 'testimonials', id);
    await deleteDoc(testimonialDocRef);
    return;
  } catch(error) {
    console.error(`Error deleting testimonial ${id}:`, error);
    throw error;
  }
}
