import React, { useEffect, useRef } from 'react';

const MorphTransition = ({ username, onComplete }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // 1. Create offscreen canvas to sample text target positions
    const textCanvas = document.createElement('canvas');
    textCanvas.width = width;
    textCanvas.height = height;
    const textCtx = textCanvas.getContext('2d');

    const displayText = `Welcome ${username || 'User'}!`;
    const fontSize = Math.min(width / (displayText.length * 0.75), 52);
    textCtx.font = `bold ${fontSize}px "Plus Jakarta Sans", "Outfit", sans-serif`;
    textCtx.fillStyle = '#ffffff';
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.fillText(displayText, width / 2, height / 2);

    // Sample pixels to get text target coordinates
    const imgData = textCtx.getImageData(0, 0, width, height);
    const targets = [];
    const step = Math.max(3, Math.floor(fontSize / 14));

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        if (imgData.data[index + 3] > 128) {
          targets.push({ x, y });
        }
      }
    }

    // 2. Spawn floating particle dots
    const numParticles = Math.max(targets.length, 300);
    const particles = [];
    const colors = ['#f97316', '#ff8c00', '#fb923c', '#ffffff', '#fed7aa'];

    for (let i = 0; i < numParticles; i++) {
      const target = targets[i % targets.length] || {
        x: width / 2 + (Math.random() - 0.5) * 300,
        y: height / 2 + (Math.random() - 0.5) * 100
      };

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        startX: Math.random() * width,
        startY: Math.random() * height,
        targetX: target.x,
        targetY: target.y,
        radius: Math.random() * 2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.5
      });
    }

    let startTime = null;
    const duration = 1600; // Morphing duration in ms

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      ctx.fillStyle = 'rgba(9, 9, 11, 0.35)';
      ctx.fillRect(0, 0, width, height);

      // Render morphing particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x = p.startX + (p.targetX - p.startX) * easedProgress;
        p.y = p.startY + (p.targetY - p.startY) * easedProgress;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = progress > 0.8 ? 8 : 2;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Hold full text state briefly then complete transition
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [username, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#09090b',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'relative', zIndex: 10, marginTop: '260px' }}>
        <div className="d-flex align-items-center gap-2 px-4 py-2 rounded-pill bg-dark border border-secondary">
          <span className="spinner-grow spinner-grow-sm text-warning" role="status"></span>
          <span className="text-orange font-mono fw-bold fs-6">Authenticating & Initializing Workspace...</span>
        </div>
      </div>
    </div>
  );
};

export default MorphTransition;
