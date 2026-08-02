
'use server';

import nodemailer from 'nodemailer';
import jsPDF from 'jspdf';
import type { Order } from './types';

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

function generateInvoicePdf(order: Order): Buffer {
    const doc = new jsPDF();
    
    const primaryColor = '#22c55e';
    const textColor = '#333333';
    const lightTextColor = '#666666';

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
    const address = order.shippingAddress;
    doc.text(address.name, 20, 66);
    doc.text(address.address, 20, 72);
    doc.text(`${address.localLevel}, ${address.district}`, 20, 78);
    doc.text(address.province, 20, 84);

    doc.text(address.name, 110, 66);
    doc.text(address.address, 110, 72);
    doc.text(`${address.localLevel}, ${address.district}`, 110, 78);
    doc.text(address.province, 110, 84);

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
    
    return Buffer.from(doc.output('arraybuffer'));
}

export async function sendOrderConfirmationEmail(order: Order) {
  if (!process.env.EMAIL_USER) {
    console.warn("EMAIL_USER not set. Skipping order confirmation email.");
    return;
  }

  const invoicePdf = generateInvoicePdf(order);
  
  const itemsHtml = order.items.map(item => `
    <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName} (x${item.quantity})</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">NPR ${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h1 style="color: #22c55e; text-align: center;">Thank You for Your Order!</h1>
            <p>Hi ${order.shippingAddress.name},</p>
            <p>Your order #${order.id.slice(0, 7)} has been placed successfully. We've attached the invoice to this email for your records.</p>
            
            <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 30px;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                    ${itemsHtml}
                    <tr>
                        <td style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                        <td style="padding: 10px; text-align: right;">NPR ${order.subtotal.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; text-align: right; font-weight: bold;">VAT (13%):</td>
                        <td style="padding: 10px; text-align: right;">NPR ${order.vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    ${order.codFee ? `<tr><td style="padding: 10px; text-align: right; font-weight: bold;">Delivery Fee (COD):</td><td style="padding: 10px; text-align: right;">NPR ${order.codFee.toLocaleString()}</td></tr>` : ''}
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 1.2em;">Total:</td>
                        <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 1.2em;">NPR ${order.totalAmount.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            <h3 style="margin-top: 20px;">Order Details:</h3>
            <ul>
                <li><strong>Order ID:</strong> #${order.id.slice(0, 7)}</li>
                <li><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</li>
                <li><strong>Status:</strong> ${order.status}</li>
                <li><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</li>
            </ul>

            <p style="text-align: center; margin-top: 30px;">Thank you for shopping with Eco-Fone Nepal!</p>
        </div>
    </div>
  `;

  const mailOptions = {
    from: `"Eco-Fone Nepal" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `Your Eco-Fone Nepal Order Confirmation #${order.id.slice(0, 7)}`,
    html: emailHtml,
    attachments: [
        {
            filename: `invoice-${order.id.slice(0, 7)}.pdf`,
            content: invoicePdf,
            contentType: 'application/pdf',
        },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${order.email}`);
  } catch (error) {
    console.error(`Failed to send order confirmation email to ${order.email}:`, error);
    // We don't throw an error here to avoid failing the whole order process if email fails
  }
}
