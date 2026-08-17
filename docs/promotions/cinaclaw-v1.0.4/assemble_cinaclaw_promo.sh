#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/ubuntu/cross-repo-audit/Cina-Claw-Pro-next"
OUT="/home/ubuntu/cross-repo-audit/cinaclaw-v1.0.4-promo"
VOICE="/home/ubuntu/cross-repo-audit/cinaclaw-v1.0.4-promo-voiceover.wav"
WORK="/home/ubuntu/cross-repo-audit/.cinaclaw-promo-work"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

rm -rf "$WORK"
mkdir -p "$WORK"

# Each source is an authentic repository screenshot. We use cinematic crop/zoom
# and typography only; the UI itself is never redrawn or fabricated.
make_clip() {
  local idx="$1" duration="$2" image="$3" title="$4"
  local endfade
  endfade=$(awk "BEGIN { printf \"%.2f\", $duration-0.8 }")
  ffmpeg -y -loglevel error -loop 1 -i "$image" -t "$duration" \
    -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,boxblur=18:8,eq=brightness=-0.10:saturation=0.7[bg];movie=$image,scale=1120:640:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,drawtext=fontfile=$FONT:text='$title':fontcolor=white:fontsize=34:box=1:boxcolor=black@0.44:boxborderw=18:x=74:y=610,fade=t=in:st=0:d=0.8,fade=t=out:st=$endfade:d=0.8,format=yuv420p" \
    -an "$WORK/clip-$idx.mp4"
}

make_clip 01 4 "$ROOT/resources/icons/icon.png" "CinaCLAW AI"
make_clip 02 7 "$ROOT/resources/screenshot/en/chat.png" "A focused command center"
make_clip 03 7 "$ROOT/resources/screenshot/en/models.png" "Chat · images · files · models"
make_clip 04 7 "$ROOT/resources/screenshot/en/channels.png" "Ask. Delegate. Stay in control."
make_clip 05 8 "$ROOT/resources/screenshot/en/skills.png" "Reviewed skills, ready to work"
make_clip 06 8 "$ROOT/resources/screenshot/en/cron.png" "Scheduled automation"
make_clip 07 8 "$ROOT/resources/screenshot/en/settings.png" "Control the details"
make_clip 08 7 "$ROOT/resources/screenshot/en/chat.png" "v1.0.4 · audited · validated"
make_clip 09 4 "$ROOT/resources/icons/icon.png" "Explore the release"

: > "$WORK/concat.txt"
for f in "$WORK"/clip-*.mp4; do printf "file '%s'\n" "$f" >> "$WORK/concat.txt"; done
ffmpeg -y -loglevel error -f concat -safe 0 -i "$WORK/concat.txt" -c copy "$WORK/video-only.mp4"

# Keep narration audible through the full 60-second picture; if the voiceover is
# shorter, pad with silence; if longer, trim cleanly at the end card.
ffmpeg -y -loglevel error -i "$WORK/video-only.mp4" -i "$VOICE" \
  -filter_complex "[1:a]apad=pad_dur=60,atrim=0:60,volume=1.35[a]" \
  -map 0:v:0 -map "[a]" -t 60 -c:v copy -c:a aac -b:a 192k -movflags +faststart \
  "$OUT.mp4"

ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 "$OUT.mp4"
