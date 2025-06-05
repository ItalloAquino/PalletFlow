import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'admin123',
  host: 'localhost',
  port: 5432,
  database: 'postgres' // Conecta ao banco padrão primeiro
});

async function createDatabase() {
  try {
    // Tenta criar o banco de dados
    await pool.query('CREATE DATABASE palletflow');
    console.log('✅ Banco de dados criado com sucesso!');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('ℹ️ Banco de dados já existe.');
    } else {
      console.error('❌ Erro ao criar banco de dados:', err);
    }
  } finally {
    await pool.end();
  }
}

createDatabase(); 