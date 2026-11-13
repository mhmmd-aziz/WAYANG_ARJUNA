import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import type { GestureType } from '../../types';
import { GestureVectorIcon } from '../ui/WayangIcons';

interface GestureInstructorDemoProps {
  gestureType: GestureType;
  title: string;
  tip: string;
}

type DemoAnim = 'float' | 'left-right' | 'up-down' | 'pulse' | 'pinch';

const GESTURE_ANIM: Record<GestureType, DemoAnim> = {
  none: 'float',
  open_palm: 'pulse',
  closed_fist: 'pulse',
  index_up: 'up-down',
  pinch: 'pinch',
  move_left: 'left-right',
  move_right: 'left-right',
  move_up: 'up-down',
  move_down: 'up-down',
};

export function GestureInstructorDemo({
  gestureType,
  title,
  tip,
}: GestureInstructorDemoProps) {
  const anim = GESTURE_ANIM[gestureType] ?? 'pulse';

  const animateProps =
    anim === 'left-right'
      ? { x: [-8, 8, -8] }
      : anim === 'up-down'
        ? { y: [5, -6, 5] }
        : anim === 'pinch'
          ? { scale: [1, 0.9, 1.07, 1] }
          : { scale: [1, 1.08, 1] };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-wayang-gold/50 bg-gradient-to-br from-wayang-gold-soft/60 to-white p-4 shadow-sm">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-wayang-gold/40 bg-white text-wayang-brown shadow-sm">
        <motion.div
          animate={animateProps}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <GestureVectorIcon gesture={gestureType} className="h-10 w-10" />
        </motion.div>
      </div>
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-wayang-brown px-2.5 py-0.5 text-[11px] font-bold text-wayang-gold">
          <GraduationCap className="h-3.5 w-3.5" />
          Contoh Guru Dalang
        </span>
        <h4 className="font-display mt-1 text-base font-bold text-wayang-brown">
          {title}
        </h4>
        <p className="text-xs leading-relaxed text-wayang-charcoal/85">{tip}</p>
      </div>
    </div>
  );
}
