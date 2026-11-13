import type { PuppetCharacterId } from '../types';

/**
 * Web-optimised copies (WebP) of the ARJUNA Asset Kit illustrations, served from /public/images.
 * Source PNGs: public/assets/arjuna-kit. These are modern visual interpretations,
 * not traditional pakem validated by a dalang or sanggar.
 */
export const CHARACTER_ART: Record<PuppetCharacterId, string> = {
  arjuna: '/images/tokoh/arjuna.webp',
  gatotkaca: '/images/tokoh/gatotkaca.webp',
  srikandi: '/images/tokoh/srikandi.webp',
  semar: '/images/tokoh/semar.webp',
};

export const HERO_ART = '/images/hero-tangan-wayang.webp';
export const CULTURE_BACKDROP = '/images/latar/pendopo.webp';
export const PARCHMENT_BACKDROP = '/images/latar/perkamen.webp';

/** Scene backdrop per story, matched to where the story takes place. */
export const STORY_BACKDROPS: Record<string, string> = {
  'pusaka-amarta': '/images/latar/pendopo.webp', // Adegan 1: Fajar di Pendopo Amarta
  'timun-mas': '/images/latar/hutan.webp', // Hutan Bambu
  'roro-jonggrang': '/images/latar/pegunungan.webp', // Prambanan, kaki Merapi
  'nasihat-semar': '/images/latar/kelir.webp', // Pitutur di depan kelir
};
