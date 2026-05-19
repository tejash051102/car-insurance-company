import { useEffect, useRef } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const AnimatedAuthBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    let frame;
    let width;
    let height;
    let tick = 0;
    let nodes = [];

    const nodeCount = 55;
    const maxDistance = 160;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const createNode = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2
    });

    const init = () => {
      resize();
      nodes = Array.from({ length: nodeCount }, createNode);
    };

    const rings = Array.from({ length: 3 }, (_, index) => ({
      phase: (index / 3) * Math.PI * 2,
      speed: 0.004 + index * 0.002
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#050a14");
      bg.addColorStop(0.5, "#060d1a");
      bg.addColorStop(1, "#04080f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(width * 0.35, height * 0.5, 0, width * 0.35, height * 0.5, width * 0.55);
      glow.addColorStop(0, "rgba(14,165,233,0.07)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      const glow2 = ctx.createRadialGradient(width * 0.8, height * 0.3, 0, width * 0.8, height * 0.3, width * 0.4);
      glow2.addColorStop(0, "rgba(99,102,241,0.06)");
      glow2.addColorStop(1, "transparent");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      rings.forEach((ring, index) => {
        const radius = 120 + Math.sin(tick * ring.speed + ring.phase) * 40 + index * 90;
        ctx.beginPath();
        ctx.arc(width * 0.35, height * 0.5, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14,165,233,${0.04 + Math.sin(tick * ring.speed + ring.phase) * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(14,165,233,${(1 - distance / maxDistance) * 0.18})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        node.pulse += 0.02;
        const pulse = Math.sin(node.pulse) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + pulse * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,233,${0.5 + pulse * 0.4})`;
        ctx.fill();

        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        node.x = clamp(node.x, 0, width);
        node.y = clamp(node.y, 0, height);
      });

      const grid = 60;
      ctx.strokeStyle = "rgba(14,165,233,0.025)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      tick += 1;
      frame = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(circle at 80% 15%, rgba(99,102,241,0.18), transparent 32%), radial-gradient(circle at 18% 42%, rgba(14,165,233,0.18), transparent 34%), #04080f"
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default AnimatedAuthBackground;
