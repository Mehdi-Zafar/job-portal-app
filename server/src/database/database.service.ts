// // src/database/database.service.ts
// import { Injectable, Inject } from '@nestjs/common';
// import { DATABASE_CONNECTION, Database } from './database.providers';
// import { sql } from 'drizzle-orm';

// @Injectable()
// export class DatabaseService {
//   constructor(
//     @Inject(DATABASE_CONNECTION)
//     private readonly db: Database,
//   ) {}

//   /**
//    * Get the database instance
//    */
//   getDb(): Database {
//     return this.db;
//   }

//   /**
//    * Execute raw SQL query
//    */
//   async executeRaw<T = any>(query: string): Promise<T[]> {
//     return this.db.execute(sql.raw(query));
//   }

//   /**
//    * Health check - verify database connection
//    */
//   async healthCheck(): Promise<boolean> {
//     try {
//       await this.db.execute(sql`SELECT 1`);
//       return true;
//     } catch (error) {
//       console.error('Database health check failed:', error);
//       return false;
//     }
//   }

//   /**
//    * Get database statistics
//    */
//   async getStats() {
//     const result = await this.db.execute(sql`
//       SELECT 
//         schemaname,
//         tablename,
//         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
//       FROM pg_tables
//       WHERE schemaname = 'public'
//       ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
//     `);
//     return result;
//   }
// }