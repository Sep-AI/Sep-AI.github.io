// ---- Planet ladder -------------------------------------------------------
const TIERS = [
  ["Asteroid",      "asteroid",      10,    "#b8bcc8"],
  ["Moon",          "moon",          30,    "#d8dbe6"],
  ["Small Planet",  "small_planet",  60,    "#4fa8ff"],
  ["Gas Giant",     "gas_giant",     120,   "#a86bff"],
  ["Ringed Planet", "ringed_planet", 250,   "#3fe0a0"],
  ["Sun",           "sun",           500,   "#ffb52e"],
  ["Pulsar",        "pulsar",        1000,  "#4fc3ff"],
  ["Neutron Star",  "neutron_star",  2000,  "#ff6a2e"],
  ["Quasar",        "quasar",        4000,  "#ff5ad0"],
  ["Galaxy",        "galaxy",        8000,  "#c38bff"],
  ["Black Hole",    "black_hole",    16000, "#b57bff"],
];

const ladder = document.getElementById("ladder");
TIERS.forEach(([name, file, pts, glow], i) => {
  const li = document.createElement("li");
  if (i === TIERS.length - 1) li.className = "final";
  li.style.setProperty("--glow", glow);
  const size = Math.round(46 + (i / (TIERS.length - 1)) * 74); // 46px -> 120px
  li.innerHTML =
    `<div class="body"><img src="assets/planets/${file}.webp" alt="" width="${size}" height="${size}" loading="lazy"></div>` +
    `<b>${name}</b><small>+${pts.toLocaleString("en-US")} pts</small>`;
  ladder.appendChild(li);
});

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const items = [...ladder.children];
    items.forEach((li, i) => setTimeout(() => li.classList.add("in"), i * 70));
    io.disconnect();
  });
}, { threshold: 0.15 });
io.observe(ladder);

// ---- Starfield -----------------------------------------------------------
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let stars = [], w = 0, h = 0, dpr = 1, scrollY = 0, shooting = null;

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  w = innerWidth; h = innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.round((w * h) / 2600);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.3 + 0.2,
    depth: Math.random() * 0.6 + 0.1,
    tw: Math.random() * Math.PI * 2,
    sp: Math.random() * 0.02 + 0.005,
    hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? "255,214,140" : "170,200,255") : "255,255,255",
  }));
}

function frame() {
  ctx.clearRect(0, 0, w, h);
  for (const s of stars) {
    s.tw += s.sp;
    const a = 0.35 + Math.sin(s.tw) * 0.35 + 0.3;
    let y = (s.y - scrollY * s.depth * 0.25) % h;
    if (y < 0) y += h;
    ctx.beginPath();
    ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.hue},${a})`;
    ctx.fill();
  }
  if (!shooting && Math.random() < 0.004) {
    shooting = { x: Math.random() * w, y: Math.random() * h * 0.5, vx: 9 + Math.random() * 5, vy: 3 + Math.random() * 2, life: 1 };
  }
  if (shooting) {
    const s = shooting;
    const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 10, s.y - s.vy * 10);
    g.addColorStop(0, `rgba(255,230,170,${s.life})`);
    g.addColorStop(1, "rgba(255,230,170,0)");
    ctx.strokeStyle = g; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 10, s.y - s.vy * 10); ctx.stroke();
    s.x += s.vx; s.y += s.vy; s.life -= 0.02;
    if (s.life <= 0) shooting = null;
  }
  if (!reduced) requestAnimationFrame(frame);
}

addEventListener("resize", resize);
addEventListener("scroll", () => { scrollY = window.scrollY; if (reduced) frame(); }, { passive: true });
resize();
frame();
