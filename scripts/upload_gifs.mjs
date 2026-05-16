import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Carga las variables de entorno desde .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // <-- USA LA SERVICE KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Supabase URL or Service Key is missing. Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are in your .env file.'
  );
}

// Inicializa el cliente con la service_role key para tener permisos de admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const gifsDirectory = path.resolve(process.cwd(), 'public/images');
const storageBucket = 'exercise_images';

const fileNameToExerciseNameMap = {
  'push-up.gif': 'Flexiones (Push-ups)',
  'squat.gif': 'Sentadillas (Squats)',
  'plank.gif': 'Plancha (Plank)',
  'jumping-jacks.gif': 'Saltos de Tijera (Jumping Jacks)',
  'lunges.gif': 'Zancadas (Lunges)',
  'calf-raises.gif': 'Elevación de Talones (Calf Raises)',
  'tricep-dips.gif': 'Fondos de Tríceps (Tricep Dips)',
  'bicep-curl.gif': 'Curl de Bíceps',
  'deadlift.gif': 'Peso Muerto (Deadlift)',
  'leg-press.gif': 'Prensa de Piernas (Leg Press)',
  'overhead-press.gif': 'Press Militar (Overhead Press)',
  'bent-over-row.gif': 'Remo inclinado (Bent Over Row)',
  'russian-twist.gif': 'Giro Ruso (Russian Twist)',
  'mountain-climbers.gif': 'Escaladores (Mountain Climbers)',
  'burpees.gif': 'Burpees',
  'hamstring-stretch.gif': 'Estiramiento de Isquiotibiales',
  'pull-up.gif': 'Dominadas (Pull-ups)',
};

// Función para obtener el nombre del ejercicio desde el mapa
const getExerciseName = (fileName) => {
  return fileNameToExerciseNameMap[fileName] || null;
};

async function uploadGifs() {
  try {
    console.log(`Checking for bucket '${storageBucket}'...`);
    // Validar que el bucket existe, ya que no lo crearemos desde aquí
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();
    if (bucketError) throw bucketError;
    if (!buckets.some((b) => b.name === storageBucket)) {
      throw new Error(
        `Bucket "${storageBucket}" not found. Please create it manually in the Supabase dashboard as a public bucket.`
      );
    }
    console.log('Bucket found. Proceeding with upload...');

    const files = await fs.readdir(gifsDirectory);
    const gifFiles = files.filter((file) => file.endsWith('.gif'));

    if (gifFiles.length === 0) {
      console.log('No GIF files found in public/images.');
      return;
    }

    console.log(`Found ${gifFiles.length} GIFs to upload.`);

    for (const fileName of gifFiles) {
      const filePath = path.join(gifsDirectory, fileName);
      const fileBuffer = await fs.readFile(filePath);
      const exerciseName = getExerciseName(fileName);

      if (!exerciseName) {
        console.log(`Skipping ${fileName}, no mapping found.`);
        continue;
      }

      console.log(`Uploading ${fileName} for exercise: "${exerciseName}"...`);

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(fileName, fileBuffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/gif',
        });

      if (uploadError) {
        console.error(`  -> Error uploading ${fileName}:`, uploadError.message);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(storageBucket).getPublicUrl(fileName);

      if (!publicUrl) {
        console.error(`  -> Could not get public URL for ${fileName}.`);
        continue;
      }

      console.log(`  -> Uploaded successfully. Public URL: ${publicUrl}`);

      const { data: updatedExercise, error: updateError } = await supabase
        .from('exercises')
        .update({ gif_url: publicUrl, image: publicUrl })
        .eq('name', exerciseName)
        .select();

      if (updateError) {
        console.error(
          `  -> DB Error for "${exerciseName}":`,
          updateError.message
        );
      } else if (updatedExercise && updatedExercise.length > 0) {
        console.log(`  -> DB updated for "${exerciseName}".`);
      } else {
        console.warn(
          `  -> No exercise found in DB with name "${exerciseName}".`
        );
      }
    }

    console.log('\nProcess completed!');
  } catch (error) {
    console.error('An unexpected error occurred:', error.message);
  }
}

uploadGifs();
