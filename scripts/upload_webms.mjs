import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use the SERVICE KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Supabase URL or Service Key is missing. Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are in your .env file.'
  );
}

// Initialize the client with the service_role key for admin permissions
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const webmsDirectory = path.resolve(process.cwd(), 'webm_output');
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
  'glute-bridge.gif': 'Puente de Glúteos (Glute Bridge)',
  'goblet-squat.gif': 'Sentadilla de Copa (Goblet Squat)',
  'high-knees.gif': 'Rodillas Arriba (High Knees)',
};

// Function to get the exercise name from the map
const getExerciseName = (webmFileName) => {
  const gifFileName = webmFileName.replace('.webm', '.gif');
  return fileNameToExerciseNameMap[gifFileName] || null;
};

async function uploadWebms() {
  try {
    console.log(`Checking for bucket '${storageBucket}'...`);
    const { data: buckets, error: bucketError } = 
      await supabase.storage.listBuckets();
    if (bucketError) throw bucketError;
    if (!buckets.some((b) => b.name === storageBucket)) {
      throw new Error(
        `Bucket "${storageBucket}" not found. Please create it manually in the Supabase dashboard as a public bucket.`
      );
    }
    console.log('Bucket found. Proceeding with upload...');

    const files = await fs.readdir(webmsDirectory);
    const webmFiles = files.filter((file) => file.endsWith('.webm'));

    if (webmFiles.length === 0) {
      console.log('No WebM files found in webm_output.');
      return;
    }

    console.log(`Found ${webmFiles.length} WebMs to upload.`);

    for (const webmFileName of webmFiles) {
      const filePath = path.join(webmsDirectory, webmFileName);
      const fileBuffer = await fs.readFile(filePath);
      const exerciseName = getExerciseName(webmFileName);

      if (!exerciseName) {
        console.log(`Skipping ${webmFileName}, no mapping found.`);
        continue;
      }

      console.log(`Uploading ${webmFileName} for exercise: "${exerciseName}"...`);

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(webmFileName, fileBuffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'video/webm',
        });

      if (uploadError) {
        console.error(`  -> Error uploading ${webmFileName}:`, uploadError.message);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(storageBucket).getPublicUrl(webmFileName);

      if (!publicUrl) {
        console.error(`  -> Could not get public URL for ${webmFileName}.`);
        continue;
      }

      console.log(`  -> Uploaded successfully. Public URL: ${publicUrl}`);
      console.log(`  -> Now updating DB for exercise: "${exerciseName}"`);

      const { data: updatedExercise, error: updateError } = await supabase
        .from('exercises')
        .update({ image: publicUrl, gif_url: publicUrl }) // Update both columns
        .eq('name', exerciseName)
        .select();

      if (updateError) {
        console.error(
          `  -> DB UPDATE FAILED for "${exerciseName}":`,
          updateError.message
        );
      } else if (updatedExercise && updatedExercise.length > 0) {
        console.log(`  -> DB updated successfully for "${exerciseName}".`);
        console.log('  -> Response:', updatedExercise);
      } else {
        console.warn(
          `  -> DB UPDATE WARNING: No exercise found in DB with name "${exerciseName}". The update had no effect.`
        );
      }
    }

    console.log('\nProcess completed!');
  } catch (error) {
    console.error('An unexpected error occurred:', error.message);
  }
}

uploadWebms();
