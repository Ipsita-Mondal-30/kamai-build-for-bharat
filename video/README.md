# Demo video

`kamai-demo.mp4` (4:14, 1280x720, captions burned in) and `kamai-demo.srt` (same captions for YouTube/Drive uploads).

Built by script, so it is easy to edit and rebuild:

| File | Role |
|---|---|
| `scenes.mjs` | The whole script: narration, on-screen text, which screenshot each scene uses |
| `capture.mjs` | Drives headless Chrome through the **real running app** and saves the screenshots |
| `build.mjs` | Renders slides, makes narration (macOS `say`: Rishi for English, Lekha for Hindi), times captions, assembles with ffmpeg |

```bash
# 1. a clean app instance with its own empty database (port 3200)
npm run build
KAMAI_DATA_DIR=/tmp/kamai-video KAMAI_INSECURE_COOKIES=1 NODE_ENV=production npx next start -p 3200 &
# 2. capture screens, 3. build the video (WORK = any scratch folder)
WORK=/tmp/kamai-work; mkdir -p $WORK
node video/capture.mjs $WORK/shots
WORK=$WORK node video/build.mjs "$PWD/video"
```
Needs macOS, Google Chrome, Node 22+ and ffmpeg. To use your own voice instead, record over the video and keep the `.srt` as captions.

## Using real photos instead of the illustrations
The four story scenes and the closing card are drawn illustrations (`art.mjs`). To use real photos, put image files in `video/photos/` named after the scene and rebuild:

`s01.jpg` (the stall at dawn) · `s02.jpg` (cash and notebook) · `s03.jpg` (the rain) · `s04.jpg` (the bank) · `s20.jpg` (closing)

A photo replaces the illustration for that scene. Use images you own or have a licence for (the video will be submitted publicly).
