import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL);

export const db = {
  /**
   * Execute a SQL query
   */
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    try {
      const result = await sql(text, params);
      return result as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  /**
   * Execute a query and return a single row
   */
  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const result = await this.query<T>(text, params);
    return result[0] || null;
  }
};