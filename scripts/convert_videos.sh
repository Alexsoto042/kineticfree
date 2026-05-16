#!/bin/bash

# Script para convertir videos MP4 a WebM
# Los videos convertidos se guardarán en scripts/converted_videos/

# Crear directorio de salida si no existe
mkdir -p scripts/converted_videos

# Directorio de entrada
INPUT_DIR="public/videos faltantes"
OUTPUT_DIR="scripts/converted_videos"

# Contador
count=0

# Convertir cada video MP4 a WebM
for video in "$INPUT_DIR"/*.mp4; do
  if [ -f "$video" ]; then
    # Obtener nombre del archivo sin extensión
    filename=$(basename "$video" .mp4)
    
    # Convertir a WebM con buena calidad y compresión
    echo "Convirtiendo: $filename"
    ffmpeg -i "$video" \
      -c:v libvpx-vp9 \
      -crf 30 \
      -b:v 0 \
      -b:a 128k \
      -c:a libopus \
      -vf "scale=640:-1" \
      -an \
      "$OUTPUT_DIR/${filename}.webm" \
      -y \
      -loglevel error
    
    if [ $? -eq 0 ]; then
      echo "✓ Convertido: ${filename}.webm"
      ((count++))
    else
      echo "✗ Error al convertir: $filename"
    fi
  fi
done

echo ""
echo "========================================="
echo "Conversión completada"
echo "Total de videos convertidos: $count"
echo "Ubicación: $OUTPUT_DIR"
echo "========================================="
