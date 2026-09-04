/**
 * Utility to dispatch automated order confirmation emails via Google Apps Script Webhook.
 * Supports Cash on Delivery (COD) and Online Payments with dual webhook resilience.
 */
export interface OrderEmailDetails {
  customerEmail: string;
  customerName: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: string;
  items: Array<{ title: string; quantity: number; price: number }>;
}

export const sendOrderConfirmationEmail = async (orderDetails: OrderEmailDetails): Promise<void> => {
  // Primary active Google Apps Script deployment (Status 200 verified)
  const primaryWebhookUrl = "https://script.google.com/macros/s/AKfycbyjk8MYflKlMaqFM8ZQzwl673roAingHJSsclhshnBd709DqUmMArW3TGx1pId93hU/exec";
  const customGmailWebhook = (import.meta as any).env?.VITE_GMAIL_WEBHOOK_URL;

  const itemsSummary = (orderDetails.items || [])
    .map((item) => `${item.title} (x${item.quantity}) - ₹${item.price.toLocaleString('en-IN')}`)
    .join(', ');

  const payload = {
    action: 'order_confirmation',
    orderNumber: orderDetails.orderId,
    orderId: orderDetails.orderId,
    email: orderDetails.customerEmail,
    customerEmail: orderDetails.customerEmail,
    name: orderDetails.customerName,
    customerName: orderDetails.customerName,
    total: orderDetails.totalAmount,
    totalAmount: orderDetails.totalAmount,
    paymentMethod: orderDetails.paymentMethod,
    itemsCount: orderDetails.items?.length || 1,
    itemsSummary,
    items: orderDetails.items,
    timestamp: new Date().toISOString()
  };

  // Dispatch to the active Google Apps Script deployment
  try {
    await fetch(primaryWebhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log(`[Email Dispatch] Confirmation email dispatched via primary webhook for Order #${orderDetails.orderId} (${orderDetails.paymentMethod})`);
  } catch (err) {
    console.warn("Failed to dispatch via primary webhook:", err);
  }

  // Also dispatch to custom webhook URL if configured and different
  if (customGmailWebhook && customGmailWebhook !== primaryWebhookUrl) {
    try {
      await fetch(customGmailWebhook, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });
      console.log(`[Email Dispatch] Dispatched to custom Gmail webhook for Order #${orderDetails.orderId}`);
    } catch (error) {
      console.warn("Failed to dispatch via custom Gmail webhook:", error);
    }
  }
};
