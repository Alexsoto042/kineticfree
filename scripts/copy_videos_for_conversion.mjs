// Script para copiar videos de public/videos faltantes a videos_to_convert
// con el formato correcto: ID_nombre.mp4

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '..', 'public', 'videos faltantes ');
const TARGET_DIR = path.join(__dirname, 'videos_to_convert');

// Mapeo de nombres de archivo a IDs de ejercicios
const videoMapping = {
  'L-Sit.mp4': 198,
  'Marcha en Sitio (Marching in Place).mp4': 180,
  'Mountain Climbers (Escaladores).mp4': 159,
  'Muscle-up.mp4': 197,
  'Natación (Swimming).mp4': 177,
  'Pájaros (Rear Delt Fly).mp4': 144
};

async function copyVideos() {
  console.log('📋 Copiando videos para conversión...\n');
  
  // Crear directorio de destino
  await fs.mkdir(TARGET_DIR, { recursive: true });
  
  let copiedCount = 0;
  
  for (const [filename, exerciseId] of Object.entries(videoMapping)) {
    const sourcePath = path.join(SOURCE_DIR, filename);
    const targetFilename = `${exerciseId}_${filename}`;
    const targetPath = path.join(TARGET_DIR, targetFilename);
    
    try {
      // Verificar que el archivo fuente existe
      await fs.access(sourcePath);
      
      // Copiar archivo
      await fs.copyFile(sourcePath, targetPath);
      
      console.log(`✅ Copiado: ${filename}`);
      console.log(`   → ${targetFilename}\n`);
      
      copiedCount++;
    } catch (error) {
      console.error(`❌ Error copiando ${filename}:`, error.message);
    }
  }
  
  console.log('='.repeat(60));
  console.log(`✅ ${copiedCount}/${Object.keys(videoMapping).length} videos copiados`);
  console.log('='.repeat(60));
  console.log(`\n📁 Ubicación: ${TARGET_DIR}`);
  console.log('\n💡 Siguiente paso: node scripts/convert_grok_videos.mjs');
}

copyVideos().catch(console.error);
