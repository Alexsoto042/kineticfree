// Script para convertir videos de Grok a WebM sin audio y subirlos a Supabase
// Coloca tus videos en: scripts/videos_to_convert/

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const VIDEOS_DIR = path.join(__dirname, 'videos_to_convert');
const OUTPUT_DIR = path.join(__dirname, 'converted_webm');

// Verificar que FFmpeg está instalado
async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch (error) {
    console.error('❌ FFmpeg no está instalado');
    console.log('\n💡 Instala FFmpeg:');
    console.log('   macOS: brew install ffmpeg');
    console.log('   Windows: choco install ffmpeg');
    console.log('   Linux: sudo apt install ffmpeg\n');
    return false;
  }
}

// Extraer ID del nombre de archivo
function getExerciseIdFromFilename(filename) {
  const match = filename.match(/^(\d+)[_.].*\.(mp4|mov|avi|webm)$/i);
  if (!match) {
    console.warn(`⚠️  Nombre de archivo inválido: ${filename}`);
    console.warn(`   Formato esperado: "ID_nombre.mp4" o "ID.mp4"`);
    return null;
  }
  return parseInt(match[1]);
}

// Obtener nombre del ejercicio
async function getExerciseName(exerciseId) {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('name')
      .eq('id', exerciseId)
      .single();
    
    if (error) throw error;
    return data?.name || 'Desconocido';
  } catch (error) {
    return 'Desconocido';
  }
}

// Convertir video a WebM sin audio
async function convertToWebM(inputPath, outputPath) {
  try {
    console.log(`   🎬 Convirtiendo a WebM sin audio...`);
    
    // FFmpeg command:
    // -i: input file
    // -an: remove audio
    // -c:v libvpx-vp9: use VP9 codec (mejor compresión)
    // -b:v 500k: bitrate de 500kbps (buena calidad, tamaño pequeño)
    // -crf 30: calidad (0-63, menor = mejor calidad)
    // -vf scale=600:600: escalar a 600x600 (ajusta según necesites)
    const command = `ffmpeg -i "${inputPath}" -an -c:v libvpx-vp9 -b:v 500k -crf 30 -vf "scale=600:600:force_original_aspect_ratio=decrease,pad=600:600:(ow-iw)/2:(oh-ih)/2" "${outputPath}" -y`;
    
    await execAsync(command);
    
    // Verificar tamaño del archivo
    const stats = await fs.stat(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`   ✅ Convertido: ${sizeMB} MB`);
    
    if (stats.size > 2 * 1024 * 1024) {
      console.log(`   ⚠️  Archivo grande (${sizeMB} MB), considera reducir calidad`);
    }
    
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
      .upload(`${fileName}`, fileBuffer, {
        contentType: 'video/webm',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from('exercise_images')
      .getPublicUrl(`${fileName}`);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`   ❌ Error subiendo:`, error.message);
    return null;
  }
}

// Actualizar base de datos
async function updateExerciseInDatabase(exerciseId, gifUrl) {
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
  console.log('🚀 Iniciando conversión de videos de Grok...\n');
  
  // Verificar FFmpeg
  const hasFFmpeg = await checkFFmpeg();
  if (!hasFFmpeg) {
    return;
  }
  
  // Crear directorios si no existen
  try {
    await fs.mkdir(VIDEOS_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creando directorios:', error);
    return;
  }
  
  // Leer archivos
  const files = await fs.readdir(VIDEOS_DIR);
  const videoFiles = files.filter(f => 
    /\.(mp4|mov|avi|webm)$/i.test(f)
  );
  
  if (videoFiles.length === 0) {
    console.log('⚠️  No se encontraron videos en el directorio');
    console.log(`   Directorio: ${VIDEOS_DIR}`);
    console.log('\n💡 Coloca tus videos de Grok ahí con el formato:');
    console.log('   35_caminadora.mp4');
    console.log('   27_kettlebell.mov');
    return;
  }
  
  console.log(`📁 Encontrados ${videoFiles.length} videos\n`);
  
  let successCount = 0;
  let failCount = 0;
  const results = [];
  
  for (const filename of videoFiles) {
    const exerciseId = getExerciseIdFromFilename(filename);
    
    if (!exerciseId) {
      failCount++;
      results.push({ filename, status: 'invalid_filename' });
      continue;
    }
    
    const exerciseName = await getExerciseName(exerciseId);
    console.log(`📥 Procesando: ${exerciseName} (ID: ${exerciseId})`);
    console.log(`   📄 Archivo: ${filename}`);
    
    const inputPath = path.join(VIDEOS_DIR, filename);
    const outputFilename = `${exerciseId}_converted.webm`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);
    
    // Convertir a WebM sin audio
    const convertedPath = await convertToWebM(inputPath, outputPath);
    
    if (!convertedPath) {
      console.log(`   ❌ Falló la conversión\n`);
      failCount++;
      results.push({ 
        filename, 
        exerciseId, 
        exerciseName, 
        status: 'conversion_failed' 
      });
      continue;
    }
    
    // Subir a Supabase
    const gifUrl = await uploadToSupabase(convertedPath, exerciseId);
    
    if (!gifUrl) {
      console.log(`   ❌ Falló la subida\n`);
      failCount++;
      results.push({ 
        filename, 
        exerciseId, 
        exerciseName, 
        status: 'upload_failed',
        localPath: convertedPath
      });
      continue;
    }
    
    console.log(`   ✅ Subido: ${gifUrl}`);
    
    // Actualizar base de datos
    const updated = await updateExerciseInDatabase(exerciseId, gifUrl);
    
    if (!updated) {
      console.log(`   ❌ Falló actualización de DB\n`);
      failCount++;
      results.push({ 
        filename, 
        exerciseId, 
        exerciseName, 
        status: 'db_update_failed',
        url: gifUrl 
      });
      continue;
    }
    
    console.log(`   ✅ Completado\n`);
    successCount++;
    results.push({ 
      filename, 
      exerciseId, 
      exerciseName, 
      status: 'success',
      url: gifUrl,
      localPath: convertedPath
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
    path.join(__dirname, 'conversion_report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📄 Reporte guardado en: scripts/conversion_report.json');
  console.log(`📁 Videos convertidos en: ${OUTPUT_DIR}\n`);
  
  // Mostrar exitosos
  const successful = results.filter(r => r.status === 'success');
  if (successful.length > 0) {
    console.log('✅ Ejercicios procesados correctamente:');
    successful.forEach(ex => {
      console.log(`   - ${ex.exerciseName} (ID: ${ex.exerciseId})`);
    });
    console.log('');
  }
  
  // Mostrar fallidos
  const failed = results.filter(r => r.status !== 'success');
  if (failed.length > 0) {
    console.log('⚠️  Videos que requieren atención:');
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
