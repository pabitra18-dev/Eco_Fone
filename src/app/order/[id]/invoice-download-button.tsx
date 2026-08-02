
"use client"

import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Order } from '@/lib/types'

export function InvoiceDownloadButton({ order }: { order: Order }) {
  const generateInvoice = () => {
    const doc = new jsPDF();
    
    // Colors
    const primaryColor = '#22c55e'; // Green
    const textColor = '#333333';
    const lightTextColor = '#666666';

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text("Eco-Fone Nepal", 20, 20);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text("TAX INVOICE", 190, 20, { align: "right" });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightTextColor);
    doc.text(`Order ID: #${order.id.slice(0, 7)}`, 190, 28, { align: "right" });
    doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`, 190, 34, { align: "right" });
    doc.text("PAN/VAT Reg No: XXXXXXXXX", 190, 40, { align: "right" });
    
    doc.text("Hetauda, Bagmati Province, Nepal", 20, 28);
    doc.text("sales@ecofone.com.np", 20, 34);


    // Billing and Shipping
    doc.setDrawColor(primaryColor);
    doc.line(20, 48, 190, 48);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text("BILLING DETAILS", 20, 58);
    doc.text("SHIPPING DETAILS", 110, 58);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightTextColor);
    doc.text(order.shippingAddress.name, 20, 66);
    doc.text(order.shippingAddress.address, 20, 72);
    doc.text(`${order.shippingAddress.localLevel}, ${order.shippingAddress.district}`, 20, 78);
    doc.text(order.shippingAddress.province, 20, 84);

    doc.text(order.shippingAddress.name, 110, 66);
    doc.text(order.shippingAddress.address, 110, 72);
    doc.text(`${order.shippingAddress.localLevel}, ${order.shippingAddress.district}`, 110, 78);
    doc.text(order.shippingAddress.province, 110, 84);


    // Items Table
    let y = 100;
    doc.setFillColor(primaryColor);
    doc.rect(20, y - 8, 170, 10, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.text("S.N.", 22, y);
    doc.text("Item Description", 35, y);
    doc.text("Qty", 120, y);
    doc.text("Unit Price", 140, y, {align: "right"});
    doc.text("Total", 188, y, {align: "right"});
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    order.items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        doc.text((index + 1).toString(), 22, y);
        doc.text(item.productName, 35, y);
        doc.text(item.quantity.toString(), 122, y);
        doc.text(item.price.toLocaleString(), 140, y, {align: 'right'});
        doc.text(itemTotal.toLocaleString(), 188, y, {align: 'right'});
        y += 7;
    });

    // Financial Summary
    y += 5;
    doc.setDrawColor(lightTextColor);
    doc.line(120, y, 190, y);
    y += 7;

    doc.setFontSize(10);
    doc.setTextColor(lightTextColor);
    doc.text("Subtotal:", 120, y);
    doc.text(`NPR ${order.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, y, {align: 'right'});
    y += 7;
    
    if (order.codFee) {
        doc.text("Shipping (COD Fee):", 120, y);
        doc.text(`NPR ${order.codFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, y, {align: 'right'});
        y += 7;
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text("VAT (13%):", 120, y);
    doc.text(`NPR ${order.vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, y, {align: 'right'});
    y += 10;
    
    doc.setFillColor(primaryColor);
    doc.rect(118, y - 5, 74, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#FFFFFF');
    doc.text("TOTAL AMOUNT:", 120, y);
    doc.text(`NPR ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, y, { align: "right" });
    y += 10;

    // Payment Status
    doc.setFontSize(10);
    doc.setTextColor(textColor);
    if (order.paymentMethod === 'cod' && order.status === 'Pending Payment') {
        doc.text(`Security Deposit Paid: NPR ${(order.codPrepayment || 0).toLocaleString()}`, 190, y, {align: 'right'});
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text(`Amount Due on Delivery: NPR ${(order.totalAmount - (order.codPrepayment || 0)).toLocaleString()}`, 190, y, {align: 'right'});
    } else if (order.status !== 'Pending Payment' && order.status !== 'Cancelled') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text(`Status: PAID`, 190, y, {align: 'right'});
    } else {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#dc2626'); // red
        doc.text(`Status: UNPAID`, 190, y, {align: 'right'});
    }
    
    // Footer
    y = doc.internal.pageSize.height - 40;
    doc.setDrawColor(primaryColor);
    doc.line(20, y, 190, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(lightTextColor);
    doc.text("Thank you for choosing a Sustainable Tech Solution.", 105, y, { align: "center" });
    y += 5;
    doc.text("This device includes a 3-month hardware warranty. For T&Cs, visit ecofonenepal.com/terms-of-service", 105, y, { align: "center" });
    y += 15;
    
    doc.line(140, y, 190, y);
    doc.text("Authorized Signature", 165, y + 5, { align: "center" });
    

    doc.save(`invoice-${order.id.slice(0, 7)}.pdf`);
  };

  return (
    <Button variant="outline" onClick={generateInvoice}>
        <Download className="mr-2 h-4 w-4" />
        Download Invoice
    </Button>
  );
}
