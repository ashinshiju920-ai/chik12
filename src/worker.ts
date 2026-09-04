export interface Env {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  VITE_CASHFREE_APP_ID?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-version',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle Cashfree API endpoint in Cloudflare Worker runtime
    if (url.pathname === '/api/create-cashfree-order') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: CORS_HEADERS
        });
      }

      if (request.method === 'POST') {
        try {
          const body = (await request.json()) as any;
          const appId = env.CASHFREE_APP_ID || env.VITE_CASHFREE_APP_ID || '';
          const secretKey = env.CASHFREE_SECRET_KEY || '';

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

          const clientOrigin = body.origin || request.headers.get('origin') || '';
          const isHttps = typeof clientOrigin === 'string' && clientOrigin.startsWith('https://');
          const baseDomain = isHttps ? clientOrigin : 'https://www.divachic.online';
          const returnUrl = `${baseDomain}/?order_id={order_id}&payment=cashfree`;

          const cfRes = await fetch('https://api.cashfree.com/pg/orders', {
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
                return_url: returnUrl
              }
            })
          });

          const data = (await cfRes.json()) as any;

          return new Response(
            JSON.stringify(cfRes.ok ? {
              paymentSessionId: data.payment_session_id,
              orderId: data.order_id
            } : {
              error: data.message || 'Cashfree order creation failed',
              details: data
            }),
            {
              status: cfRes.status,
              headers: CORS_HEADERS
            }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ error: err.message || 'Internal server error processing Cashfree session' }),
            { status: 500, headers: CORS_HEADERS }
          );
        }
      }

      return new Response('Method Not Allowed', { status: 405 });
    }

    // Serve Static Assets & SPA routing via Cloudflare Workers Static Assets binding
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('DivaChic Storefront Active', { status: 200 });
  }
};
