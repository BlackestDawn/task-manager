import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL || 'postgresql://localhost:5432/taskmanager',
  },
  verbose: true,
  strict: true,
});