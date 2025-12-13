// src/database/database.providers.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: async () => {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,  // Required for Neon
        },
      });

      // Test connection
      try {
        const client = await pool.connect();
        console.log('✅ Database connection established successfully');
        client.release();
      } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
      }

      return drizzle(pool, { schema });
    },
  },
];

// Type for the database instance
export type Database = ReturnType<typeof drizzle<typeof schema>>;