import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3001;

// Pool de conexiones a Neon PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_6v5yUDLqJQNf@ep-quiet-surf-apoert7a-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

// Verificar conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a Neon PostgreSQL:', err.stack);
  } else {
    console.log('✅ Conectado a Neon PostgreSQL');
    release();
  }
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' });
});

// Guardar transacción
app.post('/api/transactions', async (req, res) => {
  const { hash, from_address, to_address, value, network, chain_id, wallet_address, status, block_number, explorer_url } = req.body;

  console.log('📥 Recibiendo transacción:', { hash, from_address, to_address, value, network });

  try {
    const query = `
      INSERT INTO transactions (hash, from_address, to_address, value, network, chain_id, wallet_address, status, block_number, explorer_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (hash) DO NOTHING
      RETURNING *;
    `;

    const result = await pool.query(query, [
      hash, 
      from_address.toLowerCase(), 
      to_address.toLowerCase(), 
      value || '0', 
      network || 'unknown', 
      chain_id || '0', 
      wallet_address.toLowerCase(), 
      status || 'success', 
      block_number || null, 
      explorer_url || null
    ]);

    if (result.rows.length > 0) {
      console.log('✅ Transacción guardada:', hash);
      res.json({ success: true, data: result.rows[0] });
    } else {
      console.log('⚠️ Transacción duplicada (ya existe):', hash);
      res.json({ success: true, message: 'Duplicate transaction, already exists' });
    }
  } catch (error) {
    console.error('❌ Error guardando transacción:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener transacciones
app.get('/api/transactions/:wallet_address', async (req, res) => {
  try {
    const { wallet_address } = req.params;
    const result = await pool.query(
      'SELECT * FROM transactions WHERE wallet_address = $1 ORDER BY created_at DESC',
      [wallet_address.toLowerCase()]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log('🗄️  Conectado a Neon PostgreSQL');
  console.log('📡 Endpoints disponibles:');
  console.log(`   - POST http://localhost:${PORT}/api/transactions`);
  console.log(`   - GET  http://localhost:${PORT}/api/transactions/:wallet_address`);
  console.log('🚀 ================================');
});
