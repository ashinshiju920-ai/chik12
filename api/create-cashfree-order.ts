export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-version');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const appId = process.env.CASHFREE_APP_ID || process.env.VITE_CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      res.status(500).json({ error: 'Cashfree API credentials missing' });
      return;
    }

    if (!body.orderAmount || body.orderAmount <= 0) {
      res.status(400).json({ error: 'Invalid order amount specified' });
      return;
    }

    const cleanPhone = (body.customerPhone || '9999999999').replace(/\D/g, '').slice(-10) || '9999999999';
    const safePhone = cleanPhone.length === 10 ? cleanPhone : '9999999999';
    const orderId = body.orderId || `ORD_${Date.now()}`;

    const clientOrigin = body.origin || req.headers?.origin || '';
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
          customer_phone: safePhone
        },
        order_meta: {
          return_url: returnUrl
        }
      })
    });

    const data = await cfRes.json() as any;

    if (cfRes.ok && data.payment_session_id) {
      res.status(200).json({
        paymentSessionId: data.payment_session_id,
        orderId: data.order_id
      });
    } else {
      res.status(cfRes.status || 400).json({
        error: data.message || 'Cashfree order creation failed',
        details: data
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error processing Cashfree session' });
  }
}
