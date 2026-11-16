import { CATEGORIES, CERTIFICATIONS, JOURNEY, PROFILE, PROJECTS, SKILLS } from "./data.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

// ---------------------------------------------------------------------------
// 3D background (loaded lazily so the page renders even if the CDN is slow)
// ---------------------------------------------------------------------------
const sections = $$("main > section");
let scene = null;
import("./scene.js")
  .then(({ startScene }) => {
    scene = startScene($("#scene"), sections, { reducedMotion });
  })
  .catch(() => {
    /* no WebGL / CDN blocked: the CSS gradient background stays */
  });

// ---------------------------------------------------------------------------
// hero
// ---------------------------------------------------------------------------
{
  const nameEl = $("#hero-name");
  let i = 0;
  nameEl.innerHTML = PROFILE.name
    .split(" ")
    .map(
      (word) =>
        `<span style="white-space:nowrap">${[...word]
          .map((ch) => `<span class="ch" style="--i:${i++}">${esc(ch)}</span>`)
          .join("")}</span>`,
    )
    .join('<span class="sp"> </span>');
  nameEl.setAttribute("aria-label", PROFILE.name);

  $("#headline").innerHTML = esc(PROFILE.headline)
    .split(" | ")
    .map((part) => part.replace(" // ", ' <span class="sep">//</span> '))
    .join(' <span class="sep">|</span> ');
}

// typing roles
{
  const el = $("#typed");
  if (reducedMotion) {
    el.textContent = PROFILE.roles[0];
  } else {
    let r = 0;
    let c = 0;
    let deleting = false;
    const tick = () => {
      const word = PROFILE.roles[r];
      c += deleting ? -1 : 1;
      el.textContent = word.slice(0, c);
      let delay = deleting ? 35 : 70;
      if (!deleting && c === word.length) {
        deleting = true;
        delay = 1800;
      } else if (deleting && c === 0) {
        deleting = false;
        r = (r + 1) % PROFILE.roles.length;
        delay = 350;
      }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 1400);
  }
}

// ---------------------------------------------------------------------------
// about
// ---------------------------------------------------------------------------
$("#about-text").innerHTML = PROFILE.about.map((p, i) => `<p data-reveal style="--d:${i + 1}">${esc(p)}</p>`).join("");
$("#stats").innerHTML = PROFILE.stats
  .map(
    (s, i) =>
      `<div class="stat" data-reveal style="--d:${i + 2}"><b data-count="${s.value}" data-suffix="${esc(s.suffix)}">0${esc(s.suffix)}</b><span>${esc(s.label)}</span></div>`,
  )
  .join("");
$("#status").textContent = PROFILE.status;
$("#year").textContent = new Date().getFullYear();

function countUp(el) {
  const to = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  if (reducedMotion) {
    el.textContent = to + suffix;
    return;
  }
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 1400);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suffix;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------------------------------------------------------------------------
// projects
// ---------------------------------------------------------------------------
const initials = (t) =>
  t
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const isLive = (p) => !!p.links.demo;

$("#filters").innerHTML = CATEGORIES.map((c) => {
  const n = c.id === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.category === c.id).length;
  return `<button role="tab" data-filter="${c.id}" aria-selected="${c.id === "all"}">${esc(c.label)}<span class="count">${n}</span></button>`;
}).join("");

$("#project-grid").innerHTML = PROJECTS.map(
  (p, i) => `
  <button class="pcard" data-id="${p.id}" data-cat="${p.category}" style="--accent:${p.accent};--d:${i % 3}" data-reveal aria-label="Open ${esc(p.title)} case study">
    <div class="pcard-top">
      <span class="pcard-icon">${esc(initials(p.title))}</span>
      <span class="badge${isLive(p) ? " live" : ""}">${isLive(p) ? "Live demo" : esc(CATEGORIES.find((c) => c.id === p.category).label)}</span>
    </div>
    <h3>${esc(p.title)}</h3>
    <p class="tagline">${esc(p.tagline)}</p>
    <p class="summary">${esc(p.summary)}</p>
    <div class="chips">${p.stack
      .slice(0, 4)
      .map((s) => `<span class="chip">${esc(s)}</span>`)
      .join("")}</div>
    <span class="open">View case study <i>→</i></span>
  </button>`,
).join("");

// filtering with a little shuffle animation
$("#filters").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-filter]");
  if (!btn) return;
  const f = btn.dataset.filter;
  $$("#filters button").forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
  let k = 0;
  $$(".pcard").forEach((card) => {
    const show = f === "all" || card.dataset.cat === f;
    card.classList.toggle("hide", !show);
    if (show && !reducedMotion) {
      card.animate(
        [
          { opacity: 0, transform: "translateY(24px) rotateX(12deg) scale(0.96)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 550, delay: k++ * 60, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" },
      );
    }
  });
  scene?.measure();
});

// 3D tilt + glare
function addTilt(el, max = 10) {
  if (!finePointer || reducedMotion) return;
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateY(${(px - 0.5) * max * 2}deg) rotateX(${(0.5 - py) * max * 2}deg) translateZ(0)`;
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  });
  el.addEventListener("pointerleave", () => {
    el.style.transform = "";
  });
}
$$(".pcard").forEach((c) => addTilt(c, 9));
$$("[data-tilt]").forEach((c) => addTilt(c, 7));

// ---------------------------------------------------------------------------
// case study modal
// ---------------------------------------------------------------------------
const modal = $("#modal");
const panel = $("#modal-panel");
let lastFocus = null;

function flowSvg(steps, vertical) {
  const n = steps.length;
  const nodeW = vertical ? 260 : 164;
  const nodeH = 62;
  if (vertical) {
    const gap = 36;
    const W = 320;
    const H = n * nodeH + (n - 1) * gap;
    const x = (W - nodeW) / 2;
    const ys = steps.map((_, i) => i * (nodeH + gap));
    const path = `M${W / 2} ${nodeH / 2} L${W / 2} ${ys[n - 1] + nodeH / 2}`;
    return svgBody(W, H, path, steps.map((s, i) => [x, ys[i]]), nodeW, nodeH, steps);
  }
  const W = 960;
  const H = nodeH + 20;
  const step = (W - nodeW) / (n - 1);
  const pos = steps.map((_, i) => [i * step, 10]);
  const path = `M${nodeW / 2} ${10 + nodeH / 2} L${pos[n - 1][0] + nodeW / 2} ${10 + nodeH / 2}`;
  return svgBody(W, H, path, pos, nodeW, nodeH, steps);
}

function svgBody(W, H, path, pos, nodeW, nodeH, steps) {
  const packets = reducedMotion
    ? ""
    : [0, 1, 2]
        .map(
          (k) =>
            `<circle class="packet" r="5"><animateMotion dur="3s" begin="${k}s" repeatCount="indefinite" path="${path}"/></circle>`,
        )
        .join("");
  const nodes = steps
    .map(
      // Position on the outer group; the entrance animation on the inner one
      // (a CSS transform would otherwise replace the SVG translate).
      (s, i) => `<g transform="translate(${pos[i][0]} ${pos[i][1]})"><g class="node" style="--i:${i}">
        <rect width="${nodeW}" height="${nodeH}" rx="14"/>
        <text class="step" x="14" y="22">0${i + 1}</text>
        <text x="14" y="44">${esc(s)}</text>
      </g></g>`,
    )
    .join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Architecture: ${esc(steps.join(" → "))}">
    <path class="wire" d="${path}"/>${packets}${nodes}</svg>`;
}

function linkButtons(p) {
  const out = [];
  if (p.links.demo) out.push(`<a class="btn btn-primary" href="${p.links.demo}" target="_blank" rel="noopener">▶ Try the live demo</a>`);
  if (p.links.video) out.push(`<a class="btn btn-primary" href="${p.links.video}" target="_blank" rel="noopener">▶ Watch the demo</a>`);
  if (p.links.code) out.push(`<a class="btn" href="${p.links.code}" target="_blank" rel="noopener">View the code</a>`);
  if (!out.length) out.push(`<span class="badge">Research / private code</span>`);
  return out.join("");
}

function openProject(id, push = true) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return;
  lastFocus = document.activeElement;
  const vertical = innerWidth < 720;
  panel.style.setProperty("--accent", p.accent);
  panel.innerHTML = `
    <button class="modal-close" data-close aria-label="Close">×</button>
    <header class="m-head">
      <p class="tagline">${esc(p.tagline)}</p>
      <h2 id="modal-title">${esc(p.title)}</h2>
      <p>${esc(p.details)}</p>
      <div class="m-links">${linkButtons(p)}</div>
    </header>
    <section class="m-section">
      <h3>Results</h3>
      <div class="metrics">${p.metrics
        .map((m, i) => `<div class="metric" style="--i:${i}"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`)
        .join("")}</div>
    </section>
    <section class="m-section">
      <h3>How it flows</h3>
      <div class="flow">${flowSvg(p.flow, vertical)}</div>
      <p class="flow-caption">Data moves left to right through each stage.</p>
    </section>
    <section class="m-section">
      <h3>Highlights</h3>
      <ul class="highlights">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
    </section>
    <section class="m-section">
      <h3>Stack</h3>
      <div class="chips">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div>
    </section>`;
  if (vertical) $(".flow-caption", panel).textContent = "Data moves top to bottom through each stage.";
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  panel.scrollTop = 0;
  panel.focus();
  if (push) history.pushState({ project: id }, "", `#project/${id}`);
}

function closeProject(pop = true) {
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.style.overflow = "";
  lastFocus?.focus?.();
  if (pop && location.hash.startsWith("#project/")) history.pushState({}, "", "#projects");
}

$("#project-grid").addEventListener("click", (e) => {
  const card = e.target.closest(".pcard");
  if (card) openProject(card.dataset.id);
});
modal.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) closeProject();
});
document.addEventListener("keydown", (e) => {
  if (modal.hidden) return;
  if (e.key === "Escape") closeProject();
  if (e.key === "Tab") {
    // keep focus inside the dialog
    const f = $$("a[href], button", panel);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
const fromHash = () => {
  const m = location.hash.match(/^#project\/([\w-]+)/);
  if (m) openProject(m[1], false);
  else closeProject(false);
};
addEventListener("popstate", fromHash);
fromHash();

// ---------------------------------------------------------------------------
// journey
// ---------------------------------------------------------------------------
$("#timeline").insertAdjacentHTML(
  "beforeend",
  JOURNEY.map(
    (j) => `<div class="tl-item" data-reveal><div class="tl-card">
      <span class="when">${esc(j.when)}</span><h3>${esc(j.title)}</h3>
      <p class="org">${esc(j.org)}</p><p>${esc(j.text)}</p></div></div>`,
  ).join(""),
);
$("#certs").innerHTML = CERTIFICATIONS.map((c) => `<span class="cert">${esc(c)}</span>`).join("");

// ---------------------------------------------------------------------------
// skills: draggable 3D tag sphere
// ---------------------------------------------------------------------------
{
  const box = $("#tag-sphere");
  box.innerHTML = SKILLS.map((s) => `<span class="tag">${esc(s)}</span>`).join("");
  const tags = $$(".tag", box);
  const n = tags.length;
  const pts = tags.map((_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.399963229728653;
    return [Math.cos(th) * r, y, Math.sin(th) * r];
  });
  let ax = 0.3;
  let ay = 0;
  let vx = 0.0016;
  let vy = 0.004;
  let dragging = false;
  let last = null;
  let visible = false;
  box.addEventListener("pointerdown", (e) => {
    dragging = true;
    last = [e.clientX, e.clientY];
    box.setPointerCapture(e.pointerId);
  });
  box.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    vy = (e.clientX - last[0]) * 0.0009;
    vx = (e.clientY - last[1]) * -0.0009;
    last = [e.clientX, e.clientY];
  });
  const stop = () => (dragging = false);
  box.addEventListener("pointerup", stop);
  box.addEventListener("pointercancel", stop);
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(box);

  const draw = () => {
    const R = Math.min(box.clientWidth, box.clientHeight) * 0.42;
    const cx = Math.cos(ax);
    const sx = Math.sin(ax);
    const cy = Math.cos(ay);
    const sy = Math.sin(ay);
    tags.forEach((t, i) => {
      const [x0, y0, z0] = pts[i];
      const x1 = x0 * cy + z0 * sy;
      const z1 = -x0 * sy + z0 * cy;
      const y2 = y0 * cx - z1 * sx;
      const z2 = y0 * sx + z1 * cx;
      const s = (z2 + 2.2) / 3.2;
      t.style.transform = `translate(-50%, -50%) translate3d(${x1 * R}px, ${y2 * R}px, 0) scale(${s})`;
      t.style.opacity = String(0.25 + ((z2 + 1) / 2) * 0.75);
      t.style.zIndex = String(Math.round(z2 * 100) + 100);
      t.style.color = z2 > 0.4 ? "var(--ink)" : "var(--ink-3)";
    });
  };
  const loop = () => {
    if (visible || dragging) {
      if (!dragging) {
        vx += (0.0016 - vx) * 0.02;
        vy += (0.004 - vy) * 0.02;
      }
      ax += reducedMotion ? 0 : vx;
      ay += reducedMotion ? 0 : vy;
      draw();
    }
    requestAnimationFrame(loop);
  };
  draw();
  loop();
}

// ---------------------------------------------------------------------------
// scroll: reveals, count-ups, nav state, progress, timeline fill
// ---------------------------------------------------------------------------
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      // Drop the stagger delay once revealed, so hover effects (tilt) respond instantly.
      setTimeout(() => (en.target.style.transitionDelay = "0s"), 1400);
      $$("[data-count]", en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
);
$$(".section-title, .section-sub, .eyebrow, .filters, .photo-card, .contact-links, .cert-list, .tag-sphere").forEach((el) =>
  el.setAttribute("data-reveal", ""),
);
$$("[data-reveal]").forEach((el) => io.observe(el));

const navLinks = $$(".nav nav a");
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  $("#progress").style.width = `${(scrollY / Math.max(1, max)) * 100}%`;
  let current = "";
  for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.45) current = s.id;
  navLinks.forEach((a) => a.classList.toggle("active", a.dataset.section === current));

  const tl = $("#timeline");
  const r = tl.getBoundingClientRect();
  const k = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
  $("#timeline-fill").style.height = `${k * 100}%`;
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------------------------------------------------------------------------
// pointer niceties (desktop only)
// ---------------------------------------------------------------------------
if (finePointer && !reducedMotion) {
  const glow = $(".cursor-glow");
  addEventListener("pointermove", (e) => {
    glow.style.opacity = "1";
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });
  $$("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.12}px, ${dy * 0.12}px)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });
}
