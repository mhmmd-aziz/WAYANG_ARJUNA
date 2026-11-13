import {
  Award,
  BookOpen,
  Camera,
  Home,
  Swords,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { AppPage } from '../../types';
import { GununganIcon } from './WayangIcons';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  muted: boolean;
  onToggleMute: () => void;
}

const NAV_ITEMS: Array<{
  page: AppPage;
  label: string;
  icon: typeof Home;
}> = [
  { page: 'landing', label: 'Beranda', icon: Home },
  { page: 'characters', label: 'Tokoh', icon: Users },
  { page: 'dashboard', label: 'Level', icon: Award },
  { page: 'tutorial', label: 'Latihan', icon: BookOpen },
  { page: 'studio', label: 'Studio', icon: Camera },
  { page: 'battle', label: 'Adu Sabetan', icon: Swords },
];

export function Navbar({
  currentPage,
  onNavigate,
  muted,
  onToggleMute,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-wayang-gold/40 bg-wayang-cream/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="group flex items-center gap-3 rounded-2xl px-2 py-1 text-left transition hover:bg-wayang-gold-soft/45"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-wayang-gold/40 bg-wayang-brown text-wayang-gold shadow-sm transition group-hover:scale-105">
            <GununganIcon className="h-7 w-7" />
          </div>
          <div>
            <span className="font-display block text-xl font-bold leading-tight tracking-tight text-wayang-brown">
              ARJUNA
            </span>
            <span className="block text-[11px] font-semibold tracking-wide text-wayang-terracotta">
              Wayang Kulit Interaktif • BUDAYA GO! 2026
            </span>
          </div>
        </button>

        <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
            const active =
              currentPage === page ||
              (page === 'dashboard' &&
                (currentPage === 'challenge' || currentPage === 'result'));
            return (
              <button
                key={page}
                type="button"
                onClick={() => onNavigate('landing' === page ? 'landing' : page)}
                className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-semibold transition sm:px-4 ${
                  active
                    ? 'bg-wayang-brown text-wayang-gold shadow-sm ring-1 ring-wayang-gold/40'
                    : 'bg-white/80 text-wayang-brown hover:bg-wayang-gold-soft/70'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
            title={muted ? 'Nyalakan suara' : 'Matikan suara'}
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-wayang-gold/40 bg-white text-wayang-brown shadow-sm transition hover:bg-wayang-gold-soft/60"
          >
            {muted ? (
              <VolumeX className="h-4 w-4 text-wayang-terracotta" />
            ) : (
              <Volume2 className="h-4 w-4 text-wayang-sage" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
