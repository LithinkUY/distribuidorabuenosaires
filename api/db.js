import pg from 'pg';
const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      'postgresql://neondb_owner:npg_5ljGiT1DMrXb@ep-shiny-wind-b518gn85-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  return pool;
}
