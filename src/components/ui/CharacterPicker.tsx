import { shortCharacterName, WAYANG_CHARACTERS } from '../../assets/wayangCharacters';
import type { PuppetCharacterId } from '../../types';

const TONES = {
  sage: {
    label: 'text-wayang-sage',
    border: 'border-wayang-sage/35',
    active: 'bg-wayang-sage text-white',
  },
  terracotta: {
    label: 'text-wayang-terracotta',
    border: 'border-wayang-terracotta/35',
    active: 'bg-wayang-terracotta text-white',
  },
} as const;

interface CharacterPickerProps {
  label: string;
  value: PuppetCharacterId;
  onChange: (id: PuppetCharacterId) => void;
  /** sage = left hand / left puppet, terracotta = right hand / single puppet */
  tone: keyof typeof TONES;
  className?: string;
}

export function CharacterPicker({
  label,
  value,
  onChange,
  tone,
  className = '',
}: CharacterPickerProps) {
  const t = TONES[tone];
  return (
    <fieldset className={`rounded-xl border bg-white px-4 py-3 ${t.border} ${className}`}>
      <legend className={`float-left mb-2 w-full text-sm font-semibold ${t.label}`}>
        {label}
      </legend>
      <div className="clear-both flex flex-wrap gap-1.5">
        {WAYANG_CHARACTERS.map((char) => {
          const active = char.id === value;
          return (
            <button
              key={char.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(char.id)}
              className={`btn btn-sm ${
                active
                  ? t.active
                  : 'bg-wayang-cream text-wayang-brown hover:bg-wayang-gold-soft'
              }`}
            >
              {shortCharacterName(char.name)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
