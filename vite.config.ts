import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin, loadEnv } from 'vite';

const cashfreeDevPlugin = (env: Record<string, string>): Plugin => ({
  name: 'cashfree-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/create-cashfree-order', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }

      let bodyStr = '';
      req.on('data', (chunk) => {
        bodyStr += chunk;
      });
      req.on('end', async () => {
        try {
          const body = JSON.parse(bodyStr || '{}');
          const appId = process.env.CASHFREE_APP_ID || env.CASHFREE_APP_ID || env.VITE_CASHFREE_APP_ID || '';
          const secretKey = process.env.CASHFREE_SECRET_KEY || env.CASHFREE_SECRET_KEY || '';

          if (!appId || !secretKey) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Cashfree credentials not set in .env' }));
            return;
          }

          const cleanPhone = (body.customerPhone || '9999999999').replace(/\D/g, '').slice(-10) || '9999999999';
          const orderId = body.orderId || `ORD_${Date.now()}`;

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
                customer_name: body.customerName || 'Valued Client',
                customer_email: body.customerEmail || 'customer@divachic.online',
                customer_phone: cleanPhone
              },
              order_meta: {
                return_url: `https://www.divachic.online/order-confirmation?order_id=${orderId}`
              }
            })
          });

          const data = (await cfRes.json()) as any;
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = cfRes.status;
          if (!cfRes.ok) {
            res.end(JSON.stringify({ error: data.message || 'Cashfree error', details: data }));
          } else {
            res.end(
              JSON.stringify({
                paymentSessionId: data.payment_session_id,
                orderId: data.order_id
              })
            );
          }
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Failed to create order' }));
        }
      });
    });
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), cashfreeDevPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
