import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

console.log('Running Supabase connection test...');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '🔴 Error: Supabase URL or Service Key not found in .env file.'
  );
  process.exit(1);
}

if (supabaseServiceKey.includes('your-service-role-key')) {
  console.error(
    '🔴 Error: You are using the placeholder service key. Please update it in your .env file.'
  );
  process.exit(1);
}

console.log('Credentials found. Attempting to connect to Supabase...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('🔴 Connection failed!');
      console.error('Error details:', error.message);
      if (error.message === 'Invalid Compact JWS') {
        console.log(
          "\nHint: This error almost always means your SUPABASE_SERVICE_KEY is incorrect. Please double-check that you have copied the correct 'service_role' key from your Supabase dashboard (Project Settings > API)."
        );
      }
      process.exit(1);
    }

    console.log(
      '✅ Connection successful! Supabase client is able to authenticate and list buckets.'
    );
    console.log('This confirms your credentials in the .env file are correct.');
    console.log('Number of buckets found:', data.length);
    if (data.length > 0) {
      const bucketNames = data.map((bucket) => bucket.name);
      console.log('Found the following buckets:', bucketNames);
    }
  } catch (e) {
    console.error(
      '🔴 An unexpected error occurred during the test:',
      e.message
    );
    process.exit(1);
  }
}

testConnection();
