import { CHARACTER_ART } from '../../assets/kitImages';
import { getCharacterById } from '../../assets/wayangCharacters';
import type { PuppetCharacterId } from '../../types';

interface CharacterPortraitProps {
  characterId: PuppetCharacterId;
  heightClass?: string;
}

/** Illustrated character portrait on a warm kelir backdrop (profile pages, not the playable puppet). */
export function CharacterPortrait({ characterId, heightClass = 'h-56' }: CharacterPortraitProps) {
  const character = getCharacterById(characterId);
  return (
    <div
      className={`wayang-kelir-bg flex items-end justify-center overflow-hidden rounded-lg ${heightClass}`}
    >
      <img
        src={CHARACTER_ART[characterId]}
        alt={`Ilustrasi ${character.name}`}
        loading="lazy"
        decoding="async"
        className="h-[94%] w-auto max-w-full object-contain drop-shadow-[0_6px_10px_rgba(74,44,29,0.25)]"
      />
    </div>
  );
}
