#!/usr/bin/env bash
# Shrink the finished master to under 9.5 MB at FULL 1080x1920 for fast upload and fetch, without visible quality loss.
# Usage: pipeline/compress.sh master.mp4 video.mp4 [max_bytes=9500000]
# Tries CRF 26, 28, 30, 32 (slow preset, animation tune, 128k AAC voice track) and keeps the first result that is
# under the size cap AND has SSIM >= 0.985 against the master. Exits 1 if none qualifies (then do NOT stage; keep master).
set -euo pipefail
IN="$1"; OUT="$2"; MAX="${3:-9500000}"
for crf in 26 28 30 32; do
  tmp="$(mktemp --suffix=.mp4)"
  ffmpeg -v error -y -i "$IN" -c:v libx264 -preset slow -crf "$crf" -tune animation -profile:v high -level 4.1 \
    -pix_fmt yuv420p -maxrate 1100k -bufsize 2200k -movflags +faststart -c:a aac -b:a 128k -ar 48000 "$tmp"
  size=$(stat -c %s "$tmp")
  ssim=$(ffmpeg -v info -i "$tmp" -i "$IN" -lavfi ssim -f null - 2>&1 | sed -n 's/.*SSIM.* All:\([0-9.]*\).*/\1/p' | tail -1)
  echo "crf=$crf size=$size ssim=$ssim"
  if [ "$size" -le "$MAX" ] && awk "BEGIN{exit !($ssim >= 0.985)}"; then
    mv "$tmp" "$OUT"; echo "OK: $OUT ($size bytes, ssim $ssim)"; exit 0
  fi
  rm -f "$tmp"
done
echo "FAILED: no setting met size<=$MAX and ssim>=0.985" >&2; exit 1
