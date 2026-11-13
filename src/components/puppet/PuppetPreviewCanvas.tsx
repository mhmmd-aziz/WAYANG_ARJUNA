import { useEffect, useMemo, useRef } from 'react';
import { PuppetController } from '../../puppet-engine/PuppetController';
import type { PuppetCharacterId } from '../../types';

interface PuppetPreviewCanvasProps {
  characterId: PuppetCharacterId;
  partnerCharacterId?: PuppetCharacterId | null;
  heightClass?: string;
}

export function PuppetPreviewCanvas({
  characterId,
  partnerCharacterId = null,
  heightClass = 'h-56',
}: PuppetPreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controller = useMemo(
    () =>
      new PuppetController(
        characterId,
        partnerCharacterId
          ? { x: 0.7, y: 0.57, facing: -1 }
          : { x: 0.5, y: 0.56, facing: 1 }
      ),
    [characterId, partnerCharacterId]
  );

  const partnerController = useMemo(
    () =>
      partnerCharacterId
        ? new PuppetController(partnerCharacterId, {
            x: 0.3,
            y: 0.57,
            facing: 1,
          })
        : null,
    [partnerCharacterId]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dtSec = Math.min(0.08, Math.max(0.001, (now - last) / 1000));
      last = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(200, Math.round(rect.width * dpr));
      const h = Math.max(180, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const logicalW = rect.width || 240;
      const logicalH = rect.height || 220;
      ctx.clearRect(0, 0, logicalW, logicalH);

      if (partnerController) {
        partnerController.updateIdle(dtSec, 0.3, 0.57, 1);
        controller.updateIdle(dtSec, 0.7, 0.57, -1);
        partnerController.render(ctx, logicalW, logicalH);
        controller.render(ctx, logicalW, logicalH);
      } else {
        controller.updateIdle(dtSec);
        controller.render(ctx, logicalW, logicalH);
      }
      ctx.restore();

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [controller, partnerController]);

  return (
    <div
      className={`wayang-kelir-bg relative w-full overflow-hidden rounded-lg border border-wayang-gold/40 ${heightClass}`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
