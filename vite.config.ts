import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin, loadEnv } from 'vite';

const cashfreeDevPlugin = (env: Record<string, string>): Plugin => ({
  name: 'cashfree-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/create-cashfree-order', (req, res) => {
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-version');
        res.statusCode = 204;
        res.end();
        return;
      }

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
          const appId = process.env.CASHFREE_APP_ID || env.CASHFREE_APP_ID || env.VITE_CASHFREE_APP_ID;
          const secretKey = process.env.CASHFREE_SECRET_KEY || env.CASHFREE_SECRET_KEY;

          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/json');

          if (!appId || !secretKey) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Cashfree credentials not set in .env' }));
            return;
          }

          if (!body.orderAmount || body.orderAmount <= 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid order amount specified' }));
            return;
          }

          const cleanPhone = (body.customerPhone || '9999999999').replace(/\D/g, '').slice(-10) || '9999999999';
          const orderId = body.orderId || `ORD_${Date.now()}`;

          const clientOrigin = body.origin || req.headers.origin || '';
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
          res.setHeader('Access-Control-Allow-Origin', '*');
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
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) {
              return 'vendor-motion';
            }
            if (id.includes('node_modules/firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('node_modules/@cashfreepayments')) {
              return 'vendor-cashfree';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-lucide';
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
