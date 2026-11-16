# prithvihl.github.io

Personal portfolio of **Prithvi**: AI/ML engineer building LLM
systems, RAG and observability tools, and medical AI.

**Live site:** https://prithvihl.github.io

## What's here

- `index.html`, `styles.css`: page structure and styles.
- `data.js`: **all content**: profile, projects (with case-study details,
  metrics and architecture flow), journey, skills, certifications. Edit this
  file to update the site.
- `scene.js`: the WebGL background. About 5,000 particles (2,200 on phones)
  morph between a neural sphere, a heart, a DNA helix, a signal wave, a spiral
  galaxy and a torus knot as you scroll, with an ECG-style pulse.
- `main.js`: interactions: hero intro, project filters, 3D card tilt, case-study
  dialogs with animated flows (deep links like `#project/spanscope`), timeline,
  draggable skills sphere, scroll reveals.

No build step and no dependencies to install: Three.js loads from a CDN, pinned
to a fixed version. Respects `prefers-reduced-motion`, and falls back to a
static gradient without WebGL.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. (Opening `index.html` directly won't work,
because browsers block ES modules from `file://`.)
