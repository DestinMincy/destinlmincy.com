(function () {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let W, H, nodes, mouse;
  const NODE_COUNT_BASE = 120;
  const CONNECTION_DIST = 160;
  const MOUSE_RADIUS = 200;

  const BLUE   = { r: 39,  g: 118, b: 234 };
  const GOLD   = { r: 255, g: 215, b: 0   };
  const SILVER = { r: 192, g: 192, b: 192 };
  const palette = [BLUE, BLUE, BLUE, GOLD, SILVER, SILVER];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function hexPath(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  class Node {
    constructor() {
      this.reset();
      this.x = Math.random() * W;
      this.y = Math.random() * H;
    }

    reset() {
      this.x           = Math.random() * W;
      this.y           = Math.random() * H;
      this.vx          = (Math.random() - 0.5) * 0.4;
      this.vy          = (Math.random() - 0.5) * 0.4;
      const c          = palette[Math.floor(Math.random() * palette.length)];
      this.color       = c;
      this.radius      = Math.random() * 2 + 1;
      this.isHex       = Math.random() < 0.3;
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.hexSize     = this.radius * 2.5 + Math.random() * 2;
    }

    update() {
      if (mouse) {
        const dx   = this.x - mouse.x;
        const dy   = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
          this.vx += dx * force;
          this.vy += dy * force;
        }
      }

      this.vx *= 0.99;
      this.vy *= 0.99;
      this.x  += this.vx;
      this.y  += this.vy;

      if (this.x < -50)      this.x = W + 50;
      if (this.x > W + 50)   this.x = -50;
      if (this.y < -50)      this.y = H + 50;
      if (this.y > H + 50)   this.y = -50;
    }

    draw(t) {
      const pulse      = Math.sin(t * 0.002 + this.pulseOffset) * 0.3 + 0.7;
      const { r, g, b } = this.color;

      if (this.isHex) {
        hexPath(ctx, this.x, this.y, this.hexSize * pulse);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.5 * pulse})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
        ctx.fillStyle   = `rgba(${r},${g},${b},${0.08 * pulse})`;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.7 * pulse})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 3 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${0.06 * pulse})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    const count = Math.floor(NODE_COUNT_BASE * (W * H) / (1920 * 1080));
    nodes = Array.from({ length: Math.max(40, Math.min(count, 200)) }, () => new Node());
    mouse = null;
  }

  function drawConnections(t) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.25;
          const pulse   = Math.sin(t * 0.001 + i * 0.1) * 0.1 + 0.9;
          const ci = nodes[i].color;
          const cj = nodes[j].color;
          const mr = (ci.r + cj.r) / 2;
          const mg = (ci.g + cj.g) / 2;
          const mb = (ci.b + cj.b) / 2;

          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${mr},${mg},${mb},${opacity * pulse})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();

          if (dist < CONNECTION_DIST * 0.4 && Math.random() < 0.003) {
            const mx = (nodes[i].x + nodes[j].x) / 2;
            const my = (nodes[i].y + nodes[j].y) / 2;
            ctx.beginPath();
            ctx.arc(mx, my, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${mr},${mg},${mb},0.6)`;
            ctx.fill();
          }
        }
      }
    }
  }

  function drawDataPulses(t) {
    const pulseCount = 5;
    for (let p = 0; p < pulseCount; p++) {
      const progress = ((t * 0.0003 + p / pulseCount) % 1);
      const i        = Math.floor(p * nodes.length / pulseCount) % nodes.length;
      let closest    = -1;
      let minDist    = CONNECTION_DIST;
      for (let j = 0; j < nodes.length; j++) {
        if (j === i) continue;
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) { minDist = dist; closest = j; }
      }
      if (closest >= 0) {
        const px = nodes[i].x + (nodes[closest].x - nodes[i].x) * progress;
        const py = nodes[i].y + (nodes[closest].y - nodes[i].y) * progress;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,215,0,${0.8 * (1 - progress)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,215,0,${0.15 * (1 - progress)})`;
        ctx.fill();
      }
    }
  }

  function animate(t) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ctx.clearRect(0, 0, W, H);
    for (const node of nodes) node.update();
    drawConnections(t);
    for (const node of nodes) node.draw(t);
    drawDataPulses(t);
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    const count  = Math.floor(NODE_COUNT_BASE * (W * H) / (1920 * 1080));
    const target = Math.max(40, Math.min(count, 200));
    while (nodes.length < target) nodes.push(new Node());
    while (nodes.length > target) nodes.pop();
  });

  window.addEventListener('mousemove', e => {
    mouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseleave', () => { mouse = null; });

  window.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      mouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener('touchend', () => { mouse = null; });

  init();
  requestAnimationFrame(animate);
})();

/* Mobile nav toggle */
(function () {
  const btn = document.querySelector('.site-nav__toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
  });
})();
