'use server';

import { db } from "@/lib/firebaseAdmin";
import type { Order } from "@/lib/types";
import { Timestamp } from "firebase-admin/firestore";

interface MonthlySalesData {
  month: string;
  total: number;
}

export async function getSalesData(startDate?: Date, endDate?: Date): Promise<MonthlySalesData[]> {
  try {
    const ordersCollection = db.collection("orders");
    let q = ordersCollection.orderBy("orderDate", "asc");

    if (startDate && endDate) {
      q = q.where("orderDate", ">=", startDate).where("orderDate", "<=", endDate);
    }

    const querySnapshot = await q.get();

    const monthlySales: { [key: string]: number } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    querySnapshot.forEach((doc) => {
      const order = doc.data() as Order;
      // Ensure only delivered orders contribute to sales data
      if (order.status !== 'Delivered') return;
      
      const orderDate = (order.orderDate as unknown as Timestamp).toDate();
      const monthYear = `${monthNames[orderDate.getMonth()]} ${orderDate.getFullYear()}`;

      if (!monthlySales[monthYear]) {
        monthlySales[monthYear] = 0;
      }
      monthlySales[monthYear] += order.totalAmount;
    });
    
    // Create a map of all months in the range to ensure no gaps
    const allMonthsInRange: { [key: string]: number } = {};
    let currentDate = startDate ? new Date(startDate) : new Date(new Date().setFullYear(new Date().getFullYear() -1));
    const finalEndDate = endDate || new Date();
    
    while(currentDate <= finalEndDate) {
        const monthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        allMonthsInRange[monthYear] = monthlySales[monthYear] || 0;
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const salesData: MonthlySalesData[] = Object.keys(allMonthsInRange).map(monthYear => {
        const [month] = monthYear.split(' ');
        return {
            month: month,
            total: allMonthsInRange[monthYear]
        };
    });

    return salesData;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }
}
