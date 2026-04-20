import dotenv from 'dotenv';
dotenv.config();

export const env = {
  databaseUrl: process.env.DATABASE_URL || 'postgres://wtf:wtf_secret@localhost:5432/wtf_livepulse',
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  wsPath: process.env.WS_PATH || '/ws',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000'
};
