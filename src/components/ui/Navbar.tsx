import {
  Award,
  BookOpen,
  BookOpenText,
  Camera,
  Home,
  Menu,
  Swords,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AppPage } from '../../types';
import { GununganIcon } from './WayangIcons';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  muted: boolean;
  onToggleMute: () => void;
  /** Landing page: float transparently over the full-screen hero until the user scrolls. */
  overlay?: boolean;
}

const NAV_ITEMS: Array<{
  page: AppPage;
  label: string;
  icon: typeof Home;
}> = [
  { page: 'landing', label: 'Beranda', icon: Home },
  { page: 'characters', label: 'Tokoh', icon: Users },
  { page: 'stories', label: 'Cerita', icon: BookOpenText },
  { page: 'dashboard', label: 'Level', icon: Award },
  { page: 'tutorial', label: 'Latihan', icon: BookOpen },
  { page: 'studio', label: 'Studio', icon: Camera },
  { page: 'battle', label: 'Adu Sabetan', icon: Swords },
];

const isActivePage = (page: AppPage, currentPage: AppPage) =>
  currentPage === page ||
  (page === 'dashboard' && (currentPage === 'challenge' || currentPage === 'result'));

export function Navbar({
  currentPage,
  onNavigate,
  muted,
  onToggleMute,
  overlay = false,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overlay]);

  // Close the mobile menu on page change, Escape, or when the viewport grows to desktop.
  useEffect(() => setMenuOpen(false), [currentPage]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    const desktop = window.matchMedia('(min-width: 1280px)');
    const onResize = () => desktop.matches && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
    };
  }, [menuOpen]);

  // Transparent with light text while it sits on the hero image (and the menu is closed).
  const onImage = overlay && !scrolled && !menuOpen;

  const go = (page: AppPage) => {
    setMenuOpen(false);
    onNavigate(page);
  };

  const iconButton = `flex h-10 w-10 items-center justify-center rounded-lg border transition ${
    onImage
      ? 'border-white/15 bg-wayang-charcoal/35 text-wayang-cream backdrop-blur-sm hover:bg-wayang-charcoal/55'
      : 'border-wayang-gold/40 bg-white text-wayang-brown hover:bg-wayang-gold-soft/60'
  }`;

  return (
    <header
      className={`top-0 z-30 transition-colors duration-300 ${
        overlay ? 'fixed inset-x-0' : 'sticky'
      } ${
        onImage
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-wayang-gold/40 bg-wayang-cream/95 shadow-sm backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => go('landing')}
          className={`group flex min-w-0 items-center gap-3 rounded-lg px-2 py-1 text-left transition ${
            onImage ? 'hover:bg-white/10' : 'hover:bg-wayang-gold-soft/45'
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-wayang-gold/40 bg-wayang-brown text-wayang-gold shadow-sm">
            <GununganIcon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <span
              className={`font-display block text-xl font-bold leading-tight tracking-tight ${
                onImage ? 'text-wayang-cream' : 'text-wayang-brown'
              }`}
            >
              ARJUNA
            </span>
            <span
              className={`block truncate text-xs font-semibold tracking-wide ${
                onImage ? 'text-wayang-gold-soft' : 'text-wayang-terracotta'
              }`}
            >
              Wayang Kulit Interaktif
              <span className="hidden sm:inline"> • BUDAYA GO! 2026</span>
            </span>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {/* Desktop: full menu */}
          <nav aria-label="Navigasi utama" className="hidden items-center gap-2 xl:flex">
            {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
              const active = isActivePage(page, currentPage);
              return (
                <button
                  key={page}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => go(page)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-wayang-brown text-wayang-gold shadow-sm ring-1 ring-wayang-gold/40'
                      : onImage
                        ? 'bg-wayang-charcoal/35 text-wayang-cream ring-1 ring-white/15 backdrop-blur-sm hover:bg-wayang-charcoal/55'
                        : 'bg-white/80 text-wayang-brown hover:bg-wayang-gold-soft/70'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
            title={muted ? 'Nyalakan suara' : 'Matikan suara'}
            className={`${iconButton} xl:ml-1`}
          >
            {muted ? (
              <VolumeX className={`h-4 w-4 ${onImage ? 'text-wayang-gold-soft' : 'text-wayang-terracotta'}`} />
            ) : (
              <Volume2 className={`h-4 w-4 ${onImage ? 'text-wayang-gold-soft' : 'text-wayang-sage'}`} />
            )}
          </button>

          {/* Mobile / tablet: hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            aria-controls="menu-navigasi"
            className={`${iconButton} xl:hidden`}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="menu-navigasi"
          aria-label="Navigasi utama"
          className="border-t border-wayang-gold/30 xl:hidden"
        >
          <ul className="mx-auto grid max-w-7xl gap-1.5 px-4 py-3 sm:grid-cols-2 sm:px-6">
            {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
              const active = isActivePage(page, currentPage);
              return (
                <li key={page}>
                  <button
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => go(page)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-semibold transition ${
                      active
                        ? 'bg-wayang-brown text-wayang-gold'
                        : 'text-wayang-brown hover:bg-wayang-gold-soft/60'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
