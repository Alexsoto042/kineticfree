import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno desde el archivo .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyVideos() {
  console.log('🔍 Verificando videos en Supabase...\n');

  // Leer el reporte de conversión
  const report = JSON.parse(fs.readFileSync('conversion_report.json', 'utf-8'));
  
  const successfulUploads = report.results.filter(r => r.status === 'success');
  
  console.log(`📊 Total de videos exitosos en el reporte: ${successfulUploads.length}\n`);

  let verified = 0;
  let missing = 0;
  const missingVideos = [];

  for (const video of successfulUploads) {
    // Verificar que el ejercicio existe en la BD
    const { data: exercise, error } = await supabase
      .from('exercises')
      .select('id, name, gif_url')
      .eq('id', video.exerciseId)
      .single();

    if (error || !exercise) {
      console.log(`❌ Ejercicio ${video.exerciseId} no encontrado en la BD`);
      missing++;
      missingVideos.push(video);
      continue;
    }

    if (exercise.gif_url && exercise.gif_url.includes('exercise_' + video.exerciseId)) {
      console.log(`✅ ${video.exerciseId}: ${exercise.name}`);
      verified++;
    } else {
      console.log(`⚠️  ${video.exerciseId}: ${exercise.name} - URL no coincide`);
      console.log(`   Esperado: exercise_${video.exerciseId}.webm`);
      console.log(`   Actual: ${exercise.gif_url || 'null'}`);
      missing++;
      missingVideos.push(video);
    }
  }

  console.log(`\n📈 Resumen:`);
  console.log(`   ✅ Verificados: ${verified}`);
  console.log(`   ❌ Faltantes/Incorrectos: ${missing}`);

  if (missingVideos.length > 0) {
    console.log(`\n⚠️  Videos con problemas:`);
    missingVideos.forEach(v => {
      console.log(`   - ID ${v.exerciseId}: ${v.exerciseName}`);
    });
  }

  return { verified, missing, missingVideos };
}

verifyVideos()
  .then(result => {
    if (result.missing === 0) {
      console.log('\n🎉 ¡Todos los videos están correctamente verificados!');
    } else {
      console.log(`\n⚠️  Hay ${result.missing} videos con problemas que requieren atención.`);
    }
  })
  .catch(error => {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  });
