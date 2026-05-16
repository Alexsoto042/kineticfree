import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase credentials not found in .env file');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getNames() {
  console.log('Fetching exercise names from the database...');
  try {
    const { data, error } = await supabase.from('exercises').select('name');

    if (error) throw error;

    if (data && data.length > 0) {
      const names = data.map((ex) => ex.name);
      console.log('Found the following exercise names:');
      console.log(names);
    } else {
      console.log('No exercises found in the database.');
    }
  } catch (error) {
    console.error('Error fetching names:', error.message);
  }
}

getNames();
