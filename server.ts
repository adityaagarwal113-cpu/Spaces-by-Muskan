import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createBackendApp } from './serverApp';

const PORT = Number(process.env.PORT || 3000);
const DIST_DIR = path.resolve('dist');

async function startServer() {
  const app = createBackendApp();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(DIST_DIR));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Spaces by Muskan server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Spaces by Muskan server:', err);
  process.exit(1);
});
