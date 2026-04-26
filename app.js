// ASCII dust background + scroll-driven sections

const canvas = document.getElementById("ascii-bg");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
let particles = [];
const PARTICLE_COUNT = 240;
const CHARS = [".", "•", "*", "+", ":", "·"];
let mouse = { x: width / 2, y: height / 2, active: false };

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener("resize", resize);
resize();

function createParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      size: 10 + Math.random() * 6,
      alpha: 0.25 + Math.random() * 0.4
    });
  }
}
createParticles();

// --- CURSOR INTERACTION ---
canvas.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.active = true;
});

canvas.addEventListener("pointerleave", () => {
  mouse.active = false;
});

function updateParticles() {
  for (const p of particles) {
    // natural drift
    p.x += p.vx;
    p.y += p.vy;

    // --- STRONGER CURSOR REACTION ---
    if (mouse.active) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // attraction + slight repulsion for turbulence
      const force = Math.min(0.15 / dist, 0.035);

      p.vx += force * dx + (Math.random() - 0.5) * 0.05;
      p.vy += force * dy + (Math.random() - 0.5) * 0.05;

      // friction for smoother motion
      p.vx *= 0.94;
      p.vy *= 0.94;
    }

    // wrap edges
    if (p.x < -50) p.x = width + 50;
    if (p.x > width + 50) p.x = -50;
    if (p.y < -50) p.y = height + 50;
    if (p.y > height + 50) p.y = -50;
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  for (const p of particles) {
    ctx.globalAlpha = p.alpha;
    ctx.font = `${p.size}px "Courier New", monospace`;
    ctx.fillText(p.char, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

function loop() {
  updateParticles();
  drawParticles();
  requestAnimationFrame(loop);
}
loop();

// Scroll-driven reveal
const sections = document.querySelectorAll("[data-section]");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.25 }
);

sections.forEach((sec) => observer.observe(sec));
