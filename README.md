# prithvihl.github.io

Personal portfolio of **Prithvi**: AI/ML engineer building LLM
systems, RAG and observability tools, and medical AI.

**Live site:** https://prithvihl.github.io

## What's here

- `index.html`, `styles.css`: page structure and styles.
- `data.js`: **all content**: profile, projects (with project details,
  metrics and architecture flow), journey, skills, certifications. Edit this
  file to update the site.
- `scene.js`: the WebGL background. About 5,000 particles (2,200 on phones)
  morph between a neural sphere, a heart, a DNA helix, a signal wave, a spiral
  galaxy and a torus knot as you scroll, with an ECG-style pulse.
- `main.js`: interactions: hero intro, project filters, 3D card tilt, project detail
  dialogs with animated flows (deep links like `#project/spanscope`), timeline,
  draggable skills sphere, scroll reveals.

- `voice/`: live TinyML demo. The ESP32 keyword-spotting model compiled to
  WebAssembly, with microphone capture, speech detection and an OLED-style
  readout. See `voice/model/README.md` for how the model was built.

No build step and no dependencies to install: Three.js loads from a CDN, pinned
to a fixed version. Respects `prefers-reduced-motion`, and falls back to a
static gradient without WebGL.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. (Opening `index.html` directly won't work,
because browsers block ES modules from `file://`.)

## Project descriptions updated — November 16, 2026

LeaveNow reflects Gainesville RTS, direct-first trip recommendations, direction-verified live buses, address/GPS input, GTFS route shapes, and its current deployed branch. CodeAtlas distinguishes the hosted Groq app from the local experimental LangGraph engine and labels its development pilot. Existing design, contact details, other project entries, and the TinyML voice demo are preserved.

## CodeAtlas evaluation documented

The CodeAtlas card now links to the reproducible web evaluation and displays 96.6% exact-source recovery (281/291 parser-checked lookups), +16.2% MRR@10 for the AST + BM25 component on 5,000 queries, and 3.6 ms local retrieval p95 excluding HTTP and LLM generation. Its detail panel also reports the full web pipeline’s lower MRR and keeps local semantic embeddings distinct from the hosted hashed-vector pipeline.

## LeaveNow OSM rollout — November 18, 2026

The project card and detail flow now describe bundled Gainesville OSM walking A*, combined stop/address autocomplete, conservative connection checks, and labelled fallback estimates. Historical availability/latency metrics are explicitly marked pre-OSM. The rollout passed 94 tests and both remote workflows; hosted startup verified mapped access walks. [Implementation, licensing, coverage and deployment evidence](https://github.com/PrithviHL/LeaveNow-Real-Time-Bus-Location-Tracking-and-Smart-Departure-Prediction/blob/feature/streamlit-containers/docs/walking-routing.md).
