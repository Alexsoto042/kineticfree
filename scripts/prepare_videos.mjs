// Script para preparar videos faltantes para conversión
// Lee los videos de "public/videos faltantes/" y los copia a "scripts/videos_to_convert/"
// con el formato correcto: ID_nombre.mp4

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SOURCE_DIR = path.join(__dirname, 'videos_to_convert');
const TARGET_DIR = path.join(__dirname, 'videos_ready');

// Buscar ID del ejercicio por nombre
async function findExerciseId(videoName) {
  // Limpiar nombre del archivo
  const cleanName = videoName
    .replace(/\.mp4$/i, '')
    .trim();
  
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name')
      .ilike('name', `%${cleanName}%`)
      .limit(5);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Si hay coincidencia exacta
      const exactMatch = data.find(ex => ex.name === cleanName);
      if (exactMatch) return exactMatch;
      
      // Si no, retornar la primera coincidencia
      return data[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error buscando ejercicio "${cleanName}":`, error.message);
    return null;
  }
}

async function prepareVideos() {
  console.log('🚀 Preparando videos para conversión...\\n');
  
  // Crear directorio de destino
  await fs.mkdir(TARGET_DIR, { recursive: true });
  
  // Leer videos
  const files = await fs.readdir(SOURCE_DIR);
  const videoFiles = files.filter(f => /\.mp4$/i.test(f));
  
  console.log(`📁 Encontrados ${videoFiles.length} videos\\n`);
  
  const results = [];
  
  for (const filename of videoFiles) {
    console.log(`📥 Procesando: ${filename}`);
    
    const exercise = await findExerciseId(filename);
    
    if (!exercise) {
      console.log(`   ⚠️  No se encontró ejercicio en BD`);
      console.log(`   💡 Revisa manualmente: ${filename}\\n`);
      results.push({ filename, status: 'not_found' });
      continue;
    }
    
    console.log(`   ✅ Encontrado: ${exercise.name} (ID: ${exercise.id})`);
    
    // Copiar con nuevo nombre
    const sourcePath = path.join(SOURCE_DIR, filename);
    const targetFilename = `${exercise.id}_${filename}`;
    const targetPath = path.join(TARGET_DIR, targetFilename);
    
    await fs.copyFile(sourcePath, targetPath);
    
    console.log(`   📋 Copiado como: ${targetFilename}\\n`);
    
    results.push({
      filename,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      newFilename: targetFilename,
      status: 'ready'
    });
  }
  
  // Resumen
  console.log('='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  
  const ready = results.filter(r => r.status === 'ready');
  const notFound = results.filter(r => r.status === 'not_found');
  
  console.log(`✅ Listos para conversión: ${ready.length}`);
  console.log(`⚠️  No encontrados: ${notFound.length}`);
  console.log('='.repeat(60) + '\\n');
  
  if (ready.length > 0) {
    console.log('✅ Videos preparados:');
    ready.forEach(r => {
      console.log(`   - ${r.exerciseName} (ID: ${r.exerciseId})`);
    });
    console.log('');
  }
  
  if (notFound.length > 0) {
    console.log('⚠️  Videos que requieren atención manual:');
    notFound.forEach(r => {
      console.log(`   - ${r.filename}`);
    });
    console.log('');
  }
  
  console.log('\\n📂 Ubicación: scripts/videos_to_convert/');
  console.log('\\n💡 Siguiente paso: ejecuta `node scripts/convert_grok_videos.mjs`');
}

prepareVideos()
  .then(() => {
    console.log('\\n✅ Preparación completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
