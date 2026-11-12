import type { PuppetCharacter, PuppetCharacterId } from '../types';

export const WAYANG_CHARACTERS: PuppetCharacter[] = [
  {
    id: 'arjuna',
    name: 'Raden Arjuna',
    title: 'Ksatria Panah dari Pandawa',
    origin: 'Mahabharata — Kerajaan Amarta',
    shortDesc:
      'Ksatria yang tenang, gesit, dan ahli memanah dengan ketepatan tinggi.',
    culturalBackground:
      'Arjuna adalah putra ketiga Pandawa yang terkenal berwajah rupawan, halus budi pekertinya, dan sangat fokus saat berlatih memanah. Dalam tradisi wayang kulit, gerakan Arjuna terlihat anggun dan seimbang.',
    funFact:
      'Senjata andalan Arjuna adalah Panah Pasopati yang diberikan oleh Batara Guru!',
    specialMoveName: 'Tari Panah Pasopati',
    signatureItem: 'Busur & Panah Emas',
    palette: {
      skin: '#E6BA67',
      skinShade: '#C4903A',
      gold: '#D4A843',
      goldHighlight: '#F7DF8D',
      accent: '#9E3124',
      fabricPrimary: '#1E2F3A',
      fabricSecondary: '#6F2A1F',
      outline: '#1E1109',
    },
  },
  {
    id: 'gatotkaca',
    name: 'Raden Gatotkaca',
    title: 'Satria Otot Kawat Tulang Besi',
    origin: 'Mahabharata — Pringgodani',
    shortDesc:
      'Pahlawan gagah berani yang mampu terbang menjaga angkasa Amarta.',
    culturalBackground:
      'Gatotkaca adalah putra Bima yang memiliki kekuatan luar biasa dan baju zirah Antakusuma yang membuatnya bisa terbang di awan. Gerakannya penuh semangat, tegas, dan melindungi kebaikan.',
    funFact:
      'Gatotkaca dijuluki "Otot Kawat Tulang Besi" karena ketangguhannya membela keadilan.',
    specialMoveName: 'Terbang Antakusuma',
    signatureItem: 'Sayap & Bintang Dada',
    palette: {
      skin: '#C96D44',
      skinShade: '#9B4826',
      gold: '#DFAF37',
      goldHighlight: '#FFE699',
      accent: '#A1271D',
      fabricPrimary: '#3D1912',
      fabricSecondary: '#9D6721',
      outline: '#1B0E08',
    },
  },
  {
    id: 'srikandi',
    name: 'Dewi Srikandi',
    title: 'Srikandi Pemanah Tangguh',
    origin: 'Mahabharata — Kerajaan Panchala',
    shortDesc:
      'Prajurit perempuan pemberani yang lincah, cerdas, dan cekatan.',
    culturalBackground:
      'Dewi Srikandi adalah simbol keberanian dan ketangkasan. Ia belajar memanah langsung dari Arjuna dan berani maju di medan pertempuran demi membela kebenaran bersama Pandawa.',
    funFact:
      'Di Indonesia, nama "Srikandi" sering digunakan untuk menyebut perempuan hebat dan pemberani!',
    specialMoveName: 'Kibasan Selendang Sakti',
    signatureItem: 'Selendang & Panah Pusaka',
    palette: {
      skin: '#ECC47B',
      skinShade: '#C6974B',
      gold: '#D9A73E',
      goldHighlight: '#FFF0B3',
      accent: '#9E2B36',
      fabricPrimary: '#4F1B2B',
      fabricSecondary: '#A86426',
      outline: '#21110C',
    },
  },
  {
    id: 'semar',
    name: 'Ki Lurah Semar',
    title: 'Pamong Bijaksana Punakawan',
    origin: 'Tokoh Asli Budaya Nusantara',
    shortDesc:
      'Tokoh bijaksana dan jenaka yang selalu memberi nasihat baik bagi para ksatria.',
    culturalBackground:
      'Semar adalah pemimpin kelompok Punakawan (Semar, Gareng, Petruk, Bagong). Walau penampilannya sederhana dan lucu, Semar sebenarnya tokoh sakti yang selalu menjaga kedamaian serta keadilan.',
    funFact:
      'Punakawan adalah tokoh asli ciptaan budaya Indonesia yang tidak ada di kisah India!',
    specialMoveName: 'Tawa Bijaksana Punakawan',
    signatureItem: 'Kuncung Putih & Selendang',
    palette: {
      skin: '#241E1B',
      skinShade: '#15110F',
      gold: '#D4A843',
      goldHighlight: '#F5DB84',
      accent: '#9E3324',
      fabricPrimary: '#EAE2D0',
      fabricSecondary: '#2A221E',
      outline: '#140E0B',
    },
  },
];

export function getCharacterById(id: PuppetCharacterId): PuppetCharacter {
  return (
    WAYANG_CHARACTERS.find((c) => c.id === id) ?? WAYANG_CHARACTERS[0]
  );
}

