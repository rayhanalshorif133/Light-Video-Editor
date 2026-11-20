# Light Video Editor (Web Studio)

A fast, lightweight, and modern fully client-side mobile & desktop web video editor. Runs 100% in any modern web browser with zero server dependencies, and is hosted directly on **GitHub Pages**.

🔗 **Live Demo:** [https://rayhanalshorif133.github.io/light-Video-Editor/](https://rayhanalshorif133.github.io/light-Video-Editor/)

---

## 🌟 Key Features

1. **100% Client-Side:** No server, backend, or cloud upload required. Runs completely private in your browser.
2. **Precision Cutting:** Split video clips at the exact center playhead needle (`C` or `S`).
3. **Yellow Trimming Handles:** Drag start and end handles on any clip.
4. **Speed Control (10% to 200%):** Smooth slider, `−` / `+` step buttons, and instant presets (`10%`, `50%`, `75%`, `100%`, `110%`, `120%`, `150%`, `200%`).
5. **Volume Control:** 0% to 200% volume slider with reset.
6. **Reverse Clip Playback:** 1-click reverse video toggle.
7. **Full Undo / Redo:** Complete history stack (`Ctrl+Z`, `Ctrl+Y`).
8. **In-Browser Filmstrip Thumbnails:** Automatically extracted and cached frame-by-frame preview.
9. **In-Browser Video Export & Download:** Real canvas + audio compositor with MediaRecorder that renders your cut, speed-adjusted clips and downloads the exported video file directly to your device.
10. **Drag & Drop:** Drop any video file (`.mp4`, `.webm`, `.mov`) into the browser to edit.

---

## 🚀 How to Run & Deploy to GitHub Pages

### Option 1: GitHub Pages (Automatic)
The project is hosted from the `gh-pages` branch. Visiting `https://rayhanalshorif133.github.io/light-Video-Editor/` will load the editor instantly.

### Option 2: Run Locally
You can run any local static HTTP server, for example:
```bash
# Python
python -m http.server 8000

# Node / npx
npx serve .
```
Then open `http://localhost:8000/` in your browser.
