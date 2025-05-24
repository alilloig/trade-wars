#!/usr/bin/env node

import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminOptipng from 'imagemin-optipng';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function optimizeImages() {
  try {
    console.log('🖼️  Optimizing PNG images...');
    
    const files = await imagemin([join(__dirname, 'dist/*.png')], {
      destination: join(__dirname, 'dist'),
      plugins: [
        imageminOptipng({
          optimizationLevel: 7 // Max compression
        }),
        imageminPngquant({
          quality: [0.6, 0.8], // 60-80% quality
          strip: true // Remove metadata
        })
      ]
    });

    console.log('✅ Optimized images:');
    files.forEach(file => {
      console.log(`   📁 ${file.destinationPath}`);
    });

    console.log('\n📊 Size comparison:');
    console.log('Run "du -h dist/*.png" to see new sizes');
    
  } catch (error) {
    console.error('❌ Error optimizing images:', error);
    process.exit(1);
  }
}

optimizeImages(); 