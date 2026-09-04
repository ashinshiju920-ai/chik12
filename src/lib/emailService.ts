/**
 * Utility to dispatch automated order confirmation emails via Google Apps Script Webhook.
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
  const webhookUrl =
    (import.meta as any).env?.VITE_GMAIL_WEBHOOK_URL ||
    "https://script.google.com/macros/s/AKfycbz-9hCIHHhcie99SpLzR9USeogY7AwgiXKwyB8AMDGynyw2cEp7aliB3FM6jYpyVIHA/exec";

  try {
    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors", // Required to handle Google Apps Script 302 redirects seamlessly
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // text/plain prevents CORS preflight blocks with Google Apps Script
      },
      body: JSON.stringify(orderDetails),
    });
    console.log(`[Email Dispatch] Confirmation email dispatched for Order #${orderDetails.orderId}`);
  } catch (error) {
    console.warn("Failed to dispatch confirmation email:", error);
  }
};
