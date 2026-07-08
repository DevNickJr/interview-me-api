import env from './env.config';

const otherHosts = env.ALLOWED_HOSTS?.split(',') || [];

const whitelist = [
  'http://localhost:3000',
  'https://interview-me-phi.vercel.app'
]; // origins

export const corsOptions = {
  origin: function originFn(
    origin: string | undefined,
    callback: (a: Error | null, b?: boolean) => void
  ) {
    console.log('origin', origin);
    if (
      !origin ||
      whitelist.indexOf(origin) !== -1 ||
      otherHosts.indexOf(origin) !== -1
    ) {
      callback(null, true);
    } else {
      const normalizedOrigin = origin.toLowerCase().replace(/\/$/, ''); // remove trailing slash
      console.log({
        normalizedOrigin
      })
      const allowed =
        whitelist
          .map(o => o.toLowerCase().replace(/\/$/, ''))
          .includes(normalizedOrigin) ||
        otherHosts
          .map(o => o.toLowerCase().replace(/\/$/, ''))
          .includes(normalizedOrigin)

      console.log({
        allowed
      })

      if (allowed) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  preflightContinue: true,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'tempauth',
    'x-client-type',
    'Cache-Control',
    'cache-control', // Handle both cases
    'pragma',
  ],
  maxAge: 300,
};
