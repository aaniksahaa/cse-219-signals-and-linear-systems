/* Shared browser-side DSP helpers for the audio Fourier pages. */
(function () {
  "use strict";

  const TAU = Math.PI * 2;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function audioContext() {
    if (!window.__cse219AudioCtx)
      window.__cse219AudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (window.__cse219AudioCtx.state === "suspended") window.__cse219AudioCtx.resume();
    return window.__cse219AudioCtx;
  }

  function normalize(data, peak = 0.92) {
    let max = 0;
    for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]));
    if (max > peak && max > 1e-9) {
      const s = peak / max;
      for (let i = 0; i < data.length; i++) data[i] *= s;
    }
    return data;
  }

  function makeSample(id, sr = 44100) {
    const dur = id === "drum" ? 2.2 : 3.2;
    const n = Math.round(sr * dur);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      let y = 0;
      if (id === "voice") {
        const env = Math.min(1, t / 0.08) * Math.min(1, (dur - t) / 0.25);
        const form = 0.55 * Math.sin(TAU * 180 * t) + 0.25 * Math.sin(TAU * 360 * t) + 0.18 * Math.sin(TAU * 720 * t);
        y = env * form * (0.75 + 0.25 * Math.sin(TAU * 2.6 * t));
      } else if (id === "pluck") {
        const env = Math.exp(-2.2 * t);
        y = env * (0.8 * Math.sin(TAU * 196 * t) + 0.35 * Math.sin(TAU * 392 * t) + 0.18 * Math.sin(TAU * 784 * t));
      } else if (id === "chord") {
        const env = Math.min(1, t / 0.03) * Math.exp(-0.55 * t);
        [261.63, 329.63, 392.0].forEach((f, idx) => {
          y += env * (0.28 / (idx + 1)) * Math.sin(TAU * f * t);
          y += env * 0.08 * Math.sin(TAU * 2 * f * t);
        });
      } else if (id === "drum") {
        const env = Math.exp(-8 * t);
        y = env * Math.sin(TAU * (115 - 55 * Math.min(t, 0.25) / 0.25) * t);
        y += (Math.random() * 2 - 1) * Math.exp(-24 * t) * 0.35;
      } else {
        y = 0.45 * Math.sin(TAU * 220 * t) + 0.2 * Math.sin(TAU * 660 * t);
      }
      out[i] = y;
    }
    return { name: id, sr, data: normalize(out) };
  }

  async function decodeFile(file, maxSeconds = Infinity) {
    const ctx = audioContext();
    const buf = await ctx.decodeAudioData(await file.arrayBuffer());
    const sr = buf.sampleRate;
    const n = Number.isFinite(maxSeconds) ? Math.min(buf.length, Math.round(maxSeconds * sr)) : buf.length;
    const out = new Float32Array(n);
    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      const src = buf.getChannelData(ch);
      for (let i = 0; i < n; i++) out[i] += src[i] / buf.numberOfChannels;
    }
    return { name: file.name, sr, data: normalize(out) };
  }

  async function loadAudioLibrary(manifestUrl = "assets/audios/library.json") {
    const res = await fetch(manifestUrl, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Could not load audio library (${res.status})`);
    const base = new URL(manifestUrl, document.baseURI);
    const raw = await res.json();
    const items = Array.isArray(raw) ? raw : raw.audios;
    if (!Array.isArray(items)) return [];
    return items
      .filter(item => item && item.file)
      .map(item => ({
        ...item,
        id: item.id || item.file,
        name: item.name || item.file,
        url: new URL(item.file, base).href,
        start: Number.isFinite(+item.start) ? +item.start : 0,
        end: Number.isFinite(+item.end) ? +item.end : null
      }));
  }

  const assetSegmentCache = new Map();
  async function decodeAsset(asset) {
    if (!asset || !asset.url) throw new Error("Missing audio asset URL");
    const startHint = Number.isFinite(+asset.start) ? +asset.start : 0;
    const endHint = Number.isFinite(+asset.end) ? +asset.end : "";
    const key = `${asset.url}|${startHint}|${endHint}`;
    if (assetSegmentCache.has(key)) {
      const cached = assetSegmentCache.get(key);
      return { ...cached, data: new Float32Array(cached.data) };
    }

    const ctx = audioContext();
    const res = await fetch(asset.url);
    if (!res.ok) throw new Error(`Could not load ${asset.name || asset.file} (${res.status})`);
    const buf = await ctx.decodeAudioData(await res.arrayBuffer());
    const fullDuration = buf.duration;
    const sr = buf.sampleRate;
    const start = clamp(startHint, 0, Math.max(0, fullDuration - 0.01));
    const requestedEnd = Number.isFinite(+asset.end) ? +asset.end : fullDuration;
    const end = clamp(Math.max(start + 0.01, requestedEnd), start + 0.01, fullDuration);
    const a = Math.floor(start * sr);
    const b = Math.max(a + 1, Math.min(buf.length, Math.floor(end * sr)));
    const out = new Float32Array(b - a);
    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      const src = buf.getChannelData(ch);
      for (let i = a; i < b; i++) out[i - a] += src[i] / buf.numberOfChannels;
    }
    const decoded = {
      name: asset.name || asset.file || "Stored audio",
      sr,
      data: normalize(out),
      assetWindow: { start, end, fullDuration, file: asset.file || asset.url }
    };
    assetSegmentCache.set(key, decoded);
    return { ...decoded, data: new Float32Array(decoded.data) };
  }

  let activeSource = null;
  let activePlayback = null;
  let playbackRaf = null;

  function clearPlaybackFrame() {
    if (playbackRaf != null) cancelAnimationFrame(playbackRaf);
    playbackRaf = null;
  }

  function playbackPosition() {
    if (!activePlayback) return 0;
    if (activePlayback.playing) {
      const ctx = audioContext();
      return clamp(activePlayback.offset + ctx.currentTime - activePlayback.startedAt, 0, activePlayback.duration);
    }
    return clamp(activePlayback.offset, 0, activePlayback.duration);
  }

  function playbackState() {
    if (!activePlayback) return { id: null, playing: false, paused: false, position: 0, duration: 0 };
    return {
      id: activePlayback.id,
      playing: !!activePlayback.playing,
      paused: !!activePlayback.paused,
      position: playbackPosition(),
      duration: activePlayback.duration
    };
  }

  function emitPlaybackUpdate() {
    if (activePlayback && typeof activePlayback.onUpdate === "function")
      activePlayback.onUpdate(playbackState());
  }

  function tickPlayback() {
    if (!activePlayback || !activePlayback.playing) return;
    emitPlaybackUpdate();
    playbackRaf = requestAnimationFrame(tickPlayback);
  }

  function startActivePlayback(offset) {
    if (!activePlayback) return;
    const ctx = audioContext();
    if (activeSource) { try { activeSource.stop(); } catch (_) {} }
    const src = ctx.createBufferSource();
    src.buffer = activePlayback.buffer;
    src.connect(ctx.destination);
    activePlayback.offset = clamp(offset || 0, 0, Math.max(0, activePlayback.duration - 0.001));
    activePlayback.startedAt = ctx.currentTime;
    activePlayback.playing = true;
    activePlayback.paused = false;
    activeSource = src;
    src.onended = () => {
      if (activeSource !== src || !activePlayback || activePlayback.paused) return;
      activePlayback.offset = activePlayback.duration;
      activePlayback.playing = false;
      activePlayback.paused = false;
      activeSource = null;
      clearPlaybackFrame();
      emitPlaybackUpdate();
      if (typeof activePlayback.onEnded === "function") activePlayback.onEnded(playbackState());
      activePlayback = null;
    };
    src.start(0, activePlayback.offset);
    clearPlaybackFrame();
    tickPlayback();
  }

  function play(data, sr, opts = {}) {
    stop();
    const ctx = audioContext();
    const buf = ctx.createBuffer(1, data.length, sr);
    buf.copyToChannel(data, 0);
    activePlayback = {
      id: opts.id || null,
      buffer: buf,
      offset: clamp(+opts.offset || 0, 0, data.length / sr),
      startedAt: 0,
      duration: data.length / sr,
      playing: false,
      paused: false,
      onUpdate: opts.onUpdate || null,
      onEnded: opts.onEnded || null
    };
    startActivePlayback(activePlayback.offset);
    emitPlaybackUpdate();
  }

  function pause() {
    if (!activePlayback || !activePlayback.playing) return;
    activePlayback.offset = playbackPosition();
    activePlayback.playing = false;
    activePlayback.paused = true;
    if (activeSource) { try { activeSource.stop(); } catch (_) {} }
    activeSource = null;
    clearPlaybackFrame();
    emitPlaybackUpdate();
  }

  function resume() {
    if (!activePlayback || !activePlayback.paused) return;
    startActivePlayback(activePlayback.offset);
    emitPlaybackUpdate();
  }

  function togglePause() {
    if (!activePlayback) return playbackState();
    if (activePlayback.playing) pause();
    else if (activePlayback.paused) resume();
    return playbackState();
  }

  function stop() {
    if (activePlayback) activePlayback.offset = playbackPosition();
    if (activeSource) { try { activeSource.stop(); } catch (_) {} }
    activeSource = null;
    clearPlaybackFrame();
    if (activePlayback) {
      activePlayback.playing = false;
      activePlayback.paused = false;
      activePlayback.offset = 0;
      emitPlaybackUpdate();
    }
    activePlayback = null;
  }

  function fft(re, im, inverse = false) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        [re[i], re[j]] = [re[j], re[i]];
        [im[i], im[j]] = [im[j], im[i]];
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (inverse ? TAU : -TAU) / len;
      const wLenRe = Math.cos(ang), wLenIm = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let wRe = 1, wIm = 0;
        for (let j = 0; j < len / 2; j++) {
          const uRe = re[i + j], uIm = im[i + j];
          const vRe = re[i + j + len / 2] * wRe - im[i + j + len / 2] * wIm;
          const vIm = re[i + j + len / 2] * wIm + im[i + j + len / 2] * wRe;
          re[i + j] = uRe + vRe; im[i + j] = uIm + vIm;
          re[i + j + len / 2] = uRe - vRe; im[i + j + len / 2] = uIm - vIm;
          const nwRe = wRe * wLenRe - wIm * wLenIm;
          wIm = wRe * wLenIm + wIm * wLenRe;
          wRe = nwRe;
        }
      }
    }
    if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }

  function hann(n) {
    const w = new Float32Array(n);
    for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(TAU * i / (n - 1));
    return w;
  }

  function bandWeight(freq, lo, hi, soft) {
    if (hi < lo) [lo, hi] = [hi, lo];
    if (soft <= 1) return freq >= lo && freq <= hi ? 1 : 0;
    if (freq >= lo && freq <= hi) return 1;
    const d = freq < lo ? lo - freq : freq - hi;
    if (d >= soft) return 0;
    return 0.5 + 0.5 * Math.cos(Math.PI * d / soft);
  }

  function maskGain(freq, cfg) {
    let b = bandWeight(freq, cfg.low, cfg.high, cfg.softness || 0);
    if (cfg.invert) b = 1 - b;
    if (cfg.operation === "isolate") return b;
    const g = cfg.operation === "cut" ? 0 : cfg.gain;
    return 1 - (1 - g) * b;
  }

  function stftProcess(input, sr, cfg) {
    const L = cfg.fftSize || 2048, H = cfg.hop || 512;
    const win = hann(L);
    const frames = Math.max(1, Math.ceil((input.length - L) / H) + 1);
    const out = new Float32Array(input.length + L);
    const norm = new Float32Array(input.length + L);
    const avg = new Float32Array(L / 2 + 1);
    const avgOut = new Float32Array(L / 2 + 1);
    const spec = [];
    for (let m = 0; m < frames; m++) {
      const offset = m * H;
      const re = new Float64Array(L), im = new Float64Array(L);
      for (let i = 0; i < L; i++) re[i] = (input[offset + i] || 0) * win[i];
      fft(re, im, false);
      const frameMag = new Float32Array(L / 2 + 1);
      for (let k = 0; k <= L / 2; k++) {
        const mag = Math.hypot(re[k], im[k]);
        avg[k] += mag;
        frameMag[k] = mag;
        const freq = k * sr / L;
        const g = cfg.patch ? patchGain(freq, offset / sr, cfg) : maskGain(freq, cfg);
        re[k] *= g; im[k] *= g;
        if (k > 0 && k < L / 2) { re[L - k] *= g; im[L - k] *= g; }
        avgOut[k] += Math.hypot(re[k], im[k]);
      }
      fft(re, im, true);
      for (let i = 0; i < L; i++) {
        const idx = offset + i;
        out[idx] += re[i] * win[i];
        norm[idx] += win[i] * win[i];
      }
      spec.push(frameMag);
    }
    const y = new Float32Array(input.length);
    for (let i = 0; i < y.length; i++) y[i] = norm[i] > 1e-8 ? out[i] / norm[i] : out[i];
    normalize(y);
    for (let k = 0; k < avg.length; k++) { avg[k] /= frames; avgOut[k] /= frames; }
    return { data: y, removed: difference(input, y), avg, avgOut, spectrogram: spec, fftSize: L, hop: H };
  }

  function patchGain(freq, time, cfg) {
    const inFreq = bandWeight(freq, cfg.low, cfg.high, cfg.softness || 0);
    const inTime = time >= cfg.tLow && time <= cfg.tHigh ? 1 : 0;
    const b = cfg.patch ? inFreq * inTime : inFreq;
    return 1 - b;
  }

  function difference(a, b) {
    const n = Math.min(a.length, b.length);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = a[i] - b[i];
    return normalize(out, 0.9);
  }

  function injectNoise(clean, sr, cfg) {
    const out = new Float32Array(clean.length);
    out.set(clean);
    for (let i = 0; i < out.length; i++) {
      const t = i / sr;
      let env = 1;
      if (cfg.type === "burst") {
        if (t < cfg.start || t > cfg.start + cfg.duration) env = 0;
        else {
          const q = (t - cfg.start) / cfg.duration;
          env = Math.sin(Math.PI * q) ** 2;
        }
      }
      out[i] += cfg.amp * env * Math.sin(TAU * cfg.freq * t);
    }
    return normalize(out);
  }

  function drawWave(canvas, data, sr, color, cursor = null) {
    const { ctx, w, h } = setupCanvas(canvas, 130);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#eef0f6";
    for (let i = 0; i <= 4; i++) { const y = 18 + i * (h - 38) / 4; ctx.beginPath(); ctx.moveTo(34, y); ctx.lineTo(w - 12, y); ctx.stroke(); }
    const mid = h / 2, amp = (h - 42) / 2;
    ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.beginPath();
    const cols = Math.max(1, Math.floor(w - 46));
    for (let x = 0; x < cols; x++) {
      const a = Math.floor(x / cols * data.length), b = Math.max(a + 1, Math.floor((x + 1) / cols * data.length));
      let lo = 1, hi = -1;
      for (let i = a; i < b; i++) { lo = Math.min(lo, data[i] || 0); hi = Math.max(hi, data[i] || 0); }
      const px = 34 + x, y1 = mid - hi * amp, y2 = mid - lo * amp;
      ctx.moveTo(px, y1); ctx.lineTo(px, y2);
    }
    ctx.stroke();
    ctx.strokeStyle = "#d9dde8"; ctx.beginPath(); ctx.moveTo(34, mid); ctx.lineTo(w - 12, mid); ctx.stroke();
    if (cursor != null) {
      const x = 34 + clamp(cursor * sr / data.length, 0, 1) * cols;
      ctx.strokeStyle = "#111827"; ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.moveTo(x, 12); ctx.lineTo(x, h - 12); ctx.stroke();
    }
  }

  function drawSpectrum(canvas, spectrum, sr, fftSize, cfg) {
    const { ctx, w, h } = setupCanvas(canvas, 210);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    const left = 42, right = 16, top = 18, bottom = 30;
    const nyq = sr / 2, eps = 1e-8;
    const showBand = cfg && cfg.markers !== false && Number.isFinite(cfg.low) && Number.isFinite(cfg.high);
    let maxDb = -120, minDb = -90;
    for (let i = 0; i < spectrum.length; i++) maxDb = Math.max(maxDb, 20 * Math.log10(spectrum[i] + eps));
    minDb = maxDb - 70;
    const xFor = f => left + clamp(f / nyq, 0, 1) * (w - left - right);
    const yFor = db => top + (maxDb - db) / Math.max(1, maxDb - minDb) * (h - top - bottom);
    if (showBand) {
      ctx.fillStyle = "rgba(79,70,229,.08)";
      ctx.fillRect(xFor(cfg.low), top, xFor(cfg.high) - xFor(cfg.low), h - top - bottom);
    }
    ctx.strokeStyle = "#eef0f6";
    for (let i = 0; i <= 4; i++) { const y = top + i * (h - top - bottom) / 4; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(w - right, y); ctx.stroke(); }
    ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 2; ctx.beginPath();
    for (let k = 0; k < spectrum.length; k++) {
      const f = k * sr / fftSize;
      const x = xFor(f), y = yFor(20 * Math.log10(spectrum[k] + eps));
      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (showBand) {
      ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 2;
      [cfg.low, cfg.high].forEach(f => { const x = xFor(f); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, h - bottom); ctx.stroke(); });
    }
    ctx.fillStyle = "#6b7280"; ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("0 Hz", left, h - 9); ctx.fillText(Math.round(nyq / 1000) + " kHz", w - right - 42, h - 9);
  }

  function drawSpectrogram(canvas, spec, sr, fftSize, maxFreq = 10000) {
    const { ctx, w, h } = setupCanvas(canvas, 230);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    if (!spec || !spec.length) return;
    const left = 42, right = 16, top = 16, bottom = 28;
    const pw = w - left - right, ph = h - top - bottom;
    let max = -120, min = -120;
    const rows = Math.min(Math.floor(maxFreq / (sr / fftSize)), fftSize / 2);
    spec.forEach(frame => { for (let k = 0; k <= rows; k++) max = Math.max(max, 20 * Math.log10((frame[k] || 0) + 1e-8)); });
    min = max - 70;
    for (let x = 0; x < pw; x++) {
      const frame = spec[Math.min(spec.length - 1, Math.floor(x / pw * spec.length))];
      for (let y = 0; y < ph; y++) {
        const k = Math.floor((1 - y / ph) * rows);
        const db = 20 * Math.log10((frame[k] || 0) + 1e-8);
        const q = clamp((db - min) / (max - min), 0, 1);
        ctx.fillStyle = `hsl(${230 - 210 * q} 86% ${18 + 48 * q}%)`;
        ctx.fillRect(left + x, top + y, 1, 1);
      }
    }
    ctx.strokeStyle = "#d9dde8"; ctx.strokeRect(left, top, pw, ph);
    ctx.fillStyle = "#6b7280"; ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("time", w - right - 32, h - 8); ctx.fillText(Math.round(maxFreq / 1000) + " kHz", 8, top + 6); ctx.fillText("0", 24, h - bottom);
  }

  function setupCanvas(canvas, minH) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const ww = Math.max(320, Math.round(rect.width * dpr));
    const hh = Math.max(minH, Math.round(rect.height * dpr));
    if (canvas.width !== ww || canvas.height !== hh) { canvas.width = ww; canvas.height = hh; }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: ww / dpr, h: hh / dpr };
  }

  window.CSE219AudioFourier = {
    makeSample, decodeFile, loadAudioLibrary, decodeAsset, play, pause, resume, togglePause, playbackState, stop, stftProcess, injectNoise, difference,
    drawWave, drawSpectrum, drawSpectrogram, normalize, clamp
  };
})();
