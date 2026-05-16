// Script temporal para buscar IDs de ejercicios
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const exerciseNames = [
  'L-Sit',
  'Marcha en Sitio',
  'Marching in Place',
  'Mountain Climbers',
  'Escaladores',
  'Muscle-up',
  'Natación',
  'Swimming',
  'Pájaros',
  'Rear Delt Fly'
];

async function findIds() {
  console.log('Buscando IDs de ejercicios...\n');
  
  for (const name of exerciseNames) {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name')
      .ilike('name', `%${name}%`);
    
    if (error) {
      console.error(`Error buscando "${name}":`, error.message);
      continue;
    }
    
    if (data && data.length > 0) {
      console.log(`"${name}":`);
      data.forEach(ex => console.log(`  - ID: ${ex.id}, Nombre: ${ex.name}`));
      console.log('');
    } else {
      console.log(`"${name}": NO ENCONTRADO\n`);
    }
  }
}

findIds().catch(console.error);
