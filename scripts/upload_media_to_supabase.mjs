import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import mime from 'mime-types';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase credentials not found in .env file');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'images'; // Define your Supabase Storage bucket name

const MEDIA_FILES_TO_UPLOAD = [
  // Exercise media from add_new_full_plans.mjs
  'public/images/barbell-row.webm',
  'public/images/treadmill-incline.webm',
  'public/images/dynamic-stretches.webm',
  'public/images/bench-press-gvt.png',
  // Recipe images from update_recipes.mjs
  'public/images/recipe-chicken-quinoa.jpg',
  'public/images/recipe-lentil-salad.jpg',
  'public/images/recipe-salmon-asparagus.jpg',
  'public/images/recipe-protein-shake.jpg',
  'public/images/recipe-protein-oats.jpg',
  'public/images/recipe-egg-scramble.jpg',
  'public/images/recipe-chicken-rice.jpg',
  'public/images/recipe-tuna-sandwich.jpg',
  'public/images/recipe-stewed-lentils.jpg',
  'public/images/recipe-yogurt-bowl.jpg',
  'public/images/recipe-chicken-wrap.jpg',
  'public/images/recipe-beef-broccoli.jpg',
  'public/images/recipe-black-bean-burger.jpg',
  'public/images/recipe-quinoa-chickpea-salad.jpg',
  'public/images/recipe-avocado-toast.jpg',
  'public/images/recipe-chicken-soup.jpg',
  'public/images/recipe-lemon-fish.jpg',
  'public/images/recipe-apple-peanut-butter.jpg',
  'public/images/recipe-caesar-salad.jpg',
  'public/images/recipe-curried-chickpeas.jpg',
];

async function uploadMedia() {
  console.log(`Starting media upload to Supabase Storage bucket: ${BUCKET_NAME}`);
  try {
    // Ensure the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw new Error(`Error listing buckets: ${listError.message}`);

    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      if (createBucketError) throw new Error(`Error creating bucket ${BUCKET_NAME}: ${createBucketError.message}`);
      console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
    } else {
      console.log(`Bucket '${BUCKET_NAME}' already exists.`);
    }

    for (const filePath of MEDIA_FILES_TO_UPLOAD) {
      const fileName = path.basename(filePath);
      const fileContent = await fs.readFile(filePath);
      const contentType = mime.lookup(filePath) || 'application/octet-stream';

      console.log(`Uploading ${fileName} with Content-Type: ${contentType}...`);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileContent, {
          contentType: contentType,
          upsert: true, // Overwrite if file already exists
        });

      if (uploadError) {
        console.error(`Error uploading ${fileName}: ${uploadError.message}`);
      } else {
        console.log(`Successfully uploaded ${fileName}.`);
      }
    }
    console.log('Media upload process finished.');
  } catch (e) {
    console.error('An error occurred during media upload:', e.message);
  }
}

uploadMedia();
