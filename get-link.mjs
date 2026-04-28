import fs from 'fs';

const schema = fs.readFileSync('./supabase/schema.sql', 'utf8');
const encoded = encodeURIComponent(schema);
const url = `https://supabase.com/dashboard/project/faloknbaathdkmaeodxt/sql?new=${encoded}`;

console.log('Open this link in your browser:');
console.log(url);
console.log('\nOr copy the SQL from supabase/schema.sql and run it in the Supabase SQL Editor');