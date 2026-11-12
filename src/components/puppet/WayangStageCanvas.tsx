import { useEffect, useRef } from 'react';
import type { PuppetController } from '../../puppet-engine/PuppetController';
import type {
  InteractiveStoryObject,
  StageIconType,
  TargetZone,
} from '../../types';

interface WayangStageCanvasProps {
  controller: PuppetController;
  secondaryController?: PuppetController | null;
  isTrackingActive: boolean;
  isTrackingLoopRunning?: boolean;
  targetZone?: TargetZone | null;
  holdProgress?: number;
  storyObject?: InteractiveStoryObject | null;
  statusBanner?: string | null;
}

function drawKelirDecor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Subtle Gunungan corner silhouettes
  ctx.save();
  ctx.fillStyle = 'rgba(74, 44, 29, 0.07)';
  const drawGunungan = (cx: number, scale: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, height - 34);
    ctx.lineTo(cx - 48 * scale, height - 34);
    ctx.quadraticCurveTo(
      cx - 44 * scale,
      height - 110 * scale,
      cx,
      height - 175 * scale
    );
    ctx.quadraticCurveTo(
      cx + 44 * scale,
      height - 110 * scale,
      cx + 48 * scale,
      height - 34
    );
    ctx.closePath();
    ctx.fill();
  };
  drawGunungan(64, 0.9);
  drawGunungan(width - 64, 0.9);

  // Subtle decorative Kelir top curtain border
  ctx.fillStyle = 'rgba(74, 44, 29, 0.08)';
  ctx.fillRect(0, 0, width, 6);

  // Debog (traditional banana-trunk stage base)
  const baseGrad = ctx.createLinearGradient(0, height - 38, 0, height);
  baseGrad.addColorStop(0, '#6B422B');
  baseGrad.addColorStop(1, '#3D2214');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, height - 34, width, 34);

  ctx.fillStyle = 'rgba(212, 168, 67, 0.65)';
  ctx.fillRect(0, height - 36, width, 3);
  ctx.restore();
}

/**
 * Draws crisp vector cultural/directional icons onto the Canvas stage (no emojis).
 */
function drawStageVectorIcon(
  ctx: CanvasRenderingContext2D,
  icon: StageIconType,
  cx: number,
  cy: number,
  color: string
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (icon === 'left' || icon === 'right' || icon === 'up' || icon === 'down') {
    const angle =
      icon === 'right'
        ? 0
        : icon === 'down'
          ? Math.PI / 2
          : icon === 'left'
            ? Math.PI
            : -Math.PI / 2;
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(9, 0);
    ctx.moveTo(3, -6);
    ctx.lineTo(9, 0);
    ctx.lineTo(3, 6);
    ctx.stroke();
  } else if (icon === 'lantern') {
    // Traditional Javanese Blencong / Lentera
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(0, -7);
    ctx.moveTo(-6, -7);
    ctx.lineTo(6, -7);
    ctx.lineTo(8, 3);
    ctx.lineTo(-8, 3);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === 'bow') {
    // Golden Pasopati Bow
    ctx.beginPath();
    ctx.arc(-2, 0, 10, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(11, 0);
    ctx.moveTo(7, -3);
    ctx.lineTo(11, 0);
    ctx.lineTo(7, 3);
    ctx.stroke();
  } else if (icon === 'gate') {
    // Candi / Gerbang Keraton silhouette
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.lineTo(-10, -3);
    ctx.lineTo(-4, -9);
    ctx.lineTo(-4, 8);
    ctx.moveTo(10, 8);
    ctx.lineTo(10, -3);
    ctx.lineTo(4, -9);
    ctx.lineTo(4, 8);
    ctx.stroke();
  } else if (icon === 'lightning') {
    ctx.beginPath();
    ctx.moveTo(2, -10);
    ctx.lineTo(-5, 1);
    ctx.lineTo(1, 1);
    ctx.lineTo(-2, 10);
    ctx.lineTo(6, -1);
    ctx.lineTo(0, -1);
    ctx.closePath();
    ctx.fill();
  } else if (icon === 'star' || icon === 'sparkles') {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? 10 : 4;
      const a = (Math.PI * i) / 4;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    // Target / Stage concentric Cakra rings
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawTargetZone(
  ctx: CanvasRenderingContext2D,
  zone: TargetZone,
  holdProgress: number,
  width: number,
  height: number,
  timeSec: number
): void {
  const cx = zone.x * width;
  const cy = zone.y * height;
  const r = zone.radius * Math.min(width, height) * 0.68;
  const pulse = 1 + Math.sin(timeSec * 4) * 0.05;
  const activeColor = holdProgress > 0.05 ? '#3D7A5A' : '#C65D3B';

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
  ctx.fillStyle =
    holdProgress > 0.05
      ? 'rgba(61, 122, 90, 0.2)'
      : 'rgba(198, 93, 59, 0.14)';
  ctx.fill();

  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = activeColor;
  ctx.stroke();
  ctx.setLineDash([]);

  if (holdProgress > 0.01) {
    ctx.beginPath();
    ctx.arc(
      cx,
      cy,
      r * pulse + 6,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * holdProgress
    );
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3D7A5A';
    ctx.stroke();
  }

  if (zone.icon) {
    drawStageVectorIcon(ctx, zone.icon, cx, cy - 10, activeColor);
  }

  ctx.font = 'bold 13px "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4A2C1D';
  ctx.fillText(zone.label, cx, zone.icon ? cy + 12 : cy);
  ctx.restore();
}

function drawStoryObject(
  ctx: CanvasRenderingContext2D,
  obj: InteractiveStoryObject,
  width: number,
  height: number,
  timeSec: number
): void {
  const cx = obj.x * width;
  const cy = obj.y * height - 28 + Math.sin(timeSec * 2.8) * 5;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(247, 223, 141, 0.65)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#D4A843';
  ctx.stroke();

  drawStageVectorIcon(ctx, obj.icon, cx, cy, '#4A2C1D');
  ctx.restore();
}

export function WayangStageCanvas({
  controller,
  secondaryController = null,
  isTrackingActive,
  isTrackingLoopRunning,
  targetZone = null,
  holdProgress = 0,
  storyObject = null,
  statusBanner = null,
}: WayangStageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackingLoopRef = useRef(isTrackingLoopRunning ?? isTrackingActive);
  trackingLoopRef.current = isTrackingLoopRunning ?? isTrackingActive;

  const overlayPropsRef = useRef({
    targetZone,
    holdProgress,
    storyObject,
  });
  overlayPropsRef.current = { targetZone, holdProgress, storyObject };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTime = performance.now();

    const renderFrame = (now: number) => {
      const dtSec = Math.min(0.08, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.max(320, Math.round(rect.width * dpr));
      const targetH = Math.max(240, Math.round(rect.height * dpr));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const logicalW = rect.width || 640;
      const logicalH = rect.height || 440;

      ctx.clearRect(0, 0, logicalW, logicalH);
      drawKelirDecor(ctx, logicalW, logicalH);

      const {
        targetZone: zone,
        holdProgress: progress,
        storyObject: obj,
      } = overlayPropsRef.current;

      if (zone) {
        drawTargetZone(ctx, zone, progress, logicalW, logicalH, now / 1000);
      }
      if (obj) {
        drawStoryObject(ctx, obj, logicalW, logicalH, now / 1000);
      }

      if (!trackingLoopRef.current) {
        if (secondaryController) {
          secondaryController.updateIdle(dtSec, 0.28, 0.57, 1);
          controller.updateIdle(dtSec, 0.72, 0.57, -1);
        } else {
          controller.updateIdle(dtSec);
        }
      }

      if (secondaryController) {
        secondaryController.render(ctx, logicalW, logicalH);
      }
      controller.render(ctx, logicalW, logicalH);
      ctx.restore();

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [controller, secondaryController]);

  const character = controller.getCharacter();
  const secondaryCharacter = secondaryController?.getCharacter() ?? null;

  return (
    <div className="overflow-hidden rounded-3xl border-[3px] border-wayang-brown bg-wayang-cream shadow-card">
      <div className="flex items-center justify-between border-b border-wayang-gold/30 bg-wayang-brown px-4 py-2.5 text-wayang-cream">
        <span className="font-display text-sm font-bold text-wayang-gold sm:text-base">
          {secondaryCharacter
            ? `Kelir Wayang • ${secondaryCharacter.name} & ${character.name}`
            : `Kelir Wayang • ${character.name}`}
        </span>
        <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-wayang-gold-soft">
          {isTrackingActive ? 'Kendali Tangan Aktif' : 'Mode Pratinjau'}
        </span>
      </div>

      <div className="wayang-kelir-bg relative aspect-[4/3] w-full sm:aspect-[16/11]">
        <canvas ref={canvasRef} className="h-full w-full" />

        {statusBanner && (
          <div className="pointer-events-none absolute inset-x-4 top-4 flex justify-center">
            <div className="rounded-2xl border border-wayang-gold bg-white/95 px-4 py-2 text-center text-sm font-bold text-wayang-sage shadow-md">
              {statusBanner}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
