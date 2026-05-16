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

async function checkSchema() {
  console.log(
    'Checking for the `requires_machine` column in the `exercises` table...'
  );
  try {
    // Intentamos seleccionar solo la columna en cuestión de un registro.
    const { error } = await supabase
      .from('exercises')
      .select('requires_machine')
      .limit(1);

    if (error) {
      // Si hay un error, es probable que la columna no exista.
      console.error('🔴 Test Failed. The database returned an error:');
      console.error(`-> ${error.message}`);
      console.log(
        '\nConclusion: The `requires_machine` column does NOT exist. The first migration script needs to be run successfully.'
      );
    } else {
      console.log(
        '✅ Test Successful! The `requires_machine` column exists in your database.'
      );
    }
  } catch (e) {
    console.error('An unexpected script error occurred:', e.message);
  }
}

checkSchema();
