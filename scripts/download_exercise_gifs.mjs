// Script para descargar GIFs de ejercicios desde ExerciseDB
// y subirlos a Supabase Storage

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeo de nombres en español a inglés para ExerciseDB
const exerciseMapping = {
  'Caminadora (Inclinación)': 'treadmill incline',
  'Swing con Kettlebell': 'kettlebell swing',
  'Estiramiento de Cuádriceps': 'quad stretch',
  'Estiramiento de Pecho': 'chest stretch',
  'Estiramientos Dinámicos': 'dynamic stretching',
  'Aperturas con Mancuernas': 'dumbbell fly',
  'Aperturas en Máquina (Chest Fly)': 'machine chest fly',
  'Curl de Bíceps en Máquina': 'machine bicep curl',
  'Curl Femoral (Leg Curl)': 'leg curl',
  'Elevación de Gemelos en Máquina': 'machine calf raise',
  'Elevaciones de Piernas Colgado': 'hanging leg raise',
  'Elevaciones Laterales con Mancuernas': 'dumbbell lateral raise',
  'Extensión de Cuádriceps (Leg Extension)': 'leg extension',
  'Face Pulls': 'face pull',
  'Hip Thrust': 'hip thrust',
  'Hip Thrust con Barra': 'barbell hip thrust',
  'Jalón al Pecho (Lat Pulldown)': 'lat pulldown',
  'Peso Muerto Rumano': 'romanian deadlift',
  'Plancha Lateral (Side Plank)': 'side plank',
  'Press de Banca (10x10)': 'bench press',
  'Press de Banca con Barra': 'barbell bench press',
  'Press de Hombros en Máquina': 'machine shoulder press',
  'Press Inclinado con Mancuernas': 'incline dumbbell press',
  'Pushdown de Tríceps en Polea': 'cable tricep pushdown',
  'Remo con Barra': 'barbell row',
  'Remo con Barra (10x10)': 'barbell row',
  'Remo con Mancuerna (Serrucho)': 'dumbbell row',
  'Remo en Barra T': 't-bar row',
  'Remo Sentado en Cable': 'seated cable row',
  'Zancada Búlgara': 'bulgarian split squat',
};

// Función para buscar ejercicio en ExerciseDB
async function searchExercise(exerciseName) {
  const searchTerm = exerciseMapping[exerciseName] || exerciseName;
  
  try {
    const response = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(searchTerm)}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      }
    );
    
    const data = await response.json();
    return data[0]?.gifUrl || null;
  } catch (error) {
    console.error(`Error buscando ${exerciseName}:`, error.message);
    return null;
  }
}

// Función para descargar GIF
async function downloadGif(url, exerciseId) {
  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    
    const tempPath = path.join('/tmp', `exercise_${exerciseId}.gif`);
    await fs.writeFile(tempPath, buffer);
    
    return tempPath;
  } catch (error) {
    console.error(`Error descargando GIF:`, error.message);
    return null;
  }
}

// Función para subir a Supabase Storage
async function uploadToSupabase(filePath, exerciseId) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const fileName = `exercise_${exerciseId}.gif`;
    
    const { data, error } = await supabase.storage
      .from('exercises')
      .upload(`gifs/${fileName}`, fileBuffer, {
        contentType: 'image/gif',
        upsert: true
      });
    
    if (error) throw error;
    
    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('exercises')
      .getPublicUrl(`gifs/${fileName}`);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`Error subiendo a Supabase:`, error.message);
    return null;
  }
}

// Función para actualizar base de datos
async function updateExerciseGif(exerciseId, gifUrl) {
  try {
    const { error } = await supabase
      .from('exercises')
      .update({ gif_url: gifUrl })
      .eq('id', exerciseId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error actualizando ejercicio ${exerciseId}:`, error.message);
    return false;
  }
}

// Lista de ejercicios faltantes (de tu captura)
const missingExercises = [
  { id: 35, name: 'Caminadora (Inclinación)', category: 'cardio' },
  { id: 27, name: 'Swing con Kettlebell', category: 'cardio' },
  { id: 19, name: 'Estiramiento de Cuádriceps', category: 'flexibility' },
  { id: 20, name: 'Estiramiento de Pecho', category: 'flexibility' },
  { id: 36, name: 'Estiramientos Dinámicos', category: 'flexibility' },
  { id: 73, name: 'Aperturas con Mancuernas', category: 'strength' },
  { id: 65, name: 'Aperturas en Máquina (Chest Fly)', category: 'strength' },
  { id: 69, name: 'Curl de Bíceps en Máquina', category: 'strength' },
  { id: 67, name: 'Curl Femoral (Leg Curl)', category: 'strength' },
  { id: 71, name: 'Elevación de Gemelos en Máquina', category: 'strength' },
  { id: 78, name: 'Elevaciones de Piernas Colgado', category: 'strength' },
  { id: 74, name: 'Elevaciones Laterales con Mancuernas', category: 'strength' },
  { id: 66, name: 'Extensión de Cuádriceps (Leg Extension)', category: 'strength' },
  { id: 79, name: 'Face Pulls', category: 'strength' },
  { id: 80, name: 'Hip Thrust', category: 'strength' },
  { id: 25, name: 'Hip Thrust con Barra', category: 'strength' },
  { id: 26, name: 'Jalón al Pecho (Lat Pulldown)', category: 'strength' },
  { id: 76, name: 'Peso Muerto Rumano', category: 'strength' },
  { id: 22, name: 'Plancha Lateral (Side Plank)', category: 'strength' },
  { id: 37, name: 'Press de Banca (10x10)', category: 'strength' },
  { id: 23, name: 'Press de Banca con Barra', category: 'strength' },
  { id: 68, name: 'Press de Hombros en Máquina', category: 'strength' },
  { id: 72, name: 'Press Inclinado con Mancuernas', category: 'strength' },
  { id: 70, name: 'Pushdown de Tríceps en Polea', category: 'strength' },
  { id: 33, name: 'Remo con Barra', category: 'strength' },
  { id: 38, name: 'Remo con Barra (10x10)', category: 'strength' },
  { id: 75, name: 'Remo con Mancuerna (Serrucho)', category: 'strength' },
  { id: 81, name: 'Remo en Barra T', category: 'strength' },
  { id: 64, name: 'Remo Sentado en Cable', category: 'strength' },
  { id: 77, name: 'Zancada Búlgara', category: 'strength' },
];

// Función principal
async function processExercises() {
  console.log('🚀 Iniciando descarga de GIFs...\n');
  
  let successCount = 0;
  let failCount = 0;
  const results = [];
  
  for (const exercise of missingExercises) {
    console.log(`📥 Procesando: ${exercise.name} (ID: ${exercise.id})`);
    
    // 1. Buscar en ExerciseDB
    const gifUrl = await searchExercise(exercise.name);
    
    if (!gifUrl) {
      console.log(`   ❌ No encontrado en ExerciseDB\n`);
      failCount++;
      results.push({ ...exercise, status: 'not_found' });
      continue;
    }
    
    console.log(`   ✅ Encontrado: ${gifUrl}`);
    
    // 2. Descargar GIF
    const localPath = await downloadGif(gifUrl, exercise.id);
    
    if (!localPath) {
      console.log(`   ❌ Error descargando\n`);
      failCount++;
      results.push({ ...exercise, status: 'download_failed' });
      continue;
    }
    
    console.log(`   ✅ Descargado localmente`);
    
    // 3. Subir a Supabase
    const supabaseUrl = await uploadToSupabase(localPath, exercise.id);
    
    if (!supabaseUrl) {
      console.log(`   ❌ Error subiendo a Supabase\n`);
      failCount++;
      results.push({ ...exercise, status: 'upload_failed' });
      continue;
    }
    
    console.log(`   ✅ Subido a Supabase: ${supabaseUrl}`);
    
    // 4. Actualizar base de datos
    const updated = await updateExerciseGif(exercise.id, supabaseUrl);
    
    if (!updated) {
      console.log(`   ❌ Error actualizando DB\n`);
      failCount++;
      results.push({ ...exercise, status: 'db_update_failed', url: supabaseUrl });
      continue;
    }
    
    console.log(`   ✅ Base de datos actualizada\n`);
    successCount++;
    results.push({ ...exercise, status: 'success', url: supabaseUrl });
    
    // Limpiar archivo temporal
    await fs.unlink(localPath).catch(() => {});
    
    // Esperar 1 segundo entre requests (rate limiting)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Exitosos: ${successCount}/${missingExercises.length}`);
  console.log(`❌ Fallidos: ${failCount}/${missingExercises.length}`);
  console.log('='.repeat(60) + '\n');
  
  // Guardar reporte
  const report = {
    timestamp: new Date().toISOString(),
    total: missingExercises.length,
    success: successCount,
    failed: failCount,
    results
  };
  
  await fs.writeFile(
    'exercise_gifs_report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('📄 Reporte guardado en: exercise_gifs_report.json\n');
  
  // Mostrar ejercicios fallidos
  const failed = results.filter(r => r.status !== 'success');
  if (failed.length > 0) {
    console.log('⚠️  Ejercicios que requieren atención manual:');
    failed.forEach(ex => {
      console.log(`   - ${ex.name} (ID: ${ex.id}) - ${ex.status}`);
    });
  }
}

// Ejecutar
processExercises()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
