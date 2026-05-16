// Script para procesar videos de public/videos faltantes
// Convierte a WebM sin audio y sube a Supabase

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.log('Asegúrate de tener un archivo .env con:');
  console.log('VITE_SUPABASE_URL=tu_url');
  console.log('VITE_SUPABASE_ANON_KEY=tu_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const VIDEOS_DIR = path.join(__dirname, '..', 'public', 'videos faltantes ');
const OUTPUT_DIR = path.join(__dirname, 'converted_videos');

// Mapeo de nombres de archivo a IDs de ejercicios
const exerciseNameToId = {
  'Caminadora (Inclinación)': 35,
  'Swing con Kettlebell': 27,
  'Estiramiento de Cuádriceps': 19,
  'Estiramiento de Pecho': 20,
  'stiramientos Dinámicos': 36, // Nota: falta 'E' al inicio
  'Aperturas con Mancuernas': 73,
  'Aperturas en Máquina (Chest Fly)': 65,
  'Curl de Bíceps en Máquina': 69,
  'Curl Femoral (Leg Curl)': 67,
  'Elevación de Gemelos en Máquina': 71,
  'Elevaciones de Piernas Colgado': 78,
  'Elevaciones Laterales con Mancuernas': 74,
  ' Extensión de Cuádriceps (Leg Extension)': 66, // Nota: espacio al inicio
  'Face Pulls': 79,
  'Hip Thrust': 80,
  'Hip Thrust con Barra': 25,
  'Jalón al Pecho (Lat Pulldown)': 26,
  'Peso Muerto Rumano': 76,
  'Plancha Lateral (Side Plank)': 22,
  'Press de Banca (10x10)': 37,
  'Press de Banca con Barra': 23,
  'Press de Hombros en Máquina': 68,
  'Press Inclinado con Mancuernas': 72,
  'Pushdown de Tríceps en Polea': 70,
  'Remo con Barra': 33,
  'Remo con Barra (10x10)': 38,
  'Remo con Mancuerna (Serrucho)': 75,
  'Remo Sentado en Cable': 64,
  'ancada Búlgara': 77, // Nota: falta 'Z' al inicio
};

// Verificar FFmpeg
async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch (error) {
    console.error('❌ FFmpeg no está instalado');
    console.log('\n💡 Instala FFmpeg:');
    console.log('   macOS: brew install ffmpeg\n');
    return false;
  }
}

// Obtener ID del nombre de archivo
function getExerciseId(filename) {
  // Remover extensión
  const nameWithoutExt = filename.replace(/\.mp4$/i, '');
  
  // Buscar en el mapeo
  const id = exerciseNameToId[nameWithoutExt];
  
  if (!id) {
    console.warn(`⚠️  No se encontró ID para: "${nameWithoutExt}"`);
  }
  
  return id;
}

// Convertir a WebM sin audio
async function convertToWebM(inputPath, outputPath, exerciseName) {
  try {
    console.log(`   🎬 Convirtiendo a WebM sin audio...`);
    
    // Comando FFmpeg optimizado
    const command = `ffmpeg -i "${inputPath}" -an -c:v libvpx-vp9 -b:v 500k -crf 30 -vf "scale=600:600:force_original_aspect_ratio=decrease,pad=600:600:(ow-iw)/2:(oh-ih)/2" "${outputPath}" -y`;
    
    await execAsync(command);
    
    const stats = await fs.stat(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`   ✅ Convertido: ${sizeMB} MB (sin audio)`);
    
    return outputPath;
  } catch (error) {
    console.error(`   ❌ Error en conversión:`, error.message);
    return null;
  }
}

// Subir a Supabase
async function uploadToSupabase(filePath, exerciseId) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const fileName = `exercise_${exerciseId}.webm`;
    
    console.log(`   📤 Subiendo a Supabase Storage...`);
    
    const { data, error } = await supabase.storage
      .from('exercise_images')
      .upload(`gifs/${fileName}`, fileBuffer, {
        contentType: 'video/webm',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from('exercise_images')
      .getPublicUrl(`gifs/${fileName}`);
    
    console.log(`   ✅ URL: ${publicUrlData.publicUrl}`);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`   ❌ Error subiendo:`, error.message);
    return null;
  }
}

// Actualizar base de datos
async function updateDatabase(exerciseId, gifUrl) {
  try {
    console.log(`   💾 Actualizando base de datos...`);
    
    const { error } = await supabase
      .from('exercises')
      .update({ gif_url: gifUrl })
      .eq('id', exerciseId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`   ❌ Error actualizando DB:`, error.message);
    return false;
  }
}

// Proceso principal
async function processVideos() {
  console.log('🚀 Procesando videos de public/videos faltantes...\n');
  
  // Verificar FFmpeg
  if (!await checkFFmpeg()) return;
  
  // Crear directorio de salida
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  // Leer archivos
  const files = await fs.readdir(VIDEOS_DIR);
  const videoFiles = files.filter(f => f.endsWith('.mp4'));
  
  console.log(`📁 Encontrados ${videoFiles.length} videos\n`);
  
  let successCount = 0;
  let failCount = 0;
  const results = [];
  
  for (const filename of videoFiles) {
    const exerciseName = filename.replace(/\.mp4$/i, '');
    const exerciseId = getExerciseId(filename);
    
    if (!exerciseId) {
      console.log(`⚠️  Saltando: ${filename} (ID no encontrado)\n`);
      failCount++;
      results.push({ filename, status: 'id_not_found' });
      continue;
    }
    
    console.log(`📥 Procesando: ${exerciseName} (ID: ${exerciseId})`);
    
    const inputPath = path.join(VIDEOS_DIR, filename);
    const outputFilename = `${exerciseId}_${exerciseName}.webm`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);
    
    // Convertir
    const convertedPath = await convertToWebM(inputPath, outputPath, exerciseName);
    
    if (!convertedPath) {
      console.log(`   ❌ Falló conversión\n`);
      failCount++;
      results.push({ filename, exerciseId, status: 'conversion_failed' });
      continue;
    }
    
    // Subir
    const gifUrl = await uploadToSupabase(convertedPath, exerciseId);
    
    if (!gifUrl) {
      console.log(`   ❌ Falló subida\n`);
      failCount++;
      results.push({ filename, exerciseId, status: 'upload_failed' });
      continue;
    }
    
    // Actualizar DB
    const updated = await updateDatabase(exerciseId, gifUrl);
    
    if (!updated) {
      console.log(`   ❌ Falló actualización DB\n`);
      failCount++;
      results.push({ filename, exerciseId, status: 'db_failed', url: gifUrl });
      continue;
    }
    
    console.log(`   ✅ Completado\n`);
    successCount++;
    results.push({ 
      filename, 
      exerciseId, 
      exerciseName,
      status: 'success',
      url: gifUrl 
    });
  }
  
  // Resumen
  console.log('='.repeat(60));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Exitosos: ${successCount}/${videoFiles.length}`);
  console.log(`❌ Fallidos: ${failCount}/${videoFiles.length}`);
  console.log('='.repeat(60) + '\n');
  
  // Guardar reporte
  const report = {
    timestamp: new Date().toISOString(),
    total: videoFiles.length,
    success: successCount,
    failed: failCount,
    results
  };
  
  await fs.writeFile(
    path.join(__dirname, 'videos_report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📄 Reporte: scripts/videos_report.json');
  console.log(`📁 Videos convertidos: ${OUTPUT_DIR}\n`);
  
  // Mostrar exitosos
  const successful = results.filter(r => r.status === 'success');
  if (successful.length > 0) {
    console.log('✅ Ejercicios actualizados:');
    successful.forEach(ex => {
      console.log(`   - ${ex.exerciseName} (ID: ${ex.exerciseId})`);
    });
    console.log('');
  }
  
  // Mostrar fallidos
  const failed = results.filter(r => r.status !== 'success');
  if (failed.length > 0) {
    console.log('⚠️  Requieren atención:');
    failed.forEach(ex => {
      console.log(`   - ${ex.filename} - ${ex.status}`);
    });
  }
}

// Ejecutar
processVideos()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
