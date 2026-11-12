import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  Camera,
  ChevronRight,
  Hand,
  Sparkles,
  Users,
} from 'lucide-react';
import { WAYANG_CHARACTERS } from '../assets/wayangCharacters';
import { PuppetPreviewCanvas } from '../components/puppet/PuppetPreviewCanvas';
import { GununganIcon } from '../components/ui/WayangIcons';
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
      <section className="relative overflow-hidden rounded-[2rem] border border-wayang-gold/50 bg-white p-6 shadow-card lg:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-wayang-gold/40 bg-wayang-gold-soft/60 px-4 py-1.5 text-xs font-bold text-wayang-brown">
              <GununganIcon className="h-4 w-4 text-wayang-terracotta" />
              Belajar Budaya Indonesia Lewat Gerakan Tangan
            </div>

            <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-wayang-brown sm:text-5xl">
              Jadi <span className="text-wayang-terracotta">Dalang Cilik</span>{' '}
              dan Hidupkan Wayangmu!
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-wayang-charcoal/85 sm:text-lg">
              Nyalakan kamera laptopmu, angkat satu atau dua tanganmu di udara,
              dan lihat tokoh wayang kulit tradisional Indonesia menari
              mengikuti setiap gerakan jari secara langsung.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('tutorial')}
                className="flex items-center gap-2.5 rounded-2xl bg-wayang-terracotta px-7 py-4 text-base font-bold text-white shadow-md transition hover:bg-wayang-terracotta-dark active:scale-95"
              >
                <BookOpen className="h-5 w-5" />
                Mulai Belajar Wayang
                <ArrowRight className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('studio')}
                className="flex items-center gap-2 rounded-2xl border-2 border-wayang-brown/20 bg-wayang-cream px-6 py-4 text-base font-bold text-wayang-brown transition hover:border-wayang-gold hover:bg-wayang-gold-soft/50"
              >
                <Camera className="h-5 w-5 text-wayang-terracotta" />
                Buka Studio 2 Wayang
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-wayang-gold/25 bg-wayang-cream/70 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-wayang-terracotta shadow-sm">
                  <Hand className="h-5 w-5" />
                </div>
                <p className="font-display mt-2.5 text-sm font-bold text-wayang-brown">
                  Kendali 1 atau 2 Tangan
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-wayang-charcoal/75">
                  Deteksi hingga 42 titik jari untuk menggerakkan 2 wayang sekaligus.
                </p>
              </div>
              <div className="rounded-2xl border border-wayang-gold/25 bg-wayang-cream/70 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-wayang-brown shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <p className="font-display mt-2.5 text-sm font-bold text-wayang-brown">
                  4 Tokoh Nusantara
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-wayang-charcoal/75">
                  Arjuna, Gatotkaca, Dewi Srikandi, dan Ki Lurah Semar.
                </p>
              </div>
              <div className="rounded-2xl border border-wayang-gold/25 bg-wayang-cream/70 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-wayang-sage shadow-sm">
                  <Award className="h-5 w-5" />
                </div>
                <p className="font-display mt-2.5 text-sm font-bold text-wayang-brown">
                  5 Level Tantangan
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-wayang-charcoal/75">
                  Raih semua lencana hingga Piala Dalang Cilik!
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
            <div className="rounded-3xl border-[3px] border-wayang-brown bg-wayang-brown p-2 shadow-card">
              <PuppetPreviewCanvas
                characterId={selectedCharacterId}
                partnerCharacterId={
                  selectedCharacterId === 'gatotkaca' ? 'arjuna' : 'gatotkaca'
                }
                heightClass="h-80 sm:h-96"
              />
            </div>
            <p className="mt-2.5 text-center text-xs font-semibold text-wayang-brown-light">
              Pratinjau 2 Tokoh Wayang di Kelir • Buka Studio untuk memainkan
              keduanya dengan 2 tangan
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cultural Introduction */}
      <section className="rounded-[2rem] border border-wayang-gold/40 bg-wayang-brown p-6 text-wayang-cream shadow-card sm:p-8">
        <div className="grid items-center gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-wayang-gold/20 px-3 py-1 text-xs font-bold text-wayang-gold">
              <Sparkles className="h-3.5 w-3.5" />
              Mengenal Budaya Nusantara
            </span>
            <h2 className="font-display mt-2.5 text-2xl font-bold sm:text-3xl">
              Apa Itu Wayang Kulit dan Siapa Itu Dalang?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-wayang-cream/90 sm:text-base">
              Wayang kulit adalah seni pertunjukan tradisional asli Indonesia
              yang telah diakui dunia oleh UNESCO. Seorang{' '}
              <strong className="text-wayang-gold">Dalang</strong> menggerakkan
              tangan dan batang kayu kecil (<em>cempurit</em> dan{' '}
              <em>tuding</em>) agar tokoh wayang terlihat hidup di depan layar
              bercahaya (<em>kelir</em>) sambil bercerita tentang keberanian,
              kejujuran, dan kebaikan.
            </p>
          </div>

          <div className="space-y-3 rounded-3xl border border-wayang-gold/25 bg-white/10 p-5 md:col-span-5">
            <h3 className="font-display text-lg font-bold text-wayang-gold">
              3 Langkah Menjadi Dalang Cilik
            </h3>
            <div className="space-y-2.5 text-sm">
              {[
                'Pilih tokoh wayang favoritmu',
                'Ikuti panduan gerakan tangan di Tutorial',
                'Taklukkan 5 level tantangan & raih Piala!',
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
            className="flex items-center gap-1.5 rounded-2xl border border-wayang-gold/60 bg-white px-4 py-2.5 text-sm font-bold text-wayang-brown shadow-sm transition hover:bg-wayang-gold-soft"
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
                className={`flex flex-col justify-between rounded-3xl border-2 bg-white p-4 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover ${
                  isSelected
                    ? 'border-wayang-terracotta ring-4 ring-wayang-terracotta/15'
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
                  <p className="text-xs font-semibold text-wayang-terracotta">
                    {char.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-wayang-charcoal/80">
                    {char.shortDesc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCharacter(char.id);
                    onNavigate('tutorial');
                  }}
                  className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-bold transition ${
                    isSelected
                      ? 'bg-wayang-terracotta text-white'
                      : 'bg-wayang-cream-dark text-wayang-brown hover:bg-wayang-gold-soft'
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
