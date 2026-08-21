const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.hxfqcsjdtwwcfndxitgw:@Jatijr7168@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1",
});

async function main() {
  await client.connect();
  console.log("Connected to DB");
  
  try {
    // Attempt to add the new enum value if it doesn't exist
    await client.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'USER'`);
    console.log("Added 'USER' to Role enum");
  } catch(e) {
    console.log("Maybe 'USER' already exists:", e.message);
  }

  const res = await client.query(`UPDATE users SET role = 'USER' WHERE role = 'STUDENT'`);
  console.log(`Updated ${res.rowCount} users from STUDENT to USER`);

  await client.end();
}

main().catch(console.error);
