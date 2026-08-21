const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.hxfqcsjdtwwcfndxitgw:@Jatijr7168@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1",
});

async function main() {
  await client.connect();
  console.log("Connected to DB");
  
  // 1. Create Budi (USER)
  const budiResult = await client.query(`
    INSERT INTO users (id, email, name, role, created_at, updated_at) 
    VALUES ('cuid_budi_123', 'budi@dummy.com', 'Budi Santoso', 'USER', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET role = 'USER', name = 'Budi Santoso'
    RETURNING id
  `);
  console.log("Budi created/updated:", budiResult.rows[0].id);

  // 2. Create Admin (ADMIN)
  const adminResult = await client.query(`
    INSERT INTO users (id, email, name, role, created_at, updated_at) 
    VALUES ('cuid_admin_123', 'admin@dummy.com', 'Super Admin', 'ADMIN', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', name = 'Super Admin'
    RETURNING id
  `);
  console.log("Admin created/updated:", adminResult.rows[0].id);

  await client.end();
}

main().catch(console.error);
