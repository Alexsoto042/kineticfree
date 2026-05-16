// Script para subir GIFs personalizados a Supabase
// Los GIFs deben estar en la carpeta: scripts/gifs_to_upload/

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Directorio donde colocarás tus GIFs
const GIFS_DIR = path.join(__dirname, 'gifs_to_upload');

// Mapeo de nombres de archivo a IDs de ejercicios
// Formato del archivo: "35_caminadora.gif" o "35.gif"
// El número antes del guión bajo es el ID del ejercicio

async function getExerciseIdFromFilename(filename) {
  // Extraer ID del nombre del archivo
  // Soporta formatos: "35_nombre.gif", "35.gif", "35_nombre.webm"
  const match = filename.match(/^(\d+)[_.].*\.(gif|webm|mp4)$/i);
  
  if (!match) {
    console.warn(`⚠️  Nombre de archivo inválido: ${filename}`);
    console.warn(`   Formato esperado: "ID_nombre.gif" o "ID.gif"`);
    return null;
  }
  
  return parseInt(match[1]);
}

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

async function uploadGifToSupabase(filePath, exerciseId) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const fileName = `exercise_${exerciseId}${ext}`;
    
    // Determinar content type
    const contentType = ext === '.gif' ? 'image/gif' : 
                       ext === '.webm' ? 'video/webm' : 
                       'video/mp4';
    
    console.log(`   📤 Subiendo a Supabase Storage...`);
    
    const { data, error } = await supabase.storage
      .from('exercises')
      .upload(`gifs/${fileName}`, fileBuffer, {
        contentType,
        upsert: true // Sobrescribir si ya existe
      });
    
    if (error) throw error;
    
    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('exercises')
      .getPublicUrl(`gifs/${fileName}`);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`   ❌ Error subiendo a Supabase:`, error.message);
    return null;
  }
}

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

async function processGifs() {
  console.log('🚀 Iniciando carga de GIFs personalizados...\n');
  
  // Verificar que existe el directorio
  try {
    await fs.access(GIFS_DIR);
  } catch (error) {
    console.error(`❌ Error: El directorio ${GIFS_DIR} no existe`);
    console.log('\n💡 Crea la carpeta y coloca tus GIFs ahí:');
    console.log(`   mkdir -p ${GIFS_DIR}`);
    console.log('\n📝 Nombra tus archivos así:');
    console.log('   35_caminadora.gif');
    console.log('   27_kettlebell.webm');
    console.log('   19.gif');
    return;
  }
  
  // Leer archivos del directorio
  const files = await fs.readdir(GIFS_DIR);
  const gifFiles = files.filter(f => 
    /\.(gif|webm|mp4)$/i.test(f)
  );
  
  if (gifFiles.length === 0) {
    console.log('⚠️  No se encontraron archivos GIF/WebM/MP4 en el directorio');
    console.log(`   Directorio: ${GIFS_DIR}`);
    return;
  }
  
  console.log(`📁 Encontrados ${gifFiles.length} archivos\n`);
  
  let successCount = 0;
  let failCount = 0;
  const results = [];
  
  for (const filename of gifFiles) {
    const exerciseId = await getExerciseIdFromFilename(filename);
    
    if (!exerciseId) {
      failCount++;
      results.push({ filename, status: 'invalid_filename' });
      continue;
    }
    
    const exerciseName = await getExerciseName(exerciseId);
    console.log(`📥 Procesando: ${exerciseName} (ID: ${exerciseId})`);
    console.log(`   📄 Archivo: ${filename}`);
    
    const filePath = path.join(GIFS_DIR, filename);
    
    // Subir a Supabase
    const gifUrl = await uploadGifToSupabase(filePath, exerciseId);
    
    if (!gifUrl) {
      console.log(`   ❌ Falló la subida\n`);
      failCount++;
      results.push({ 
        filename, 
        exerciseId, 
        exerciseName, 
        status: 'upload_failed' 
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
    
    console.log(`   ✅ Base de datos actualizada\n`);
    successCount++;
    results.push({ 
      filename, 
      exerciseId, 
      exerciseName, 
      status: 'success',
      url: gifUrl 
    });
  }
  
  // Resumen final
  console.log('='.repeat(60));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Exitosos: ${successCount}/${gifFiles.length}`);
  console.log(`❌ Fallidos: ${failCount}/${gifFiles.length}`);
  console.log('='.repeat(60) + '\n');
  
  // Guardar reporte
  const report = {
    timestamp: new Date().toISOString(),
    total: gifFiles.length,
    success: successCount,
    failed: failCount,
    results
  };
  
  await fs.writeFile(
    path.join(__dirname, 'upload_report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📄 Reporte guardado en: scripts/upload_report.json\n');
  
  // Mostrar archivos exitosos
  const successful = results.filter(r => r.status === 'success');
  if (successful.length > 0) {
    console.log('✅ Ejercicios actualizados correctamente:');
    successful.forEach(ex => {
      console.log(`   - ${ex.exerciseName} (ID: ${ex.exerciseId})`);
    });
    console.log('');
  }
  
  // Mostrar archivos fallidos
  const failed = results.filter(r => r.status !== 'success');
  if (failed.length > 0) {
    console.log('⚠️  Archivos que requieren atención:');
    failed.forEach(ex => {
      console.log(`   - ${ex.filename} - ${ex.status}`);
    });
  }
}

// Ejecutar
processGifs()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
