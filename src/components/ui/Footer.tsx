import { HERO_BACKDROP } from '../../assets/kitImages';
import type { AppPage } from '../../types';
import { GununganIcon } from './WayangIcons';

interface FooterProps {
  onNavigate: (page: AppPage) => void;
}

const LINKS: Array<{ page: AppPage; label: string }> = [
  { page: 'characters', label: 'Tokoh' },
  { page: 'stories', label: 'Cerita' },
  { page: 'dashboard', label: 'Jalur Belajar' },
  { page: 'tutorial', label: 'Latihan' },
  { page: 'studio', label: 'Studio' },
  { page: 'battle', label: 'Adu Sabetan' },
];

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="relative mt-12 overflow-hidden bg-wayang-charcoal text-wayang-cream">
      {/* Same pendopo illustration as the landing hero, darkened for legible text */}
      <img
        src={HERO_BACKDROP}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-wayang-charcoal/80 via-wayang-charcoal/85 to-wayang-charcoal/95"
      />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-wayang-gold/40 text-wayang-gold">
              <GununganIcon className="h-7 w-7" />
            </span>
            <span className="font-display text-xl font-bold">ARJUNA</span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-wayang-cream/80">
            Platform pembelajaran wayang kulit interaktif berbasis hand tracking. Media pendukung
            belajar budaya, bukan pengganti dalang, sanggar, maupun pertunjukan langsung.
          </p>
          <p className="mt-4 text-sm text-wayang-cream/80">
            Karya Tim Pengen Terbang, Politeknik Negeri Lhokseumawe, untuk{' '}
            <span className="font-semibold text-wayang-gold">BUDAYA GO! 2026</span> (Inovasi
            Digital).
          </p>
        </div>

        <nav aria-label="Tautan footer" className="md:col-span-3">
          <h2 className="text-sm font-semibold text-wayang-gold">Jelajahi</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-1">
            {LINKS.map(({ page, label }) => (
              <li key={page}>
                <button
                  type="button"
                  onClick={() => onNavigate(page)}
                  className="text-wayang-cream/85 underline-offset-4 transition hover:text-wayang-gold hover:underline"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="text-sm font-semibold text-wayang-gold">Catatan</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-wayang-cream/80">
            <li>Gambar kamera diproses di browser Anda; tidak direkam atau dikirim ke server.</li>
            <li>
              Ilustrasi tokoh dan latar adalah interpretasi visual modern, bukan pakem yang telah
              divalidasi dalang atau sanggar.
            </li>
            <li>Ikon antarmuka: Lucide (lisensi ISC).</li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-wayang-cream/60 sm:px-6">
          © 2026 Tim Pengen Terbang. Versi awal web (client-side).
        </p>
      </div>
    </footer>
  );
}
