require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    database: 'betex_express',
    user: 'postgres',
    password: 'postgres'
  });
  
  await client.connect();
  
  const tables = ['shipments', 'expenses', 'scheduled_deliveries'];
  
  for (const table of tables) {
    console.log(`\n${table} columns:`);
    const result = await client.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name='${table}' ORDER BY ordinal_position`
    );
    result.rows.forEach(row => console.log(`  - ${row.column_name}`));
  }
  
  await client.end();
})();
