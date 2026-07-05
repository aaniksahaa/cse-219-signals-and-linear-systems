# CSE 219 · Signals & Linear Systems — Interactive Demos

A tiny, dependency-free **static course website** that hosts in-browser
visualizations for CSE 219. It's built to be served for free on **GitHub Pages**
— there is no backend, no build step, and no data is ever saved or sent anywhere.


## Pages

| File | What it is |
|------|------------|
| `index.html` | Course home — hero + cards linking to each demo. |
| `listening-to-convolution.html` | **Convolution & LTI Systems** demo: pick a system by its impulse response h[n] and hear y = x ∗ h. |
| `fourier-vibrating-string.html` | **Fourier Series & Vibrating String** demo: draw an initial string shape, decompose it into sine modes, and animate the ideal fixed-end string. |
| `fourier-heat-diffusion.html` | **Fourier Series & Heat Diffusion** demo: draw an initial temperature profile, decompose it into heat modes, and watch diffusion smooth it. |
| `fourier-epicycles-1d.html` | **Fourier Series 1D Epicycles** demo: build periodic waveforms by adding rotating complex Fourier coefficient vectors. |
| `fourier-epicycles-2d.html` | **Fourier Drawing Epicycles** demo: rebuild closed 2D curves with complex Fourier coefficients and rotating vectors. |
| `assets/site.css` | Shared styles for the site shell (sidebar + layout). |
| `assets/site.js` | **Single source of truth for the sidebar** — brand, nav links, footer. |
| `.nojekyll` | Tells GitHub Pages to serve files as-is (no Jekyll processing). |

The sidebar is rendered from `assets/site.js`, so you edit the brand / menu / footer
in **one place** and every page updates. Each page only contains the placeholder
`<aside class="sidebar" id="siteSidebar"></aside>` and loads `assets/site.js`; the
active menu item is detected automatically from the page's filename.

To add a new demo: create another `*.html` page (placeholder aside + the two
`assets/…` includes), then add one line to the `nav` array in `assets/site.js`.

## Run locally

It's plain static files — no build, no dependencies.

- **Quickest:** open `index.html` in a browser.
- **For microphone recording** in the convolution demo, browsers require a *secure
  context*, which `file://` is not. Serve over `localhost` instead:

  ```bash
  python3 -m http.server 8000      # then open http://localhost:8000
  # or:  ./serve.sh
  ```

## Host free on GitHub Pages

1. Put these files at the repo root (or in a `/docs` folder).
2. Push to GitHub.
3. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   pick your branch and `/ (root)` (or `/docs`), Save.
4. Your site goes live at `https://<user>.github.io/<repo>/`.

`index.html` is served automatically as the landing page. Everything (audio decode,
convolution, playback) runs client-side, so Pages' static hosting is all you need.

## The convolution demo

- **Two systems**, both impulse trains of equally-spaced echoes:
  - **Exponential Decay** — each echo a fraction α weaker, so it fades (stable).
  - **Unit Step** — equal repeated echoes; in the limit it's not absolutely
    summable, i.e. not BIBO stable (the contrast is the teaching point).
- Input: built-in sounds, file upload, or microphone recording.
- Live impulse-response plot, formula, and a Σ|h[n]| / BIBO-stability badge.
- **Convolve & Listen** auto-plays the output; A/B switch to compare Input vs Output;
  output gain, normalize toggle, clipping warning, and WAV download.
- Convolution uses the Web Audio API's `OfflineAudioContext` + `ConvolverNode` with
  `normalize = false`, giving **exact linear** y = x ∗ h (native FFT speed) — which is
  what makes the stability/amplitude demonstrations mathematically truthful.
