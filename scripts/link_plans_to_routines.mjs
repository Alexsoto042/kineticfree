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

async function linkPlansToRoutines() {
  console.log('Linking plans to routines...');
  try {
    // 1. Fetch routine IDs
    const { data: routines, error: routinesError } = await supabase
      .from('routines')
      .select('id, name')
      .in('name', ['Fuerza Total', 'Circuito Quema Grasa']);

    if (routinesError) throw routinesError;

    const fuerzaTotalId = routines.find((r) => r.name === 'Fuerza Total')?.id;
    const circuitoQuemaGrasaId = routines.find(
      (r) => r.name === 'Circuito Quema Grasa'
    )?.id;

    if (!fuerzaTotalId || !circuitoQuemaGrasaId) {
      console.error('Could not find routine IDs. Make sure routines exist.');
      return;
    }

    // 2. Update plans with routine IDs
    const updates = [];

    updates.push(
      supabase
        .from('plans')
        .update({ routine_id: fuerzaTotalId })
        .eq('name', 'Dieta de Definición Muscular')
    );

    updates.push(
      supabase
        .from('plans')
        .update({ routine_id: circuitoQuemaGrasaId })
        .eq('name', 'Plan de Alimentación para Pérdida de Grasa')
    );

    const results = await Promise.all(updates);

    results.forEach((result, index) => {
      if (result.error) {
        console.error(
          `Error updating plan ${index === 0 ? 'Dieta de Definición Muscular' : 'Plan de Alimentación para Pérdida de Grasa'}:`,
          result.error.message
        );
      } else {
        console.log(
          `Successfully linked plan ${index === 0 ? 'Dieta de Definición Muscular' : 'Plan de Alimentación para Pérdida de Grasa'}.`
        );
      }
    });

    console.log('Plan linking process finished.');
  } catch (e) {
    console.error('Error linking plans to routines:', e.message);
  }
}

linkPlansToRoutines();
