// Live keyword spotting with the ESP32 Edge Impulse model compiled to WebAssembly.
//
// Pipeline: microphone -> 16 kHz mono -> speech detection -> 1 s window centred
// on the word -> MFCC + int8 CNN (WASM) -> label. Everything runs locally.

import createVoiceModel from "./model/voice-model.js";

const $ = (s) => document.querySelector(s);
const RATE = 16000;
const WINDOW = 16000; // 1 s, what the model expects
const RING = RATE * 3; // keep 3 s of audio
const FRAME = 320; // 20 ms frames for speech detection
// The model is sensitive to where the word sits in its 1 s window, so each word is
// classified through 9 windows shifted by up to ±250 ms and the probabilities are
// averaged, which is more accurate than trusting any single window.
const OFFSETS = [-4000, -2800, -1600, -800, 0, 800, 1600, 2800, 4000];
// Measured on 2,240 unseen-speaker clips with realistic misalignment and mic level:
// acting when the 9-window average is >= 0.44 is right ~92% of the time and acts on
// ~51% of commands (otherwise the screen shows its best guess with a "?").
const MIN_CONFIDENCE = 0.44;
const TOP_N = 5;
const IGNORE = new Set(["noise", "unknown"]);
const DIGITS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const ui = {
  btn: $("#mic-btn"),
  label: $("#mic-label"),
  status: $("#status"),
  meter: $("#meter"),
  oled: $("#oled"),
  word: $("#oled-word"),
  state: $("#oled-state"),
  conf: $("#oled-conf"),
  time: $("#oled-time"),
  led: $("#led"),
  bars: $("#bars"),
  wave: $("#wave"),
  history: $("#history"),
  bot: $("#bot"),
  factMs: $("#fact-ms"),
};

const setStatus = (msg, err = false) => {
  ui.status.textContent = msg;
  ui.status.classList.toggle("err", err);
};

// ---------------------------------------------------------------------------
// model
// ---------------------------------------------------------------------------
let model = null;
let labels = [];

async function loadModel() {
  model = await createVoiceModel();
  labels = Array.from({ length: model._label_count() }, (_, i) => model.UTF8ToString(model._label(i)));
  ui.bars.innerHTML = Array.from(
    { length: TOP_N },
    () =>
      `<div class="bar"><span class="name">–</span><span class="track"><span class="fill"></span></span><span class="pct">0%</span></div>`,
  ).join("");
}

/** Classify one window of 16 kHz float samples in [-1, 1]. */
function classify(win) {
  const ptr = model._audio_buffer() >> 2;
  const heap = model.HEAPF32;
  // The ESP32 feeds raw int16 microphone samples; match that scale.
  for (let i = 0; i < WINDOW; i++) heap[ptr + i] = Math.max(-1, Math.min(1, win[i])) * 32767;
  const t0 = performance.now();
  const out = model._classify();
  const ms = performance.now() - t0;
  if (!out) throw new Error("classifier error");
  const p = out >> 2;
  const scores = labels.map((l, i) => ({ label: l, score: model.HEAPF32[p + i] }));
  return { scores, ms };
}

// ---------------------------------------------------------------------------
// audio capture
// ---------------------------------------------------------------------------
const ring = new Float32Array(RING);
let written = 0; // total samples written since start
let ctx = null;
let stream = null;
let node = null;
let resampleState = { pos: 0, last: 0 };
let listening = false;

function push(samples) {
  for (let i = 0; i < samples.length; i++) {
    ring[written % RING] = samples[i];
    written++;
  }
  detect(samples.length);
}

/** Copy `len` samples starting at absolute sample index `start` out of the ring. */
function read(start, len) {
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    out[i] = idx < 0 || idx >= written || idx < written - RING ? 0 : ring[idx % RING];
  }
  return out;
}

/** Linear resampling for browsers that ignore the requested 16 kHz context rate. */
function resample(input, fromRate) {
  if (fromRate === RATE) return input;
  const step = fromRate / RATE;
  const out = [];
  let pos = resampleState.pos;
  let last = resampleState.last;
  while (pos < input.length) {
    const i = Math.floor(pos);
    const frac = pos - i;
    const a = i === 0 ? last : input[i - 1];
    const b = input[i];
    out.push(a + (b - a) * frac);
    pos += step;
  }
  resampleState = { pos: pos - input.length, last: input[input.length - 1] };
  return Float32Array.from(out);
}

const WORKLET = `
class Tap extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) this.port.postMessage(ch.slice(0));
    return true;
  }
}
registerProcessor("tap", Tap);
`;

async function start() {
  ui.btn.disabled = true;
  setStatus("Asking for microphone permission…");
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: false, noiseSuppression: true, autoGainControl: true },
    });
  } catch (err) {
    ui.btn.disabled = false;
    setStatus(
      err && err.name === "NotAllowedError"
        ? "Microphone access was blocked. Allow it in the address bar and try again."
        : `Couldn't open a microphone (${err && err.name ? err.name : "unknown error"}).`,
      true,
    );
    return;
  }
  try {
    ctx = new AudioContext({ sampleRate: RATE });
  } catch {
    ctx = new AudioContext(); // some browsers can't open a 16 kHz context; resample instead
  }
  const src = ctx.createMediaStreamSource(stream);
  const rate = ctx.sampleRate;
  resampleState = { pos: 0, last: 0 };
  if (ctx.audioWorklet) {
    const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
    await ctx.audioWorklet.addModule(url);
    node = new AudioWorkletNode(ctx, "tap");
    node.port.onmessage = (e) => push(resample(e.data, rate));
  } else {
    node = ctx.createScriptProcessor(1024, 1, 1);
    node.onaudioprocess = (e) => push(resample(e.inputBuffer.getChannelData(0), rate));
  }
  src.connect(node);
  // Keep the graph pulling audio without playing it back.
  const mute = ctx.createGain();
  mute.gain.value = 0;
  node.connect(mute).connect(ctx.destination);
  await ctx.resume();

  listening = true;
  ui.btn.disabled = false;
  ui.btn.classList.add("live");
  ui.label.textContent = "Stop listening";
  ui.oled.classList.add("listening");
  ui.state.textContent = "LISTENING";
  setStatus("Listening. Try “turn on”, “open”, “five” or “left”.");
}

function stop() {
  listening = false;
  stream?.getTracks().forEach((t) => t.stop());
  node?.disconnect();
  ctx?.close();
  ctx = null;
  ui.btn.classList.remove("live");
  ui.label.textContent = "Start listening";
  ui.oled.classList.remove("listening");
  ui.state.textContent = "IDLE";
  ui.meter.style.width = "0";
  setStatus("Stopped. Press Start listening to try again.");
}

ui.btn.addEventListener("click", () => (listening ? stop() : start()));

// ---------------------------------------------------------------------------
// speech detection: classify once per spoken word, with the word centred
// ---------------------------------------------------------------------------
const vad = {
  floor: 0.004, // adaptive noise floor (RMS)
  state: "idle", // idle | speech | wait
  onset: 0,
  lastVoice: 0,
  centre: 0,
  cooldownUntil: 0,
  pending: 0, // samples not yet analysed
  level: 0,
};

function detect(n) {
  vad.pending += n;
  while (vad.pending >= FRAME) {
    vad.pending -= FRAME;
    const end = written - vad.pending;
    const frame = read(end - FRAME, FRAME);
    let sum = 0;
    for (const v of frame) sum += v * v;
    const rms = Math.sqrt(sum / FRAME);
    vad.level = rms;
    const threshold = Math.max(0.012, vad.floor * 3.2);

    if (vad.state === "idle") {
      if (rms > threshold && end > vad.cooldownUntil) {
        vad.state = "speech";
        vad.onset = end - FRAME * 2;
        vad.lastVoice = end;
        ui.state.textContent = "HEARING";
      } else {
        // track background noise only while nobody is speaking
        vad.floor = vad.floor * 0.98 + Math.max(rms, 0.001) * 0.02;
      }
    } else if (vad.state === "speech") {
      if (rms > threshold * 0.55) vad.lastVoice = end;
      const length = end - vad.onset;
      const quietFor = end - vad.lastVoice;
      if ((quietFor > RATE * 0.18 && length > RATE * 0.22) || length > RATE * 0.95) {
        const wordEnd = Math.min(vad.lastVoice, vad.onset + RATE * 0.95);
        vad.centre = Math.round((vad.onset + wordEnd) / 2);
        vad.state = "wait"; // wait until the window around the word is fully recorded
      }
    }
    if (vad.state === "wait" && written >= vad.centre + WINDOW / 2 + OFFSETS[OFFSETS.length - 1]) {
      const start = vad.centre - WINDOW / 2;
      runModel(start);
      vad.state = "idle";
      vad.cooldownUntil = written + RATE * 0.15;
      if (listening) ui.state.textContent = "LISTENING";
    }
  }
}

// ---------------------------------------------------------------------------
// results
// ---------------------------------------------------------------------------
let lastWindow = null; // [start, end] absolute sample indices, for the waveform highlight

// ---- the little smart home --------------------------------------------------
const home = { light: false, level: 6, blinds: false, bot: { x: 4, y: 2, moving: true } };
const W = 9;
const H = 5;
const el = {
  lamp: $("#lamp"),
  lampState: $("#lamp-state"),
  blinds: $("#blinds"),
  blindsState: $("#blinds-state"),
  robotState: $("#robot-state"),
};

function renderHome() {
  el.lamp.classList.toggle("on", home.light);
  el.lamp.querySelector(".bulb").style.setProperty("--lvl", String(home.level));
  el.lampState.textContent = home.light ? `on · level ${home.level}` : "off";
  el.blinds.classList.toggle("open", home.blinds);
  el.blindsState.textContent = home.blinds ? "open" : "closed";
  ui.bot.style.left = `${(home.bot.x / W) * 100}%`;
  ui.bot.style.top = `${(home.bot.y / H) * 100}%`;
  ui.bot.classList.toggle("on", home.bot.moving);
  el.robotState.textContent = home.bot.moving ? "ready" : "stopped (say go)";
  ui.led.classList.toggle("on", home.light);
}
renderHome();

const bump = (node) => {
  if (reducedMotion) return;
  node.classList.remove("bump");
  void node.offsetWidth;
  node.classList.add("bump");
};

/** Apply a recognised command to the home. Returns a short description. */
function act(label) {
  const b = home.bot;
  const moves = { up: [0, -1], forward: [0, -1], down: [0, 1], backward: [0, 1], left: [-1, 0], right: [1, 0] };
  let what = "";
  if (label === "turn_on" || label === "on") {
    home.light = true;
    what = "Light on";
  } else if (label === "turn_off" || label === "off") {
    home.light = false;
    what = "Light off";
  } else if (DIGITS.includes(label)) {
    const n = DIGITS.indexOf(label);
    if (n === 0) {
      home.light = false;
      what = "Light off (zero)";
    } else {
      home.light = true;
      home.level = n;
      what = `Light level ${n}`;
    }
  } else if (label === "open") {
    home.blinds = true;
    what = "Blinds open";
  } else if (label === "close") {
    home.blinds = false;
    what = "Blinds closed";
  } else if (label === "stop") {
    b.moving = false;
    what = "Robot stopped";
  } else if (label === "go") {
    b.moving = true;
    what = "Robot ready";
  } else if (moves[label]) {
    if (!b.moving) {
      what = "Robot is stopped, say “go”";
    } else {
      const [dx, dy] = moves[label];
      const nx = Math.max(0, Math.min(W - 1, b.x + dx));
      const ny = Math.max(0, Math.min(H - 1, b.y + dy));
      if (nx === b.x && ny === b.y) bump(ui.bot);
      b.x = nx;
      b.y = ny;
      what = `Robot ${label}`;
    }
  } else if (label === "yes") {
    what = "Confirmed";
  } else if (label === "no") {
    what = "Cancelled";
  }
  renderHome();
  return what;
}

const msSamples = [];
const pretty = (l) => l.replace("_", " ");

function runModel(start) {
  let res;
  try {
    // average the class probabilities over slightly shifted windows
    const sum = new Float64Array(labels.length);
    let ms = 0;
    for (const o of OFFSETS) {
      const r = classify(read(start + o, WINDOW));
      ms += r.ms;
      r.scores.forEach((x, i) => (sum[i] += x.score));
    }
    res = { scores: labels.map((label, i) => ({ label, score: sum[i] / OFFSETS.length })), ms };
  } catch (err) {
    setStatus(`The model failed to run: ${err.message}`, true);
    return;
  }
  lastWindow = [start, start + WINDOW];
  msSamples.push(res.ms);
  const avg = msSamples.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, msSamples.length);
  ui.factMs.textContent = `${avg < 10 ? avg.toFixed(1) : Math.round(avg)} ms`;

  const sorted = [...res.scores].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const sure = top.score >= MIN_CONFIDENCE;
  const command = sure && !IGNORE.has(top.label);

  // top-N bars
  [...ui.bars.children].forEach((row, i) => {
    const { label, score } = sorted[i];
    row.querySelector(".name").textContent = pretty(label);
    row.querySelector(".fill").style.width = `${(score * 100).toFixed(1)}%`;
    row.querySelector(".pct").textContent = `${Math.round(score * 100)}%`;
    row.classList.toggle("best", command && i === 0);
  });

  // OLED
  const guess = !IGNORE.has(top.label) ? `${pretty(top.label).toUpperCase()}?` : "??";
  ui.word.textContent = command ? pretty(top.label).toUpperCase() : sure && top.label === "noise" ? "..." : guess;
  ui.conf.textContent = `avg ${Math.round(top.score * 100)}%`;
  ui.time.textContent = `${res.ms < 10 ? res.ms.toFixed(1) : Math.round(res.ms)} ms`;
  if (!reducedMotion) {
    ui.word.classList.remove("flash");
    void ui.word.offsetWidth;
    ui.word.classList.add("flash");
  }

  // history (skip plain background noise)
  if (sure && top.label === "noise") {
    setStatus("That sounded like background noise. Say a command.");
    return;
  }
  ui.history.querySelector(".empty")?.remove();
  const li = document.createElement("li");
  if (command) li.innerHTML = `${pretty(top.label)}<small>${Math.round(top.score * 100)}%</small>`;
  else {
    li.className = "unsure";
    li.innerHTML = sure
      ? `not a command`
      : `not sure<small>${pretty(top.label)}? ${Math.round(top.score * 100)}%</small>`;
  }
  ui.history.prepend(li);
  while (ui.history.children.length > 12) ui.history.lastChild.remove();

  if (command) {
    const what = act(top.label);
    setStatus(`Heard “${pretty(top.label)}”${what ? `: ${what}` : ""}.`);
  } else if (sure) {
    setStatus("That didn't sound like one of the commands. Try “turn on”, “open” or “left”.");
  } else {
    setStatus(
      IGNORE.has(top.label)
        ? "Not sure what that was. Say one command clearly, like “turn on” or “close”."
        : `Best guess “${pretty(top.label)}” (${Math.round(top.score * 100)}%), not sure enough to act. Say it again, a little closer to the mic.`,
    );
  }
}

// ---------------------------------------------------------------------------
// waveform + level meter
// ---------------------------------------------------------------------------
const g = ui.wave.getContext("2d");
const SHOWN = RATE * 2.5;

function draw() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.round(ui.wave.clientWidth * dpr);
  const h = Math.round(ui.wave.clientHeight * dpr);
  if (ui.wave.width !== w || ui.wave.height !== h) {
    ui.wave.width = w;
    ui.wave.height = h;
  }
  g.clearRect(0, 0, w, h);
  const startIdx = written - SHOWN;

  // the 1 s window the model analysed
  if (lastWindow && lastWindow[1] > startIdx) {
    const x0 = ((lastWindow[0] - startIdx) / SHOWN) * w;
    const x1 = ((lastWindow[1] - startIdx) / SHOWN) * w;
    g.fillStyle = "rgba(255, 92, 138, 0.14)";
    g.fillRect(x0, 0, x1 - x0, h);
    g.strokeStyle = "rgba(255, 92, 138, 0.6)";
    g.lineWidth = dpr;
    g.strokeRect(x0, 0.5, x1 - x0, h - 1);
  }

  // centre line
  g.fillStyle = "rgba(255,255,255,0.08)";
  g.fillRect(0, h / 2, w, dpr);

  // min/max envelope per pixel column
  const per = SHOWN / w;
  const grad = g.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, "rgba(144,133,233,0.5)");
  grad.addColorStop(1, "rgba(47,224,160,1)");
  g.fillStyle = grad;
  for (let x = 0; x < w; x++) {
    const a = Math.floor(startIdx + x * per);
    let lo = 0;
    let hi = 0;
    for (let i = a; i < a + per; i += 4) {
      if (i < 0 || i >= written || i < written - RING) continue;
      const v = ring[i % RING];
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    const y0 = h / 2 - Math.min(1, hi * 2.5) * (h / 2);
    const y1 = h / 2 - Math.min(1, lo * 2.5) * (h / 2);
    g.fillRect(x, y0, 1, Math.max(dpr, y1 - y0));
  }

  ui.meter.style.width = listening ? `${Math.min(100, (vad.level / 0.15) * 100)}%` : "0";
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// ---------------------------------------------------------------------------
// boot
// ---------------------------------------------------------------------------
if (!navigator.mediaDevices?.getUserMedia) {
  setStatus("This browser can't access a microphone. Try Chrome, Edge, Firefox or Safari over HTTPS.", true);
  ui.btn.disabled = true;
}

loadModel()
  .then(() => {
    if (navigator.mediaDevices?.getUserMedia) {
      ui.btn.disabled = false;
      setStatus("Model loaded (119 KB). Press Start listening and allow the microphone.");
    }
  })
  .catch((err) => {
    ui.btn.disabled = true;
    setStatus(`Couldn't load the model: ${err.message}`, true);
  });
ui.btn.disabled = true;

// Test hook: feed a clip through the exact same pipeline (used for automated checks).
window.voiceDemo = {
  feed(float32At16k) {
    const pad = new Float32Array(RATE * 0.4);
    push(pad);
    push(float32At16k);
    push(new Float32Array(RATE * 1.2));
  },
  get labels() {
    return labels;
  },
};
