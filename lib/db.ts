import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL is not set in environment variables.");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase SSL connection
  }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

// RLS-aware query runner: sets dynamic tenant and user context inside a transaction
export async function executeTenantQuery(
  tenantId: string,
  userId: string | null,
  isElevated: boolean,
  actionFn: (client: any) => Promise<any>
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN;');
    
    // Set custom session variables for RLS filtering
    await client.query(`SET LOCAL app.current_tenant_id = ${client.escapeLiteral(tenantId)};`);
    if (userId) {
      await client.query(`SET LOCAL app.current_user_id = ${client.escapeLiteral(userId)};`);
    }
    await client.query(`SET LOCAL app.support_session_elevated = ${isElevated ? 'true' : 'false'};`);
    
    const result = await actionFn(client);
    
    await client.query('COMMIT;');
    return result;
  } catch (err) {
    await client.query('ROLLBACK;');
    throw err;
  } finally {
    client.release();
  }
}
