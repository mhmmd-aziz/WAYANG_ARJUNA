import { ArrowRight, Check, CheckCircle2 } from 'lucide-react';
import { WAYANG_CHARACTERS } from '../assets/wayangCharacters';
import { PuppetPreviewCanvas } from '../components/puppet/PuppetPreviewCanvas';
import type { AppPage, PuppetCharacterId } from '../types';

interface CharacterSelectionPageProps {
  selectedCharacterId: PuppetCharacterId;
  onSelectCharacter: (id: PuppetCharacterId) => void;
  onNavigate: (page: AppPage) => void;
}

export function CharacterSelectionPage({
  selectedCharacterId,
  onSelectCharacter,
  onNavigate,
}: CharacterSelectionPageProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-wayang-terracotta">
            Pilih Tokoh Wayang
          </span>
          <h1 className="font-display mt-1 text-3xl font-bold text-wayang-brown">
            Siapa Wayang yang Ingin Kamu Mainkan?
          </h1>
          <p className="mt-1 text-sm text-wayang-charcoal/80">
            Setiap tokoh punya kisah budaya Nusantara dan jurus khusus saat kamu
            melakukan gerakan Jepit (Pinch)!
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('tutorial')}
          className="flex items-center gap-2 rounded-lg bg-wayang-terracotta px-6 py-3.5 text-sm font-bold text-white transition hover:bg-wayang-terracotta-dark"
        >
          Lanjut ke Latihan Dasar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-lg border border-wayang-gold/40 bg-wayang-gold-soft/35 px-4 py-3 text-xs leading-relaxed text-wayang-brown">
        <strong className="font-bold">Catatan Materi Budaya (Draf Edukasi):</strong>{' '}
        Profil tokoh Pandawa dan Punakawan serta variasi gerak dasar pada versi awal
        merupakan materi pengenalan yang disiapkan untuk ditinjau dan divalidasi lebih lanjut
        bersama dalang maupun sanggar pewayangan.
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {WAYANG_CHARACTERS.map((char) => {
          const isSelected = char.id === selectedCharacterId;
          return (
            <div
              key={char.id}
              className={`grid gap-4 rounded-xl border bg-white p-5 transition sm:grid-cols-12 ${
                isSelected
                  ? 'border-wayang-terracotta'
                  : 'border-wayang-gold/30'
              }`}
            >
              <div className="sm:col-span-5">
                <PuppetPreviewCanvas
                  characterId={char.id}
                  heightClass="h-56 sm:h-full"
                />
              </div>

              <div className="flex flex-col justify-between sm:col-span-7">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-wayang-brown">
                        {char.name}
                      </h2>
                      <p className="text-xs font-bold text-wayang-terracotta">
                        {char.title} • {char.origin}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-wayang-sage" />
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-wayang-charcoal/85">
                    {char.culturalBackground}
                  </p>

                  <div className="rounded-lg bg-wayang-cream p-3 text-xs text-wayang-brown">
                    <span className="font-bold">Tahukah Kamu? </span>
                    {char.funFact}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-wayang-gold-soft px-3 py-1 font-bold text-wayang-brown">
                      {char.specialMoveName}
                    </span>
                    <span className="rounded-full bg-wayang-cream-dark px-3 py-1 font-semibold text-wayang-brown">
                      {char.signatureItem}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectCharacter(char.id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-3 text-sm font-bold transition ${
                      isSelected
                        ? 'bg-wayang-sage text-white shadow-sm'
                        : 'bg-wayang-brown text-wayang-cream hover:bg-wayang-brown-light'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                    {isSelected ? 'Tokoh Dipilih' : 'Pilih Tokoh Ini'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCharacter(char.id);
                      onNavigate('studio');
                    }}
                    className="rounded-lg border border-wayang-gold/60 px-4 py-3 text-sm font-bold text-wayang-brown transition hover:bg-wayang-gold-soft"
                  >
                    Uji di Studio
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

