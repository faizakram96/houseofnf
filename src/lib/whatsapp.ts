/**
 * Formats WhatsApp order message link with product and customer details
 */

export interface WhatsAppOrderPayload {
  productName: string;
  sku: string;
  size: string;
  quantity: number;
  price: number;
  customerName?: string;
  orderNumber?: string;
  color?: string;
}

export function generateWhatsAppOrderMessage(payload: WhatsAppOrderPayload): string {
  const { productName, sku, size, quantity, price, customerName, orderNumber, color } = payload;

  const lines = [
    `Hello House of NF,`,
    ``,
    `I would like to place an order:`,
    ``,
    `*Product:* ${productName}`,
    `*SKU / Product ID:* ${sku}`,
    size ? `*Size:* ${size}` : null,
    color ? `*Color:* ${color}` : null,
    `*Quantity:* ${quantity}`,
    `*Price:* ₹${price.toLocaleString('en-IN')}`,
    orderNumber ? `*Order Ref:* ${orderNumber}` : null,
    customerName ? `*Customer Name:* ${customerName}` : null,
    ``,
    `Please share the payment and confirmation details. Thank you!`
  ].filter(Boolean) as string[];

  return lines.join('\n');
}

export function getWhatsAppUrl(payload: WhatsAppOrderPayload, phoneNumber?: string): string {
  const number = phoneNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919664209989';
  // Clean phone number format
  const cleanedNumber = number.replace(/\D/g, '');
  const message = generateWhatsAppOrderMessage(payload);
  const encodedText = encodeURIComponent(message);

  return `https://wa.me/${cleanedNumber}?text=${encodedText}`;
}

export function getWhatsAppCartUrl(items: Array<{ name: string; sku: string; size: string; quantity: number; price: number }>, grandTotal: number, phoneNumber?: string): string {
  const number = phoneNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919664209989';
  const cleanedNumber = number.replace(/\D/g, '');

  const itemsList = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}* (SKU: ${item.sku}) - Size: ${item.size} x ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString('en-IN')}`
    )
    .join('\n');

  const text = `Hello House of NF,\n\nI would like to order the following items from my cart:\n\n${itemsList}\n\n*Total Amount:* ₹${grandTotal.toLocaleString('en-IN')}\n\nPlease guide me with payment and delivery steps.`;

  return `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(text)}`;
}
