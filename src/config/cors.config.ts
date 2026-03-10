const whitelist = [
  'http://localhost:3000',
  'http://localhost:3000/',
]; // allowed origins

export const corsOptions = {
  origin: function originFn(
    origin: string | undefined,
    callback: (a: Error | null, b?: boolean) => void
  ) {
    console.log('origin', origin);
    if (
      !origin ||
      whitelist.indexOf(origin) !== -1 
    ) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`); // Debug log for blocked origins
      callback(new Error('Not allowed by CORS'));
    }
  },
  preflightContinue: true,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],
};
