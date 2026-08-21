const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.hxfqcsjdtwwcfndxitgw:@Jatijr7168@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1",
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT count(*) FROM skills');
  console.log("Skills count:", res.rows[0].count);
  await client.end();
}

main().catch(console.error);
