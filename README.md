#Photobooth

Four poses, one song, two strips. A static, no-build Christmas photobooth that runs entirely in the browser.

Flow: pick a 3 or 5 second timer and a Black & white or Color look, press Start, and the camera takes four photos, one per lyric line. Each photo gets a grainy black-and-white film look, then a short "developing" screen follows and two strips slide down out of a booth slot. Download either one strip or the pair as straight, full-resolution PNGs (810 px wide per strip, about 3900 px tall).

## Project structure

```
photobooth/
├── index.html            Page markup
├── vercel.json           Hosting headers (camera permission)
├── public/
│   └── favicon.svg
├── src/
   ├── css/styles.css    Christmas theme, lace frame, layout
   └── js/
       ├── config.js     Timers, lyric lines, filter strength, storage keys
       ├── main.js       State machine: intro, shooting, developing, result
       ├── camera.js     Webcam start and 4:5 mirrored capture
       ├── filter.js     Black-and-white, contrast curve, grain, vignette
       ├── strip.js      Builds the straight strip and the two-strip sheet
       ├── storage.js    Optional private upload to Supabase
       └── snow.js       Light snowfall background


## Run locally

The camera only works on `localhost` or `https`, so do not open the file by double-click.

```bash
npx serve .
# open http://localhost:3000
```

Or: `python3 -m http.server 3000`.