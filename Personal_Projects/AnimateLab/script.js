/* ========================================
   Animation Explorer - Main Script
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Utility helpers ──
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Bind a slider/select to a value display and call an update fn
  function bindControl(inputId, displayId, suffix, updateFn) {
    const input = $(inputId);
    if (!input) return;
    const display = displayId ? $(displayId) : null;
    const handler = () => {
      if (display) display.textContent = input.value + (suffix || '');
      updateFn(input.value);
    };
    input.addEventListener('input', handler);
    handler(); // init
  }

  // ── Code Toggle Buttons ──
  $$('.code-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const panel = $('#' + btn.dataset.target);
      if (!panel) return;
      const willOpen = !panel.classList.contains('open');

      // Close all other panels first
      $$('.code-panel.open').forEach(p => {
        if (p !== panel) {
          p.classList.remove('open');
          const otherBtn = p.parentElement.querySelector('.code-toggle-btn');
          if (otherBtn) otherBtn.textContent = 'Show Code';
        }
      });

      panel.classList.toggle('open', willOpen);
      btn.textContent = willOpen ? 'Hide Code' : 'Show Code';
    });
  });

  // ── Code generation registry ──
  const codeGenerators = {};
  const defaultValues = {};

  function updateCode(cardName) {
    const gen = codeGenerators[cardName];
    if (!gen) return;
    const textarea = $(`#code-textarea-${cardName}`);
    if (textarea) textarea.value = gen();
  }

  // ── Apply / Reset buttons ──
  $$('.btn-apply').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.dataset.card;
      applyCustomCode(card);
    });
  });

  $$('.btn-reset').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.dataset.card;
      resetCard(card);
    });
  });

  function resetCard(cardName) {
    const defs = defaultValues[cardName];
    if (!defs) return;
    for (const [id, val] of Object.entries(defs)) {
      const el = $('#' + id);
      if (el) { el.value = val; el.dispatchEvent(new Event('input')); }
    }
  }

  // ============================================================
  //  1. CSS TRANSITIONS
  // ============================================================
  const transEl = $('#transition-el');

  defaultValues.transitions = {
    'ctrl-trans-duration': '0.5',
    'ctrl-trans-easing': 'ease',
    'ctrl-trans-scale': '1.3'
  };

  function updateTransitions() {
    const dur = $('#ctrl-trans-duration').value;
    const ease = $('#ctrl-trans-easing').value;
    const scale = $('#ctrl-trans-scale').value;
    transEl.style.transition = `all ${dur}s ${ease}`;
    // Update hover effect via CSS custom properties
    transEl.dataset.scale = scale;
    updateCode('transitions');
  }

  // On hover, apply transform from slider values
  const transPreview = $('#preview-transitions');
  transPreview.addEventListener('mouseenter', () => {
    const scale = transEl.dataset.scale || 1.3;
    transEl.style.transform = `scale(${scale}) rotate(10deg)`;
    transEl.style.borderRadius = '50%';
    transEl.style.boxShadow = '0 0 30px rgba(236,72,153,0.6)';
  });
  transPreview.addEventListener('mouseleave', () => {
    transEl.style.transform = '';
    transEl.style.borderRadius = '16px';
    transEl.style.boxShadow = '';
  });

  bindControl('#ctrl-trans-duration', '#val-trans-duration', 's', updateTransitions);
  bindControl('#ctrl-trans-easing', null, '', updateTransitions);
  bindControl('#ctrl-trans-scale', '#val-trans-scale', '', updateTransitions);

  codeGenerators.transitions = () => {
    const dur = $('#ctrl-trans-duration').value;
    const ease = $('#ctrl-trans-easing').value;
    const scale = $('#ctrl-trans-scale').value;
    return `.box {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ec4899, #f43f5e);
  transition: all ${dur}s ${ease};
}

.box:hover {
  transform: scale(${scale}) rotate(10deg);
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(236,72,153,0.6);
}`;
  };
  updateCode('transitions');

  // ============================================================
  //  2. KEYFRAME ANIMATIONS
  // ============================================================
  const kfEl = $('#keyframe-el');
  let kfStyleTag = document.createElement('style');
  document.head.appendChild(kfStyleTag);

  defaultValues.keyframes = {
    'ctrl-kf-duration': '1',
    'ctrl-kf-iterations': '3',
    'ctrl-kf-direction': 'normal'
  };

  function updateKeyframes() {
    const dur = $('#ctrl-kf-duration').value;
    const iter = $('#ctrl-kf-iterations').value;
    const dir = $('#ctrl-kf-direction').value;
    kfStyleTag.textContent = `
      .keyframe-box.playing {
        animation: bounce-spin ${dur}s ease-in-out ${iter} ${dir};
      }
    `;
    updateCode('keyframes');
  }

  // Click to trigger
  $('#preview-keyframes').addEventListener('click', () => {
    kfEl.classList.remove('playing');
    void kfEl.offsetWidth; // force reflow
    kfEl.classList.add('playing');
    const dur = parseFloat($('#ctrl-kf-duration').value);
    const iter = parseInt($('#ctrl-kf-iterations').value);
    setTimeout(() => kfEl.classList.remove('playing'), dur * iter * 1000 + 100);
  });

  bindControl('#ctrl-kf-duration', '#val-kf-duration', 's', updateKeyframes);
  bindControl('#ctrl-kf-iterations', '#val-kf-iterations', '', updateKeyframes);
  bindControl('#ctrl-kf-direction', null, '', updateKeyframes);

  codeGenerators.keyframes = () => {
    const dur = $('#ctrl-kf-duration').value;
    const iter = $('#ctrl-kf-iterations').value;
    const dir = $('#ctrl-kf-direction').value;
    return `@keyframes bounce-spin {
  0%   { transform: translateY(0) rotate(0deg); }
  25%  { transform: translateY(-40px) rotate(90deg); }
  50%  { transform: translateY(0) rotate(180deg); }
  75%  { transform: translateY(-20px) rotate(270deg); }
  100% { transform: translateY(0) rotate(360deg); }
}

.box {
  animation: bounce-spin ${dur}s ease-in-out ${iter} ${dir};
}`;
  };
  updateCode('keyframes');

  // ============================================================
  //  3. CSS TRANSFORMS
  // ============================================================
  const tfEl = $('#transform-el');

  defaultValues.transforms = {
    'ctrl-tf-rotate': '45',
    'ctrl-tf-scale': '1.2',
    'ctrl-tf-skew': '0'
  };

  function updateTransforms() {
    const rot = $('#ctrl-tf-rotate').value;
    const scale = $('#ctrl-tf-scale').value;
    const skew = $('#ctrl-tf-skew').value;
    tfEl.dataset.rot = rot;
    tfEl.dataset.scale = scale;
    tfEl.dataset.skew = skew;
    updateCode('transforms');
  }

  const tfPreview = $('#preview-transforms');
  tfPreview.addEventListener('mouseenter', () => {
    const rot = tfEl.dataset.rot || 45;
    const scale = tfEl.dataset.scale || 1.2;
    const skew = tfEl.dataset.skew || 0;
    tfEl.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
    tfEl.style.transform = `rotate(${rot}deg) scale(${scale}) skew(${skew}deg)`;
  });
  tfPreview.addEventListener('mouseleave', () => {
    tfEl.style.transform = '';
  });

  bindControl('#ctrl-tf-rotate', '#val-tf-rotate', 'deg', updateTransforms);
  bindControl('#ctrl-tf-scale', '#val-tf-scale', '', updateTransforms);
  bindControl('#ctrl-tf-skew', '#val-tf-skew', 'deg', updateTransforms);

  codeGenerators.transforms = () => {
    const rot = $('#ctrl-tf-rotate').value;
    const scale = $('#ctrl-tf-scale').value;
    const skew = $('#ctrl-tf-skew').value;
    return `.box {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.box:hover {
  transform: rotate(${rot}deg) scale(${scale}) skew(${skew}deg);
}`;
  };
  updateCode('transforms');

  // ============================================================
  //  4. HOVER EFFECTS
  // ============================================================
  const hoverEl = $('#hover-el');

  defaultValues.hover = {
    'ctrl-hover-glow': '20',
    'ctrl-hover-lift': '10',
    'ctrl-hover-color': '#06b6d4'
  };

  function updateHover() {
    const glow = $('#ctrl-hover-glow').value;
    const lift = $('#ctrl-hover-lift').value;
    const color = $('#ctrl-hover-color').value;
    hoverEl.dataset.glow = glow;
    hoverEl.dataset.lift = lift;
    hoverEl.dataset.color = color;
    hoverEl.style.background = `linear-gradient(135deg, ${color}, ${shiftColor(color, -30)})`;
    updateCode('hover');
  }

  function shiftColor(hex, amount) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  const hoverPreview = $('#preview-hover');
  hoverPreview.addEventListener('mouseenter', () => {
    const glow = hoverEl.dataset.glow || 20;
    const lift = hoverEl.dataset.lift || 10;
    const color = hoverEl.dataset.color || '#06b6d4';
    hoverEl.style.transform = `translateY(-${lift}px) scale(1.05)`;
    hoverEl.style.boxShadow = `0 ${lift}px ${glow}px ${color}80`;
  });
  hoverPreview.addEventListener('mouseleave', () => {
    hoverEl.style.transform = '';
    hoverEl.style.boxShadow = '';
  });

  bindControl('#ctrl-hover-glow', '#val-hover-glow', 'px', updateHover);
  bindControl('#ctrl-hover-lift', '#val-hover-lift', 'px', updateHover);
  bindControl('#ctrl-hover-color', null, '', updateHover);

  codeGenerators.hover = () => {
    const glow = $('#ctrl-hover-glow').value;
    const lift = $('#ctrl-hover-lift').value;
    const color = $('#ctrl-hover-color').value;
    return `.box {
  width: 100px;
  height: 80px;
  background: linear-gradient(135deg, ${color}, ${shiftColor(color, -30)});
  border-radius: 14px;
  transition: all 0.3s ease;
}

.box:hover {
  transform: translateY(-${lift}px) scale(1.05);
  box-shadow: 0 ${lift}px ${glow}px ${color}80;
}`;
  };
  updateCode('hover');

  // ============================================================
  //  5. CSS VARIABLES ANIMATION
  // ============================================================
  const cssvarRing = $('#cssvar-ring');
  const cssvarDot = $('#cssvar-dot');

  defaultValues.cssvars = {
    'ctrl-cssvar-hue': '140',
    'ctrl-cssvar-speed': '2',
    'ctrl-cssvar-size': '120'
  };

  function updateCSSVars() {
    const hue = $('#ctrl-cssvar-hue').value;
    const speed = $('#ctrl-cssvar-speed').value;
    const size = $('#ctrl-cssvar-size').value;
    const color = `hsl(${hue}, 70%, 55%)`;
    const colorLight = `hsl(${hue}, 70%, 70%)`;

    const preview = cssvarRing.parentElement;
    preview.style.width = size + 'px';
    preview.style.height = size + 'px';

    cssvarRing.style.borderColor = color;
    cssvarRing.style.animationDuration = speed + 's';
    cssvarDot.style.background = colorLight;
    updateCode('cssvars');
  }

  bindControl('#ctrl-cssvar-hue', '#val-cssvar-hue', '', updateCSSVars);
  bindControl('#ctrl-cssvar-speed', '#val-cssvar-speed', 's', updateCSSVars);
  bindControl('#ctrl-cssvar-size', '#val-cssvar-size', 'px', updateCSSVars);

  codeGenerators.cssvars = () => {
    const hue = $('#ctrl-cssvar-hue').value;
    const speed = $('#ctrl-cssvar-speed').value;
    const size = $('#ctrl-cssvar-size').value;
    return `:root {
  --hue: ${hue};
  --speed: ${speed}s;
  --size: ${size}px;
}

.ring {
  width: var(--size);
  height: var(--size);
  border: 6px solid hsl(var(--hue), 70%, 55%);
  border-radius: 50%;
  animation: pulse var(--speed) ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.6; }
}`;
  };
  updateCode('cssvars');

  // ============================================================
  //  6. SCROLL-DRIVEN ANIMATION
  // ============================================================
  const scrollContainer = $('#scroll-container');
  const scrollProgress = $('#scroll-progress');
  const scrollItems = scrollContainer ? scrollContainer.querySelectorAll('.scroll-reveal-item') : [];

  defaultValues.scroll = {
    'ctrl-scroll-easing': 'ease',
    'ctrl-scroll-offset': '30'
  };

  function updateScrollAnim() {
    const easing = $('#ctrl-scroll-easing').value;
    const offset = $('#ctrl-scroll-offset').value;
    scrollItems.forEach(item => {
      item.style.transitionTimingFunction = easing;
    });
    // Re-check visibility
    handleScroll();
    updateCode('scroll');
  }

  function handleScroll() {
    if (!scrollContainer) return;
    const offset = parseInt($('#ctrl-scroll-offset').value) || 30;
    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';

    const containerRect = scrollContainer.getBoundingClientRect();
    const threshold = containerRect.height * (offset / 100);

    scrollItems.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const relativeTop = itemRect.top - containerRect.top;
      if (relativeTop < containerRect.height - threshold) {
        item.classList.add('visible');
      } else {
        item.classList.remove('visible');
      }
    });
  }

  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll);
    handleScroll();
  }

  bindControl('#ctrl-scroll-easing', null, '', updateScrollAnim);
  bindControl('#ctrl-scroll-offset', '#val-scroll-offset', '%', updateScrollAnim);

  codeGenerators.scroll = () => {
    const easing = $('#ctrl-scroll-easing').value;
    const offset = $('#ctrl-scroll-offset').value;
    return `/* CSS */
.scroll-item {
  opacity: 0.3;
  transform: translateX(-20px);
  transition: all 0.4s ${easing};
}
.scroll-item.visible {
  opacity: 1;
  transform: translateX(0);
}

/* JavaScript */
container.addEventListener('scroll', () => {
  const threshold = container.clientHeight * ${offset / 100};
  items.forEach(item => {
    const top = item.getBoundingClientRect().top
                - container.getBoundingClientRect().top;
    if (top < container.clientHeight - threshold) {
      item.classList.add('visible');
    }
  });
});`;
  };
  updateCode('scroll');

  // ============================================================
  //  7. requestAnimationFrame - Orbital Motion
  // ============================================================
  const rafCanvas = $('#raf-canvas');
  let rafCtx, rafAnim;

  defaultValues.raf = {
    'ctrl-raf-speed': '2',
    'ctrl-raf-radius': '60',
    'ctrl-raf-trail': '0.15'
  };

  function initRAF() {
    if (!rafCanvas) return;
    rafCtx = rafCanvas.getContext('2d');
    resizeCanvas(rafCanvas);
    let angle = 0;

    function draw() {
      const speed = parseFloat($('#ctrl-raf-speed').value);
      const radius = parseFloat($('#ctrl-raf-radius').value);
      const trail = parseFloat($('#ctrl-raf-trail').value);
      const cx = rafCanvas.width / 2;
      const cy = rafCanvas.height / 2;

      // Trail effect
      rafCtx.fillStyle = `rgba(18, 18, 31, ${1 - trail})`;
      rafCtx.fillRect(0, 0, rafCanvas.width, rafCanvas.height);

      angle += speed * 0.02;

      // Draw orbiting dots
      for (let i = 0; i < 3; i++) {
        const a = angle + (i * Math.PI * 2 / 3);
        const x = cx + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius;
        const hue = (angle * 30 + i * 120) % 360;

        rafCtx.beginPath();
        rafCtx.arc(x, y, 8, 0, Math.PI * 2);
        rafCtx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        rafCtx.fill();

        // Glow
        rafCtx.beginPath();
        rafCtx.arc(x, y, 16, 0, Math.PI * 2);
        rafCtx.fillStyle = `hsla(${hue}, 80%, 60%, 0.2)`;
        rafCtx.fill();
      }

      // Center dot
      rafCtx.beginPath();
      rafCtx.arc(cx, cy, 4, 0, Math.PI * 2);
      rafCtx.fillStyle = '#fffffe';
      rafCtx.fill();

      rafAnim = requestAnimationFrame(draw);
    }
    draw();
  }

  bindControl('#ctrl-raf-speed', '#val-raf-speed', 'x', () => updateCode('raf'));
  bindControl('#ctrl-raf-radius', '#val-raf-radius', 'px', () => updateCode('raf'));
  bindControl('#ctrl-raf-trail', '#val-raf-trail', '', () => updateCode('raf'));

  codeGenerators.raf = () => {
    const speed = $('#ctrl-raf-speed').value;
    const radius = $('#ctrl-raf-radius').value;
    const trail = $('#ctrl-raf-trail').value;
    return `const ctx = canvas.getContext('2d');
let angle = 0;

function draw() {
  // Trail: lower alpha = longer trails
  ctx.fillStyle = 'rgba(18, 18, 31, ${1 - trail})';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  angle += ${speed} * 0.02;

  for (let i = 0; i < 3; i++) {
    const a = angle + (i * Math.PI * 2 / 3);
    const x = cx + Math.cos(a) * ${radius};
    const y = cy + Math.sin(a) * ${radius};

    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = \`hsl(\${(angle*30+i*120)%360}, 80%, 60%)\`;
    ctx.fill();
  }

  requestAnimationFrame(draw);
}
draw();`;
  };

  // ============================================================
  //  8. WEB ANIMATIONS API
  // ============================================================
  const waapiEl = $('#waapi-el');

  defaultValues.waapi = {
    'ctrl-waapi-duration': '1000',
    'ctrl-waapi-easing': 'ease',
    'ctrl-waapi-iterations': '2'
  };

  $('#preview-waapi').addEventListener('click', () => {
    const dur = parseInt($('#ctrl-waapi-duration').value);
    const ease = $('#ctrl-waapi-easing').value;
    const iter = parseInt($('#ctrl-waapi-iterations').value);

    waapiEl.animate([
      { transform: 'scale(1) rotate(0deg)', borderRadius: '16px' },
      { transform: 'scale(1.4) rotate(180deg)', borderRadius: '50%', offset: 0.5 },
      { transform: 'scale(1) rotate(360deg)', borderRadius: '16px' }
    ], {
      duration: dur,
      easing: ease,
      iterations: iter
    });
  });

  bindControl('#ctrl-waapi-duration', '#val-waapi-duration', 'ms', () => updateCode('waapi'));
  bindControl('#ctrl-waapi-easing', null, '', () => updateCode('waapi'));
  bindControl('#ctrl-waapi-iterations', '#val-waapi-iterations', '', () => updateCode('waapi'));

  codeGenerators.waapi = () => {
    const dur = $('#ctrl-waapi-duration').value;
    const ease = $('#ctrl-waapi-easing').value;
    const iter = $('#ctrl-waapi-iterations').value;
    return `element.animate([
  {
    transform: 'scale(1) rotate(0deg)',
    borderRadius: '16px'
  },
  {
    transform: 'scale(1.4) rotate(180deg)',
    borderRadius: '50%',
    offset: 0.5
  },
  {
    transform: 'scale(1) rotate(360deg)',
    borderRadius: '16px'
  }
], {
  duration: ${dur},
  easing: '${ease}',
  iterations: ${iter}
});`;
  };
  updateCode('waapi');

  // ============================================================
  //  9. CANVAS PARTICLES
  // ============================================================
  const partCanvas = $('#particles-canvas');
  let partCtx, partAnim;
  let particles = [];

  defaultValues.particles = {
    'ctrl-part-count': '60',
    'ctrl-part-speed': '1.5',
    'ctrl-part-size': '3',
    'ctrl-part-color': '#2dd4bf'
  };

  function initParticles() {
    if (!partCanvas) return;
    partCtx = partCanvas.getContext('2d');
    resizeCanvas(partCanvas);
    createParticles();

    function drawParticles() {
      const speed = parseFloat($('#ctrl-part-speed').value);
      const size = parseFloat($('#ctrl-part-size').value);
      const color = $('#ctrl-part-color').value;

      partCtx.fillStyle = 'rgba(18, 18, 31, 0.15)';
      partCtx.fillRect(0, 0, partCanvas.width, partCanvas.height);

      particles.forEach(p => {
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // Wrap around
        if (p.x < 0) p.x = partCanvas.width;
        if (p.x > partCanvas.width) p.x = 0;
        if (p.y < 0) p.y = partCanvas.height;
        if (p.y > partCanvas.height) p.y = 0;

        partCtx.beginPath();
        partCtx.arc(p.x, p.y, size * p.s, 0, Math.PI * 2);
        partCtx.fillStyle = color + alphaHex(p.a);
        partCtx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            partCtx.beginPath();
            partCtx.moveTo(particles[i].x, particles[i].y);
            partCtx.lineTo(particles[j].x, particles[j].y);
            partCtx.strokeStyle = color + alphaHex(0.15 * (1 - dist / 80));
            partCtx.lineWidth = 0.5;
            partCtx.stroke();
          }
        }
      }

      partAnim = requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  function createParticles() {
    if (!partCanvas) return;
    const count = parseInt($('#ctrl-part-count').value);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * partCanvas.width,
        y: Math.random() * partCanvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        s: Math.random() * 0.8 + 0.4,
        a: Math.random() * 0.5 + 0.5
      });
    }
  }

  function alphaHex(a) {
    return Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
  }

  // Click to burst
  if (partCanvas) {
    partCanvas.addEventListener('click', (e) => {
      const rect = partCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
          x: mx, y: my,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          s: Math.random() * 1.2 + 0.5,
          a: 1
        });
      }
    });
  }

  bindControl('#ctrl-part-count', '#val-part-count', '', (v) => { createParticles(); updateCode('particles'); });
  bindControl('#ctrl-part-speed', '#val-part-speed', 'x', () => updateCode('particles'));
  bindControl('#ctrl-part-size', '#val-part-size', 'px', () => updateCode('particles'));
  bindControl('#ctrl-part-color', null, '', () => updateCode('particles'));

  codeGenerators.particles = () => {
    const count = $('#ctrl-part-count').value;
    const speed = $('#ctrl-part-speed').value;
    const size = $('#ctrl-part-size').value;
    const color = $('#ctrl-part-color').value;
    return `const particles = [];
for (let i = 0; i < ${count}; i++) {
  particles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    size: Math.random() * 0.8 + 0.4
  });
}

function draw() {
  ctx.fillStyle = 'rgba(18, 18, 31, 0.15)';
  ctx.fillRect(0, 0, w, h);

  particles.forEach(p => {
    p.x += p.vx * ${speed};
    p.y += p.vy * ${speed};

    ctx.beginPath();
    ctx.arc(p.x, p.y, ${size} * p.size, 0, Math.PI * 2);
    ctx.fillStyle = '${color}';
    ctx.fill();
  });
  requestAnimationFrame(draw);
}`;
  };

  // ============================================================
  //  10. SPRING PHYSICS
  // ============================================================
  const springBall = $('#spring-ball');
  let springState = { x: 0, y: 0, vx: 0, vy: 0, dragging: false, targetX: 0, targetY: 0 };
  let springAnim;

  defaultValues.spring = {
    'ctrl-spring-stiff': '200',
    'ctrl-spring-damp': '10',
    'ctrl-spring-mass': '1'
  };

  function initSpring() {
    if (!springBall) return;
    const preview = $('#preview-spring');
    const rect = preview.getBoundingClientRect();
    springState.targetX = rect.width / 2 - 25;
    springState.targetY = rect.height / 2 - 25;
    springState.x = springState.targetX;
    springState.y = springState.targetY;
    springBall.style.left = springState.x + 'px';
    springBall.style.top = springState.y + 'px';

    let dragOffsetX = 0, dragOffsetY = 0;

    springBall.addEventListener('mousedown', (e) => {
      springState.dragging = true;
      springState.vx = 0;
      springState.vy = 0;
      const ballRect = springBall.getBoundingClientRect();
      dragOffsetX = e.clientX - ballRect.left;
      dragOffsetY = e.clientY - ballRect.top;
      e.preventDefault();
    });

    // Touch support
    springBall.addEventListener('touchstart', (e) => {
      springState.dragging = true;
      springState.vx = 0;
      springState.vy = 0;
      const touch = e.touches[0];
      const ballRect = springBall.getBoundingClientRect();
      dragOffsetX = touch.clientX - ballRect.left;
      dragOffsetY = touch.clientY - ballRect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!springState.dragging) return;
      const previewRect = preview.getBoundingClientRect();
      springState.x = e.clientX - previewRect.left - dragOffsetX;
      springState.y = e.clientY - previewRect.top - dragOffsetY;
    });

    document.addEventListener('touchmove', (e) => {
      if (!springState.dragging) return;
      const touch = e.touches[0];
      const previewRect = preview.getBoundingClientRect();
      springState.x = touch.clientX - previewRect.left - dragOffsetX;
      springState.y = touch.clientY - previewRect.top - dragOffsetY;
    });

    document.addEventListener('mouseup', () => { springState.dragging = false; });
    document.addEventListener('touchend', () => { springState.dragging = false; });

    function simulateSpring() {
      if (!springState.dragging) {
        const stiffness = parseFloat($('#ctrl-spring-stiff').value);
        const damping = parseFloat($('#ctrl-spring-damp').value);
        const mass = parseFloat($('#ctrl-spring-mass').value);
        const dt = 1 / 60;

        const dx = springState.x - springState.targetX;
        const dy = springState.y - springState.targetY;
        const ax = (-stiffness * dx - damping * springState.vx) / mass;
        const ay = (-stiffness * dy - damping * springState.vy) / mass;
        springState.vx += ax * dt;
        springState.vy += ay * dt;
        springState.x += springState.vx * dt;
        springState.y += springState.vy * dt;
      }

      springBall.style.left = springState.x + 'px';
      springBall.style.top = springState.y + 'px';

      // Draw spring line
      const previewEl = springBall.parentElement;
      let line = previewEl.querySelector('.spring-line');
      if (!line) {
        line = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        line.classList.add('spring-line');
        line.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
        previewEl.insertBefore(line, springBall);
      }
      const x1 = springState.targetX + 25;
      const y1 = springState.targetY + 25;
      const x2 = springState.x + 25;
      const y2 = springState.y + 25;
      line.innerHTML = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(244,63,94,0.4)" stroke-width="2" stroke-dasharray="6,4"/>`;

      springAnim = requestAnimationFrame(simulateSpring);
    }
    simulateSpring();
  }

  bindControl('#ctrl-spring-stiff', '#val-spring-stiff', '', () => updateCode('spring'));
  bindControl('#ctrl-spring-damp', '#val-spring-damp', '', () => updateCode('spring'));
  bindControl('#ctrl-spring-mass', '#val-spring-mass', '', () => updateCode('spring'));

  codeGenerators.spring = () => {
    const stiff = $('#ctrl-spring-stiff').value;
    const damp = $('#ctrl-spring-damp').value;
    const mass = $('#ctrl-spring-mass').value;
    return `const stiffness = ${stiff};
const damping = ${damp};
const mass = ${mass};
let x = 0, y = 0, vx = 0, vy = 0;

function simulate() {
  const dt = 1 / 60;
  const dx = x - targetX;
  const dy = y - targetY;

  // Hooke's law + damping
  const ax = (-stiffness * dx - damping * vx) / mass;
  const ay = (-stiffness * dy - damping * vy) / mass;

  vx += ax * dt;
  vy += ay * dt;
  x += vx * dt;
  y += vy * dt;

  ball.style.left = x + 'px';
  ball.style.top = y + 'px';
  requestAnimationFrame(simulate);
}`;
  };
  updateCode('spring');

  // ============================================================
  //  11. SVG MORPHING
  // ============================================================
  const morphPath = $('#morph-path');
  let currentShapeIndex = 0;

  const morphShapes = [
    // Circle
    'M100,20 C144,20 180,56 180,100 C180,144 144,180 100,180 C56,180 20,144 20,100 C20,56 56,20 100,20 Z',
    // Star
    'M100,15 L120,75 L185,75 L132,115 L152,180 L100,142 L48,180 L68,115 L15,75 L80,75 Z',
    // Rounded square
    'M40,30 L160,30 C170,30 170,30 170,40 L170,160 C170,170 170,170 160,170 L40,170 C30,170 30,170 30,160 L30,40 C30,30 30,30 40,30 Z',
    // Heart
    'M100,180 C60,140 10,120 10,80 C10,40 50,20 100,60 C150,20 190,40 190,80 C190,120 140,140 100,180 Z'
  ];

  defaultValues.morph = {
    'ctrl-morph-speed': '0.6',
    'ctrl-morph-shape': '0',
    'ctrl-morph-color': '#818cf8'
  };

  function updateMorph() {
    const speed = $('#ctrl-morph-speed').value;
    const color = $('#ctrl-morph-color').value;
    if (morphPath) {
      morphPath.style.transition = `d ${speed}s ease-in-out, fill 0.3s`;
      morphPath.setAttribute('fill', color);
    }
    updateCode('morph');
  }

  function setMorphShape(index) {
    currentShapeIndex = index;
    if (morphPath) {
      morphPath.setAttribute('d', morphShapes[index]);
    }
  }

  // Click to cycle
  if ($('#preview-morph')) {
    $('#preview-morph').addEventListener('click', () => {
      currentShapeIndex = (currentShapeIndex + 1) % morphShapes.length;
      setMorphShape(currentShapeIndex);
      $('#ctrl-morph-shape').value = currentShapeIndex;
    });
  }

  // Init with first shape
  setMorphShape(0);

  bindControl('#ctrl-morph-speed', '#val-morph-speed', 's', updateMorph);
  bindControl('#ctrl-morph-shape', null, '', (v) => { setMorphShape(parseInt(v)); updateCode('morph'); });
  bindControl('#ctrl-morph-color', null, '', updateMorph);

  codeGenerators.morph = () => {
    const speed = $('#ctrl-morph-speed').value;
    const color = $('#ctrl-morph-color').value;
    const shapeNames = ['Circle', 'Star', 'Square', 'Heart'];
    return `<svg viewBox="0 0 200 200">
  <path id="shape" fill="${color}" d="..." />
</svg>

<style>
  #shape {
    transition: d ${speed}s ease-in-out;
  }
</style>

<script>
  const shapes = [
    '${shapeNames[0]}', '${shapeNames[1]}',
    '${shapeNames[2]}', '${shapeNames[3]}'
  ];
  // Click to morph between shapes
  let i = 0;
  svg.addEventListener('click', () => {
    i = (i + 1) % paths.length;
    path.setAttribute('d', paths[i]);
  });
<\/script>`;
  };
  updateCode('morph');

  // ============================================================
  //  12. PARALLAX LAYERS
  // ============================================================
  const parallaxContainer = $('#parallax-container');
  let parallaxLayers = [];

  defaultValues.parallax = {
    'ctrl-parallax-depth': '20',
    'ctrl-parallax-layers': '6',
    'ctrl-parallax-color': '#a3e635'
  };

  function createParallaxLayers() {
    if (!parallaxContainer) return;
    parallaxContainer.innerHTML = '';
    parallaxLayers = [];
    const count = parseInt($('#ctrl-parallax-layers').value);
    const color = $('#ctrl-parallax-color').value;

    for (let i = 0; i < count; i++) {
      const layer = document.createElement('div');
      layer.classList.add('parallax-layer');
      const size = 20 + Math.random() * 60;
      const hueShift = (i / count) * 60 - 30;
      layer.style.width = size + 'px';
      layer.style.height = size + 'px';
      layer.style.left = (10 + Math.random() * 80) + '%';
      layer.style.top = (10 + Math.random() * 80) + '%';
      layer.style.background = adjustHue(color, hueShift);
      layer.style.opacity = 0.3 + (i / count) * 0.7;
      layer.dataset.depth = (i + 1) / count;
      parallaxContainer.appendChild(layer);
      parallaxLayers.push(layer);
    }
  }

  function adjustHue(hex, shift) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    // Simple hue rotation via brightness-based tinting
    const amt = shift / 100;
    r = Math.max(0, Math.min(1, r + amt));
    g = Math.max(0, Math.min(1, g - amt * 0.5));
    b = Math.max(0, Math.min(1, b + amt * 0.3));
    return `rgb(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)})`;
  }

  if (parallaxContainer) {
    const parallaxPreview = $('#preview-parallax');
    parallaxPreview.addEventListener('mousemove', (e) => {
      const rect = parallaxPreview.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const depth = parseFloat($('#ctrl-parallax-depth').value);

      parallaxLayers.forEach(layer => {
        const d = parseFloat(layer.dataset.depth);
        const tx = mx * depth * d;
        const ty = my * depth * d;
        layer.style.transform = `translate(${tx}px, ${ty}px)`;
      });
    });

    parallaxPreview.addEventListener('mouseleave', () => {
      parallaxLayers.forEach(layer => {
        layer.style.transform = 'translate(0, 0)';
      });
    });
  }

  createParallaxLayers();

  bindControl('#ctrl-parallax-depth', '#val-parallax-depth', 'x', () => updateCode('parallax'));
  bindControl('#ctrl-parallax-layers', '#val-parallax-layers', '', () => { createParallaxLayers(); updateCode('parallax'); });
  bindControl('#ctrl-parallax-color', null, '', () => { createParallaxLayers(); updateCode('parallax'); });

  codeGenerators.parallax = () => {
    const depth = $('#ctrl-parallax-depth').value;
    const layers = $('#ctrl-parallax-layers').value;
    const color = $('#ctrl-parallax-color').value;
    return `// Create ${layers} layers with varying depth
for (let i = 0; i < ${layers}; i++) {
  const layer = document.createElement('div');
  layer.style.background = '${color}';
  layer.style.opacity = 0.3 + (i / ${layers}) * 0.7;
  layer.dataset.depth = (i + 1) / ${layers};
  container.appendChild(layer);
}

// Mouse-driven parallax
container.addEventListener('mousemove', (e) => {
  const mx = (e.clientX - rect.left) / rect.width - 0.5;
  const my = (e.clientY - rect.top) / rect.height - 0.5;

  layers.forEach(layer => {
    const d = layer.dataset.depth;
    const tx = mx * ${depth} * d;
    const ty = my * ${depth} * d;
    layer.style.transform = \`translate(\${tx}px, \${ty}px)\`;
  });
});`;
  };
  updateCode('parallax');

  // ============================================================
  //  13. TYPING EFFECT
  // ============================================================
  const typingEl = $('#typing-el');
  const typingCursor = $('#typing-cursor');
  let typingTimeout = null;

  defaultValues.typing = {
    'ctrl-typing-speed': '80',
    'ctrl-typing-text': 'Hello, World!',
    'ctrl-typing-color': '#f97316'
  };

  function startTyping() {
    if (!typingEl) return;
    if (typingTimeout) clearTimeout(typingTimeout);
    const text = $('#ctrl-typing-text').value;
    const speed = parseInt($('#ctrl-typing-speed').value);
    const color = $('#ctrl-typing-color').value;
    typingEl.style.color = color;
    typingEl.textContent = '';
    let i = 0;

    function typeChar() {
      if (i < text.length) {
        typingEl.textContent += text[i];
        i++;
        typingTimeout = setTimeout(typeChar, speed);
      }
    }
    typeChar();
  }

  if ($('#preview-typing')) {
    $('#preview-typing').addEventListener('click', startTyping);
  }

  bindControl('#ctrl-typing-speed', '#val-typing-speed', 'ms', () => updateCode('typing'));
  bindControl('#ctrl-typing-text', null, '', () => { startTyping(); updateCode('typing'); });
  bindControl('#ctrl-typing-color', null, '', () => {
    if (typingEl) typingEl.style.color = $('#ctrl-typing-color').value;
    updateCode('typing');
  });

  codeGenerators.typing = () => {
    const speed = $('#ctrl-typing-speed').value;
    const text = $('#ctrl-typing-text').value;
    const color = $('#ctrl-typing-color').value;
    return `/* CSS */
.typing-cursor {
  animation: blink 0.6s step-end infinite;
  color: #fff;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* JavaScript */
const text = '${text}';
const speed = ${speed}; // ms per character
let i = 0;

function typeChar() {
  if (i < text.length) {
    el.textContent += text[i];
    el.style.color = '${color}';
    i++;
    setTimeout(typeChar, speed);
  }
}
typeChar();`;
  };

  // Init typing on load
  setTimeout(startTyping, 500);
  updateCode('typing');

  // ============================================================
  //  14. 3D FLIP CARD
  // ============================================================
  const flipInner = $('#flip-inner');
  const flipFront = $('#flip-front');
  const flipBack = $('#flip-back');

  defaultValues.flip = {
    'ctrl-flip-duration': '0.6',
    'ctrl-flip-axis': 'Y',
    'ctrl-flip-color': '#6366f1'
  };

  function updateFlip() {
    const dur = $('#ctrl-flip-duration').value;
    const axis = $('#ctrl-flip-axis').value;
    const color = $('#ctrl-flip-color').value;

    if (flipInner) {
      flipInner.style.transitionDuration = dur + 's';
      flipInner.className = 'flip-inner flip-' + axis.toLowerCase();
    }
    if (flipFront) {
      flipFront.style.background = `linear-gradient(135deg, ${color}, ${shiftColor(color, -40)})`;
    }
    if (flipBack) {
      // Ensure backface for the chosen axis
      flipBack.style.transform = axis === 'Y' ? 'rotateY(180deg)' : 'rotateX(180deg)';
    }
    updateCode('flip');
  }

  bindControl('#ctrl-flip-duration', '#val-flip-duration', 's', updateFlip);
  bindControl('#ctrl-flip-axis', null, '', updateFlip);
  bindControl('#ctrl-flip-color', null, '', updateFlip);

  codeGenerators.flip = () => {
    const dur = $('#ctrl-flip-duration').value;
    const axis = $('#ctrl-flip-axis').value;
    const color = $('#ctrl-flip-color').value;
    return `.flip-container {
  perspective: 600px;
  width: 140px;
  height: 100px;
}

.flip-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform ${dur}s ease;
}

.flip-container:hover .flip-inner {
  transform: rotate${axis}(180deg);
}

.flip-front, .flip-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 14px;
}

.flip-front {
  background: linear-gradient(135deg, ${color}, ${shiftColor(color, -40)});
}

.flip-back {
  background: linear-gradient(135deg, #ec4899, #d946ef);
  transform: rotate${axis}(180deg);
}`;
  };
  updateCode('flip');

  // ============================================================
  //  15. GRADIENT ANIMATION
  // ============================================================
  const gradientEl = $('#gradient-el');
  let gradientStyleTag = document.createElement('style');
  document.head.appendChild(gradientStyleTag);

  defaultValues.gradient = {
    'ctrl-grad-speed': '4',
    'ctrl-grad-angle': '135',
    'ctrl-grad-color1': '#ec4899',
    'ctrl-grad-color2': '#8b5cf6'
  };

  function updateGradient() {
    const speed = $('#ctrl-grad-speed').value;
    const angle = $('#ctrl-grad-angle').value;
    const c1 = $('#ctrl-grad-color1').value;
    const c2 = $('#ctrl-grad-color2').value;

    if (gradientEl) {
      gradientEl.style.background = `linear-gradient(${angle}deg, ${c1}, ${c2}, #06b6d4, ${c1})`;
      gradientEl.style.backgroundSize = '300% 300%';
      gradientEl.style.animationDuration = speed + 's';
    }

    gradientStyleTag.textContent = `
      .gradient-box {
        animation: gradientShift ${speed}s ease infinite !important;
      }
    `;
    updateCode('gradient');
  }

  bindControl('#ctrl-grad-speed', '#val-grad-speed', 's', updateGradient);
  bindControl('#ctrl-grad-angle', '#val-grad-angle', 'deg', updateGradient);
  bindControl('#ctrl-grad-color1', null, '', updateGradient);
  bindControl('#ctrl-grad-color2', null, '', updateGradient);

  codeGenerators.gradient = () => {
    const speed = $('#ctrl-grad-speed').value;
    const angle = $('#ctrl-grad-angle').value;
    const c1 = $('#ctrl-grad-color1').value;
    const c2 = $('#ctrl-grad-color2').value;
    return `.gradient-box {
  width: 160px;
  height: 120px;
  border-radius: 18px;
  background: linear-gradient(
    ${angle}deg,
    ${c1},
    ${c2},
    #06b6d4,
    ${c1}
  );
  background-size: 300% 300%;
  animation: gradientShift ${speed}s ease infinite;
}

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;
  };
  updateCode('gradient');

  // ============================================================
  //  16. ELASTIC COLLISION
  // ============================================================
  const collCanvas = $('#collision-canvas');
  let collCtx;
  let balls = [];

  defaultValues.collision = {
    'ctrl-coll-count': '5',
    'ctrl-coll-gravity': '0.2',
    'ctrl-coll-bounce': '0.9'
  };

  function createBalls() {
    if (!collCanvas) return;
    const count = parseInt($('#ctrl-coll-count').value);
    balls = [];
    const colors = ['#eab308', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#f97316', '#06b6d4'];
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 15;
      balls.push({
        x: r + Math.random() * (collCanvas.width - r * 2),
        y: r + Math.random() * (collCanvas.height / 2),
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 2,
        r: r,
        m: r * r, // mass proportional to area
        color: colors[i % colors.length]
      });
    }
  }

  function initCollision() {
    if (!collCanvas) return;
    collCtx = collCanvas.getContext('2d');
    resizeCanvas(collCanvas);
    createBalls();

    function drawCollision() {
      const gravity = parseFloat($('#ctrl-coll-gravity').value);
      const bounce = parseFloat($('#ctrl-coll-bounce').value);
      const w = collCanvas.width;
      const h = collCanvas.height;

      collCtx.fillStyle = 'rgba(18, 18, 31, 0.3)';
      collCtx.fillRect(0, 0, w, h);

      balls.forEach(b => {
        b.vy += gravity;
        b.x += b.vx;
        b.y += b.vy;

        // Wall collision
        if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx) * bounce; }
        if (b.x + b.r > w) { b.x = w - b.r; b.vx = -Math.abs(b.vx) * bounce; }
        if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy) * bounce; }
        if (b.y + b.r > h) { b.y = h - b.r; b.vy = -Math.abs(b.vy) * bounce; }
      });

      // Ball-to-ball collision
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i], b = balls[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.r + b.r;

          if (dist < minDist && dist > 0) {
            // Separate overlapping balls
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= overlap * nx;
            a.y -= overlap * ny;
            b.x += overlap * nx;
            b.y += overlap * ny;

            // Elastic collision response
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const dot = dvx * nx + dvy * ny;
            const totalMass = a.m + b.m;

            a.vx -= (2 * b.m / totalMass) * dot * nx * bounce;
            a.vy -= (2 * b.m / totalMass) * dot * ny * bounce;
            b.vx += (2 * a.m / totalMass) * dot * nx * bounce;
            b.vy += (2 * a.m / totalMass) * dot * ny * bounce;
          }
        }
      }

      // Draw balls
      balls.forEach(b => {
        collCtx.beginPath();
        collCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        collCtx.fillStyle = b.color;
        collCtx.fill();

        // Highlight
        collCtx.beginPath();
        collCtx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
        collCtx.fillStyle = 'rgba(255,255,255,0.3)';
        collCtx.fill();
      });

      requestAnimationFrame(drawCollision);
    }
    drawCollision();
  }

  // Click to add a ball
  if (collCanvas) {
    collCanvas.addEventListener('click', (e) => {
      const rect = collCanvas.getBoundingClientRect();
      const colors = ['#eab308', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
      const r = 10 + Math.random() * 15;
      balls.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 4,
        r: r,
        m: r * r,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    });
  }

  bindControl('#ctrl-coll-count', '#val-coll-count', '', () => { createBalls(); updateCode('collision'); });
  bindControl('#ctrl-coll-gravity', '#val-coll-gravity', '', () => updateCode('collision'));
  bindControl('#ctrl-coll-bounce', '#val-coll-bounce', '', () => updateCode('collision'));

  codeGenerators.collision = () => {
    const count = $('#ctrl-coll-count').value;
    const gravity = $('#ctrl-coll-gravity').value;
    const bounce = $('#ctrl-coll-bounce').value;
    return `const balls = [];
for (let i = 0; i < ${count}; i++) {
  const r = 10 + Math.random() * 15;
  balls.push({
    x: Math.random() * w,
    y: Math.random() * h / 2,
    vx: (Math.random() - 0.5) * 4,
    vy: 0,
    r, m: r * r
  });
}

function simulate() {
  balls.forEach(b => {
    b.vy += ${gravity}; // gravity
    b.x += b.vx;
    b.y += b.vy;

    // Wall bounce
    if (b.y + b.r > h) {
      b.y = h - b.r;
      b.vy *= -${bounce}; // restitution
    }
  });

  // Ball-to-ball elastic collision
  for (let i = 0; i < balls.length; i++)
    for (let j = i+1; j < balls.length; j++) {
      const dx = balls[j].x - balls[i].x;
      const dy = balls[j].y - balls[i].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < balls[i].r + balls[j].r) {
        // Resolve overlap + transfer momentum
      }
    }
  requestAnimationFrame(simulate);
}`;
  };
  updateCode('collision');

  // ============================================================
  //  APPLY CUSTOM CODE (from textarea)
  // ============================================================
  function applyCustomCode(cardName) {
    const textarea = $(`#code-textarea-${cardName}`);
    if (!textarea) return;
    const code = textarea.value;

    // For CSS-based cards, inject a style tag
    const cssBased = ['transitions', 'keyframes', 'transforms', 'hover', 'cssvars', 'scroll', 'morph', 'typing', 'flip', 'gradient'];
    if (cssBased.includes(cardName)) {
      let tag = $(`#custom-style-${cardName}`);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = `custom-style-${cardName}`;
        document.head.appendChild(tag);
      }
      // Extract CSS portions (between /* CSS */ markers or the whole thing)
      const cssMatch = code.match(/\/\*\s*CSS\s*\*\/([\s\S]*?)(?:\/\*|$)/);
      tag.textContent = cssMatch ? cssMatch[1] : code;
    }

    // For JS-based cards, try to eval (sandboxed via Function)
    const jsBased = ['raf', 'waapi', 'particles', 'spring', 'parallax', 'collision'];
    if (jsBased.includes(cardName)) {
      try {
        new Function(code)();
      } catch (e) {
        console.warn(`Error applying code for ${cardName}:`, e.message);
      }
    }
  }

  // ============================================================
  //  CANVAS RESIZE HELPER
  // ============================================================
  function resizeCanvas(canvas) {
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }

  window.addEventListener('resize', () => {
    resizeCanvas(rafCanvas);
    resizeCanvas(partCanvas);
    resizeCanvas(collCanvas);
  });

  // ============================================================
  //  INIT ALL CANVAS-BASED ANIMATIONS
  // ============================================================
  initRAF();
  initParticles();
  initSpring();
  initCollision();
  updateCode('raf');
  updateCode('particles');
  updateCode('collision');

  // ============================================================
  //  HACKER STATS SIDE PANEL
  // ============================================================
  function initHackerPanel() {
    const toggle = $('#hacker-toggle');
    const panel = $('#hacker-panel');
    if (!toggle || !panel) return;

    // Toggle panel open/close
    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
      toggle.classList.toggle('active');
      // Populate stats on first open
      if (panel.classList.contains('open') && !panel.dataset.loaded) {
        panel.dataset.loaded = '1';
        populateStats();
      }
    });

    function populateStats() {
      const totalEl = $('#stat-total');
      const cssEl = $('#stat-css');
      const jsEl = $('#stat-js');
      const svgEl = $('#stat-svg');
      const panelsEl = $('#stat-panels');
      const controlsEl = $('#stat-controls');
      const barFill = $('#stat-bar-fill');
      const statusEl = $('#stat-status');

      // Count cards by section
      const allCards = $$('.card').length;
      const headings = document.querySelectorAll('h2.section-heading');
      let cssCount = 0, jsCount = 0, svgCount = 0;

      headings.forEach(heading => {
        const text = heading.textContent.trim();
        const grid = heading.nextElementSibling;
        if (!grid) return;
        const count = grid.querySelectorAll('.card').length;
        if (text.includes('CSS')) cssCount += count;
        else if (text.includes('JavaScript')) jsCount += count;
        else if (text.includes('SVG')) svgCount += count;
      });

      // Count code panels and controls
      const panelCount = $$('.code-panel').length;
      const controlCount = $$('.controls input, .controls select').length;

      // Animate counting up
      function countUp(el, target, duration) {
        if (!el || target === 0) { if (el) el.textContent = '0'; return; }
        let start = 0;
        const step = Math.max(1, Math.floor(duration / target));
        const timer = setInterval(() => {
          start++;
          el.textContent = start;
          if (start >= target) {
            clearInterval(timer);
            el.textContent = target;
          }
        }, step);
      }

      setTimeout(() => {
        countUp(totalEl, allCards, 800);
        countUp(cssEl, cssCount, 600);
        countUp(jsEl, jsCount, 600);
        countUp(svgEl, svgCount, 600);
        countUp(panelsEl, panelCount, 500);
        countUp(controlsEl, controlCount, 700);
        if (barFill) barFill.style.width = '100%';
        if (statusEl) {
          setTimeout(() => {
            statusEl.textContent = '> all systems operational_';
          }, 900);
        }
      }, 200);
    }
  }

  initHackerPanel();

});
