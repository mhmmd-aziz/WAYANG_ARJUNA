import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Hand,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { WAYANG_CHARACTERS } from '../assets/wayangCharacters';
import { PuppetPreviewCanvas } from '../components/puppet/PuppetPreviewCanvas';
import type { AppPage, PuppetCharacterId } from '../types';

interface LandingPageProps {
  selectedCharacterId: PuppetCharacterId;
  onSelectCharacter: (id: PuppetCharacterId) => void;
  onNavigate: (page: AppPage) => void;
}

export function LandingPage({
  selectedCharacterId,
  onSelectCharacter,
  onNavigate,
}: LandingPageProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      {/* Hero Section */}
      <section className="pt-2 lg:pt-6">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-wayang-brown sm:text-5xl">
              Platform Belajar <span className="text-wayang-terracotta">Wayang Kulit</span>{' '}
              Berbasis Hand Tracking
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-wayang-charcoal/85 sm:text-lg">
              ARJUNA mengajak pelajar, mahasiswa, dan masyarakat umum mengenal tokoh,
              filosofi, serta mempraktikkan gerak dasar pedalangan (<em>sabetan</em>) secara
              interaktif lewat kamera webcam tanpa alat atau penanda tambahan (<em>markerless</em>).
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('tutorial')}
                className="btn btn-lg btn-primary"
              >
                Mulai Latihan Dasar
                <ArrowRight className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('studio')}
                className="btn btn-lg btn-secondary"
              >
                <Camera className="h-5 w-5" />
                Buka Studio Wayang
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <div className="border-t-2 border-wayang-gold/50 pt-3">
                <div className="text-wayang-terracotta">
                  <Hand className="h-5 w-5" />
                </div>
                <p className="font-display mt-2.5 text-sm font-bold text-wayang-brown">
                  Markerless Hand Tracking
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-wayang-charcoal/75">
                  Deteksi 21 titik koordinat per tangan (hingga 2 tangan) langsung di browser.
                </p>
              </div>
              <div className="border-t-2 border-wayang-gold/50 pt-3">
                <div className="text-wayang-brown">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="font-display mt-2.5 text-sm font-bold text-wayang-brown">
                  Privasi Terjaga di Browser
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-wayang-charcoal/75">
                  Citra webcam diproses lokal di perangkat; tidak direkam atau dikirim ke server.
                </p>
              </div>
              <div className="border-t-2 border-wayang-gold/50 pt-3">
                <div className="text-wayang-sage">
                  <Award className="h-5 w-5" />
                </div>
                <p className="font-display mt-2.5 text-sm font-bold text-wayang-brown">
                  5 Level Latihan Dasar
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-wayang-charcoal/75">
                  Kenali tokoh, latih kendali sabetan, dan kumpulkan lencana pembelajaran.
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-5"
          >
            <div className="rounded-xl border-[3px] border-wayang-brown bg-wayang-brown p-2">
              <PuppetPreviewCanvas
                characterId={selectedCharacterId}
                partnerCharacterId={
                  selectedCharacterId === 'gatotkaca' ? 'arjuna' : 'gatotkaca'
                }
                heightClass="h-80 sm:h-96"
              />
            </div>
            <p className="mt-2.5 text-center text-sm font-semibold text-wayang-brown-light">
              Pratinjau 2 Tokoh Wayang di Kelir • Kamera hanya aktif setelah Anda mengizinkannya
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cultural Introduction */}
      <section className="rounded-xl border border-wayang-gold/40 bg-wayang-brown p-6 text-wayang-cream sm:p-8">
        <div className="grid items-center gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Wayang Kulit, Dalang, dan Kaidah Sabetan
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-wayang-cream/90 sm:text-base">
              <strong>Wayang kulit</strong> adalah seni pertunjukan tradisional Indonesia yang memadukan
              rupa tatahan, sastra tutur, iringan, dan keterampilan{' '}
              <strong className="text-wayang-gold">Dalang</strong> saat mengolah gerak (<em>sabetan</em>)
              melalui <em>cempurit</em> dan <em>tuding</em> di layar bercahaya (<em>kelir</em>).
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-wayang-cream/80 sm:text-sm">
              ARJUNA hadir sebagai media pendukung dokumentasi dan latihan dasar agar budaya pewayangan
              tetap akrab bagi generasi muda — <strong>bukan pengganti dalang, sanggar, maupun pertunjukan langsung</strong>.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-wayang-gold/25 bg-white/10 p-5 md:col-span-5">
            <h3 className="font-display text-lg font-bold text-wayang-gold">
              Alur Penggunaan ARJUNA
            </h3>
            <div className="space-y-2.5 text-sm">
              {[
                'Kenali karakter & latar budaya tokoh wayang',
                'Pahami panduan penempatan tangan & izinkan webcam',
                'Kendalikan wayang real-time dan selesaikan 5 level dasar',
              ].map((stepText, idx) => (
                <div key={stepText} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wayang-gold text-xs font-bold text-wayang-charcoal">
                    {idx + 1}
                  </span>
                  <span className="text-wayang-cream/95">{stepText}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Honest Product Status & Roadmap */}
      <section className="border-t border-wayang-gold/40 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-sm font-semibold text-wayang-terracotta">
              Transparansi Tahap Produk
            </span>
            <h2 className="font-display mt-1 text-2xl font-bold text-wayang-brown">
              Status Fitur Aktif & Peta Jalan Pengembangan
            </h2>
          </div>
          <span className="rounded-full bg-wayang-cream px-3.5 py-1.5 text-xs font-semibold text-wayang-brown">
            Versi Awal Web (Client-Side)
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-wayang-sage/35 bg-wayang-sage/5 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-wayang-sage">
              <CheckCircle2 className="h-4 w-4" />
              Berjalan Saat Ini
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-wayang-charcoal/85 sm:text-sm">
              <li>• Web interaktif berbasis browser & webcam desktop</li>
              <li>• Pelacakan 21 titik tangan markerless via MediaPipe</li>
              <li>• Pengenalan tokoh, Studio, Latihan Dasar, & 5 Level pemula</li>
              <li>• Pemrosesan lokal di browser tanpa backend</li>
            </ul>
          </div>

          <div className="rounded-xl border border-wayang-gold/45 bg-wayang-gold-soft/35 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-wayang-brown">
              <Clock className="h-4 w-4 text-wayang-terracotta" />
              Rencana Tahap Menengah
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-wayang-charcoal/85 sm:text-sm">
              <li>• Modul rangkaian scene cerita pewayangan utuh</li>
              <li>• Narasi & audio dialog karakter (antawacana) saat wayang digerakkan</li>
              <li>• Penyempurnaan gerak sabetan & validasi bersama dalang/sanggar</li>
            </ul>
          </div>

          <div className="rounded-xl border border-wayang-brown/20 bg-wayang-cream p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-wayang-brown-light">
              <Users className="h-4 w-4 text-wayang-brown" />
              Visi Jangka Panjang
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-wayang-charcoal/85 sm:text-sm">
              <li>• ARJUNA VR Experience & panggung pertunjukan virtual</li>
              <li>• Ekspansi ke beragam tradisi wayang Nusantara</li>
              <li>• Dukungan antarmuka dwibahasa Indonesia–Inggris</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Characters */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-wayang-brown sm:text-3xl">
              Kenali Tokoh Wayang Pilihan
            </h2>
            <p className="text-sm text-wayang-brown-light">
              Pilih salah satu tokoh untuk langsung memainkannya di panggung.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('characters')}
            className="btn btn-secondary"
          >
            Lihat Semua Tokoh
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WAYANG_CHARACTERS.map((char) => {
            const isSelected = char.id === selectedCharacterId;
            return (
              <div
                key={char.id}
                className={`flex flex-col justify-between rounded-xl border bg-white p-4 transition ${
                  isSelected
                    ? 'border-wayang-terracotta'
                    : 'border-wayang-gold/30'
                }`}
              >
                <div>
                  <PuppetPreviewCanvas
                    characterId={char.id}
                    heightClass="h-48"
                  />
                  <h3 className="font-display mt-3 text-lg font-bold text-wayang-brown">
                    {char.name}
                  </h3>
                  <p className="text-sm font-semibold text-wayang-terracotta">
                    {char.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-wayang-charcoal/80">
                    {char.shortDesc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCharacter(char.id);
                    onNavigate('tutorial');
                  }}
                  className={`btn mt-4 w-full ${
                    isSelected
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {isSelected ? 'Sedang Dipilih • Mulai' : 'Pilih Tokoh Ini'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
