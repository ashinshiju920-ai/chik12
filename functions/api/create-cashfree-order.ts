interface Env {
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  VITE_CASHFREE_APP_ID?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-version',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const body = (await context.request.json()) as {
      orderId?: string;
      orderAmount: number;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
    };

    const appId = context.env?.CASHFREE_APP_ID || context.env?.VITE_CASHFREE_APP_ID || '';
    const secretKey = context.env?.CASHFREE_SECRET_KEY || '';

    if (!appId || !secretKey) {
      return new Response(
        JSON.stringify({ error: 'Cashfree API credentials not configured in Cloudflare environment' }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    if (!body.orderAmount || body.orderAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid order amount specified' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const cleanPhone = (body.customerPhone || '9999999999').replace(/\D/g, '').slice(-10) || '9999999999';
    const orderId = body.orderId || `ORD_${Date.now()}`;

    const cashfreeRes = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Math.max(1, Math.round(body.orderAmount)),
        order_currency: 'INR',
        customer_details: {
          customer_id: `CUST_${Date.now()}`,
          customer_name: (body.customerName || 'Valued Client').trim().slice(0, 100),
          customer_email: (body.customerEmail || 'customer@divachic.online').trim(),
          customer_phone: cleanPhone
        },
        order_meta: {
          return_url: `https://www.divachic.online/order-confirmation?order_id=${orderId}`
        }
      })
    });

    const data = (await cashfreeRes.json()) as any;

    if (!cashfreeRes.ok) {
      return new Response(
        JSON.stringify({ error: data.message || 'Cashfree order creation failed', details: data }),
        {
          status: cashfreeRes.status,
          headers: CORS_HEADERS
        }
      );
    }

    return new Response(
      JSON.stringify({
        paymentSessionId: data.payment_session_id,
        orderId: data.order_id
      }),
      {
        status: 200,
        headers: CORS_HEADERS
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error processing Cashfree session' }),
      {
        status: 500,
        headers: CORS_HEADERS
      }
    );
  }
};
