const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.hxfqcsjdtwwcfndxitgw:@Jatijr7168@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1",
});

const SKILLS = [
  // Programming & Tech
  { id: 'cmh1234567890001', name: "JavaScript", category: "Programming" },
  { id: 'cmh1234567890002', name: "Python", category: "Programming" },
  { id: 'cmh1234567890003', name: "Java", category: "Programming" },
  { id: 'cmh1234567890004', name: "React", category: "Web Development" },
  { id: 'cmh1234567890005', name: "Node.js", category: "Web Development" },
  { id: 'cmh1234567890006', name: "Next.js", category: "Web Development" },
  { id: 'cmh1234567890007', name: "SQL", category: "Database" },
  { id: 'cmh1234567890008', name: "MongoDB", category: "Database" },
  
  // Design
  { id: 'cmh1234567890009', name: "UI/UX Design", category: "Design" },
  { id: 'cmh1234567890010', name: "Graphic Design", category: "Design" },
  { id: 'cmh1234567890011', name: "Figma", category: "Design" },
  { id: 'cmh1234567890012', name: "Photoshop", category: "Design" },
  
  // Languages
  { id: 'cmh1234567890013', name: "English", category: "Languages" },
  { id: 'cmh1234567890014', name: "Japanese", category: "Languages" },
  { id: 'cmh1234567890015', name: "Mandarin", category: "Languages" },
  
  // Business & Marketing
  { id: 'cmh1234567890016', name: "Digital Marketing", category: "Business" },
  { id: 'cmh1234567890017', name: "SEO", category: "Business" },
  { id: 'cmh1234567890018', name: "Copywriting", category: "Business" }
];

async function main() {
  await client.connect();
  console.log("Connected to DB");
  
  for (const s of SKILLS) {
    try {
      await client.query(
        'INSERT INTO skills (id, name, category, created_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (name) DO NOTHING',
        [s.id, s.name, s.category]
      );
    } catch(e) {
      console.error(e.message);
    }
  }

  const res = await client.query('SELECT count(*) FROM skills');
  console.log("Skills count now:", res.rows[0].count);

  await client.end();
}

main().catch(console.error);
