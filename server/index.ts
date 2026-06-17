import express from 'express';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { authRouter } from './auth.js';
import { getSession } from './session.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(__dirname, '..', 'static');

const app = express();

app.use(cookieParser());

app.use('/auth', authRouter);

app.use('/api', (req, res, next) => {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  next();
}, createProxyMiddleware({
  target: config.gittanApiUrl,
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  on: {
    proxyReq: (proxyReq, req) => {
      const session = getSession(req as express.Request);
      if (session?.accessToken) {
        proxyReq.setHeader('Authorization', `Bearer ${session.accessToken}`);
      }
    },
  },
}));

app.use(express.static(path.join(staticDir, 'app'), { index: false }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(staticDir, 'landing.html'));
});

app.get('/landing.html', (_req, res) => {
  res.sendFile(path.join(staticDir, 'landing.html'));
});

const requireAuth: express.RequestHandler = (req, res, next) => {
  const session = getSession(req);
  if (!session) {
    res.redirect('/auth/login');
    return;
  }
  next();
};

app.use('/app', requireAuth, express.static(path.join(staticDir, 'app')));

app.get('/app/{*splat}', requireAuth, (_req, res) => {
  res.sendFile(path.join(staticDir, 'app', 'index.html'));
});

app.get('/*splat', requireAuth, (req, res) => {
  const reqPath = req.params.splat?.[0] || '';
  const filePath = path.join(staticDir, 'app', reqPath);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.sendFile(path.join(staticDir, 'app', 'index.html'));
    }
  });
});

app.listen(config.port, () => {
  console.log(`gittan-web listening on :${config.port}`);
});
