import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

function apiMiddleware() {
  return {
    name: 'api-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        let body: any = {};
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
          const buffers: Buffer[] = [];
          for await (const chunk of req) {
            buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          const raw = Buffer.concat(buffers).toString('utf-8');
          if (raw) {
            try { body = JSON.parse(raw); } catch (e) { body = {}; }
          }
        }

        const mockReq = {
          url: req.url,
          method: req.method,
          query: Object.fromEntries(url.searchParams.entries()),
          body,
          headers: req.headers,
        };

        const mockRes = {
          statusCode: 200,
          headers: {} as Record<string, string>,
          setHeader(name: string, val: string) {
            this.headers[name] = val;
            res.setHeader(name, val);
          },
          status(code: number) {
            this.statusCode = code;
            res.statusCode = code;
            return this;
          },
          json(data: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = this.statusCode || 200;
            res.end(JSON.stringify(data));
          },
          end(data?: any) {
            res.statusCode = this.statusCode || 200;
            res.end(data);
          },
        };

        try {
          if (pathname === '/api/products') {
            const { default: handler } = await import('./api/products.js');
            return handler(mockReq, mockRes);
          }
          if (pathname === '/api/categories') {
            const { default: handler } = await import('./api/categories.js');
            return handler(mockReq, mockRes);
          }
          if (pathname === '/api/settings') {
            const { default: handler } = await import('./api/settings.js');
            return handler(mockReq, mockRes);
          }
          if (pathname === '/api/sync') {
            const { default: handler } = await import('./api/sync.js');
            return handler(mockReq, mockRes);
          }
          next();
        } catch (err: any) {
          console.error('API Error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddleware()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
