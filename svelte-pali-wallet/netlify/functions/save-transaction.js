import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6v5yUDLqJQNf@ep-quiet-surf-a-poert7a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

export const handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { hash, from_address, to_address, value, network, chain_id, wallet_address, status, block_number, explorer_url } = JSON.parse(event.body);

    const query = `
      INSERT INTO transactions (hash, from_address, to_address, value, network, chain_id, wallet_address, status, block_number, explorer_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (hash) DO NOTHING
      RETURNING *;
    `;

    const result = await pool.query(query, [
      hash, from_address, to_address, value || '0', network || 'unknown', 
      chain_id || '0', wallet_address, status || 'success', block_number || null, explorer_url || null
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: result.rows[0] })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
