import type { GestureType, LevelAccessTier, PuppetCharacterId, TargetZone } from '../types';

export interface StoryScene {
  id: string;
  sceneNumber: number;
  title: string;
  speaker: string;
  narration: string;
  dialogue: string;
  culturalNote: string;
  recommendedGesture?: GestureType;
  gestureCueLabel: string;
  targetZone?: TargetZone;
}

export interface FolkloreStoryDefinition {
  id: string;
  title: string;
  region: string;
  tier: LevelAccessTier;
  tierLabel: string;
  leadCharacterId: PuppetCharacterId;
  durationLabel: string;
  summary: string;
  moralValue: string;
  scenes: StoryScene[];
}

export const FOLKLORE_STORIES: FolkloreStoryDefinition[] = [
  {
    id: 'pusaka-amarta',
    title: 'Misi Pusaka Kerajaan Amarta',
    region: 'Pewayangan Pandawa • Jawa',
    tier: 'free',
    tierLabel: 'Gratis (Freemium)',
    leadCharacterId: 'arjuna',
    durationLabel: '4 Adegan Bersuara',
    summary:
      'Kisah Raden Arjuna menjaga ketenteraman Negeri Amarta dengan ketenangan hati dan sabetan terukur.',
    moralValue: 'Keberanian selalu sejalan dengan tanggung jawab dan ketenangan budi.',
    scenes: [
      {
        id: 'amarta-1',
        sceneNumber: 1,
        title: 'Adegan 1: Fajar di Pendopo Amarta',
        speaker: 'Ki Lurah Semar',
        narration:
          'Syahdan, fajar menyingsing di atas Kerajaan Amarta. Gamelan mengalun lembut mengantar sang ksatria membuka pagelaran di kelir.',
        dialogue:
          'Hehehe... Ngger Arjuna, rakyat menanti langkah teguhmu menjaga kedamaian negeri hari ini.',
        culturalNote:
          'Pembukaan pagelaran wayang diawali salam penghormatan dalang melalui gerak sabetan lembut.',
        recommendedGesture: 'open_palm',
        gestureCueLabel: 'Buka kelima jari (Telapak Terbuka) untuk memberi salam pembuka.',
      },
      {
        id: 'amarta-2',
        sceneNumber: 2,
        title: 'Adegan 2: Menjemput Pusaka Pasopati',
        speaker: 'Raden Arjuna',
        narration:
          'Di sebelah kiri panggung, berkilau cahaya Busur Pusaka Pasopati yang hanya boleh digenggam oleh niat suci.',
        dialogue:
          'Hamba mohon izin menjaga amanah ini bukan untuk kesombongan, melainkan melindungi sesama.',
        culturalNote:
          'Gerakan menjepit melambangkan ketelitian seorang kesatria memegang cempurit maupun pusaka.',
        recommendedGesture: 'pinch',
        targetZone: {
          x: 0.26,
          y: 0.54,
          radius: 0.16,
          label: 'Pusaka Kiri',
          icon: 'bow',
        },
        gestureCueLabel: 'Geser wayang ke kiri lalu jepit jempol & telunjuk (Pinch).',
      },
      {
        id: 'amarta-3',
        sceneNumber: 3,
        title: 'Adegan 3: Mengawal Gerbang Timur',
        speaker: 'Dewi Srikandi',
        narration:
          'Dari kejauhan terdengar derap kuda penjaga di Gerbang Timur. Dewi Srikandi dan Arjuna bergerak cekatan menyapa prajurit.',
        dialogue:
          'Mari kita periksa batas timur negeri bersama, jangan biarkan kepanikan melanda warga.',
        culturalNote:
          'Perpindahan posisi wayang melintasi kelir dari kiri ke kanan disebut jangkahan sabetan.',
        targetZone: {
          x: 0.74,
          y: 0.54,
          radius: 0.16,
          label: 'Gerbang Timur',
          icon: 'gate',
        },
        gestureCueLabel: 'Gerakkan tangan ke sisi kanan panggung menuju Gerbang Timur.',
      },
      {
        id: 'amarta-4',
        sceneNumber: 4,
        title: 'Adegan 4: Damai di Langit Nusantara',
        speaker: 'Ki Dalang',
        narration:
          'Negeri Amarta kembali tenteram. Cahaya blencong menyinari kelir dengan tenang sebagai tanda babak usai.',
        dialogue:
          'Tancep kayon... Semoga nilai kesabaran dan persatuan selalu hidup dalam diri kita.',
        culturalNote:
          'Tancep kayon menandai selesainya satu babak cerita pewayangan dengan khidmat.',
        recommendedGesture: 'closed_fist',
        gestureCueLabel: 'Kepalkan tangan perlahan untuk mengistirahatkan wayang di penutup kisah.',
      },
    ],
  },
  {
    id: 'timun-mas',
    title: 'Timun Mas & Bungkusan Sakti',
    region: 'Cerita Rakyat Jawa Tengah',
    tier: 'episode_pack',
    tierLabel: 'Paket Cerita Rakyat',
    leadCharacterId: 'srikandi',
    durationLabel: '4 Adegan Bersuara',
    summary:
      'Kisah kecerdikan dan keberanian seorang anak melawan ketamakan Buto Ijo menggunakan empat bekal dari pertapa.',
    moralValue: 'Kecerdikan, ketekunan, dan doa lebih kuat daripada rasa takut.',
    scenes: [
      {
        id: 'timun-1',
        sceneNumber: 1,
        title: 'Adegan 1: Nasihat Mbok Srini',
        speaker: 'Ki Dalang',
        narration:
          'Di tepi hutan Jawa Tengah, Mbok Srini menyerahkan empat bungkusan sakti kepada Timun Mas: biji mentimun, jarum, garam, dan terasi.',
        dialogue:
          'Gunakan bekal ini dengan berani saat bahaya menghadangmu di jalan, Nak.',
        culturalNote:
          'Narasi pembuka oleh dalang memperkenalkan tokoh dan konflik tanpa terburu-buru.',
        recommendedGesture: 'open_palm',
        gestureCueLabel: 'Buka telapak tangan dan arahkan wayang ke tengah panggung.',
      },
      {
        id: 'timun-2',
        sceneNumber: 2,
        title: 'Adegan 2: Langkah Lincah ke Sisi Kiri',
        speaker: 'Buto Ijo',
        narration:
          'Tiba-tiba tanah bergetar! Raksasa Buto Ijo muncul mengejar dari kejauhan dengan suara menggelegar.',
        dialogue:
          'Hahahaha! Timun Mas, ke mana pun engkau berlari, tidak ada yang bisa lari dariku!',
        culturalNote:
          'Antawacana raksasa dibawakan dengan nada suara berat dan tegas untuk membedakan watak tokoh.',
        targetZone: {
          x: 0.24,
          y: 0.52,
          radius: 0.16,
          label: 'Hutan Bambu',
          icon: 'left',
        },
        gestureCueLabel: 'Geser cepat ke Hutan Bambu di sisi kiri untuk menghindar!',
      },
      {
        id: 'timun-3',
        sceneNumber: 3,
        title: 'Adegan 3: Menebar Garam & Bungkusan Sakti',
        speaker: 'Timun Mas',
        narration:
          'Timun Mas melempar bungkusan garam hingga hutan berubah menjadi lautan luas yang menghentikan pengejar.',
        dialogue:
          'Dengan bekal keberanian ini, semoga kejahatan berhenti dan hutan kembali aman!',
        culturalNote:
          'Gerakan jari telunjuk dan jepit melambangkan aksi tegas tokoh dalam adegan klimaks.',
        recommendedGesture: 'pinch',
        gestureCueLabel: 'Lakukan gerakan Jepit (Pinch) untuk melempar bungkusan garam sakti!',
      },
      {
        id: 'timun-4',
        sceneNumber: 4,
        title: 'Adegan 4: Pulang dengan Selamat',
        speaker: 'Ki Dalang',
        narration:
          'Bahaya pun berlalu. Timun Mas kembali pulang bersama Mbok Srini dalam suka cita penuh syukur.',
        dialogue:
          'Kecerdikan dan hati yang tenang membawa kemenangan sejati bagi kebenaran.',
        culturalNote:
          'Bagian penutup (wusana) menegaskan pesan moral cerita rakyat kepada penonton.',
        recommendedGesture: 'index_up',
        gestureCueLabel: 'Angkat jari telunjuk ke atas sebagai tanda kemenangan.',
      },
    ],
  },
  {
    id: 'roro-jonggrang',
    title: 'Lakon Candi Prambanan',
    region: 'Cerita Rakyat Yogyakarta & Jateng',
    tier: 'episode_pack',
    tierLabel: 'Paket Cerita Rakyat',
    leadCharacterId: 'gatotkaca',
    durationLabel: '3 Adegan Bersuara',
    summary:
      'Kisah legenda Roro Jonggrang yang mengajarkan pentingnya kejujuran dalam setiap janji yang diucapkan.',
    moralValue: 'Menepati janji dengan tulus jauh lebih mulia daripada tipu daya.',
    scenes: [
      {
        id: 'candi-1',
        sceneNumber: 1,
        title: 'Adegan 1: Permintaan Seribu Candi',
        speaker: 'Roro Jonggrang',
        narration:
          'Malam berbintang menaungi dataran Prambanan. Roro Jonggrang mengajukan syarat pembangunan seribu candi dalam semalam.',
        dialogue:
          'Jika seribu candi berdiri sebelum fajar menyingsing, barulah hamba bersedia memenuhi permintaan itu.',
        culturalNote:
          'Dialog halus tokoh putri menggunakan intonasi lembut berirama dalam seni tutur tradisional.',
        recommendedGesture: 'open_palm',
        gestureCueLabel: 'Gerakkan wayang naik ke bagian atas kelir di bawah cahaya bintang.',
        targetZone: {
          x: 0.5,
          y: 0.34,
          radius: 0.16,
          label: 'Langit Malam',
          icon: 'star',
        },
      },
      {
        id: 'candi-2',
        sceneNumber: 2,
        title: 'Adegan 2: Pembangunan Batu Megah',
        speaker: 'Bandung Bondowoso',
        narration:
          'Batu demi batu disusun menjulang dari sisi kiri hingga kanan pelataran sebelum fajar tiba.',
        dialogue:
          'Ayo bergerak serempak! Tinggal satu candi lagi sebelum matahari terbit!',
        culturalNote:
          'Permainan tempo tangan menggambarkan suasana tegang menjelang pagi.',
        targetZone: {
          x: 0.75,
          y: 0.54,
          radius: 0.16,
          label: 'Pelataran Candi',
          icon: 'gate',
        },
        gestureCueLabel: 'Pindahkan wayang menuju Pelataran Candi di sisi kanan!',
      },
      {
        id: 'candi-3',
        sceneNumber: 3,
        title: 'Adegan 3: Pelajaran Kejujuran',
        speaker: 'Ki Dalang',
        narration:
          'Fajar semu memicu suara kokok ayam dan lesung bertalu, menggagalkan candi keseribu dan meninggalkan kisah abadi tentang kejujuran.',
        dialogue:
          'Kisah Prambanan mengingatkan kita semua agar selalu jujur dan berhati-hati berucap janji.',
        culturalNote:
          'Refleksi nilai moral di akhir adegan memperkuat tujuan edukasi budaya.',
        recommendedGesture: 'closed_fist',
        gestureCueLabel: 'Kepalkan tangan perlahan untuk menutup pertunjukan dengan tenang.',
      },
    ],
  },
  {
    id: 'nasihat-semar',
    title: 'Pitutur Bijak Ki Lurah Semar',
    region: 'Punakawan Asli Nusantara',
    tier: 'free',
    tierLabel: 'Gratis (Freemium)',
    leadCharacterId: 'semar',
    durationLabel: '3 Adegan Bersuara',
    summary:
      'Gara-gara penuh kehangatan bersama Ki Lurah Semar tentang rendah hati, gotong royong, dan menghormati sesama.',
    moralValue: 'Kebijaksanaan lahir dari ketulusan melayani dan rendah hati.',
    scenes: [
      {
        id: 'semar-1',
        sceneNumber: 1,
        title: 'Adegan 1: Gara-Gara Ceria di Taman',
        speaker: 'Ki Lurah Semar',
        narration:
          'Gamelan berganti irama jenaka. Ki Lurah Semar berjalan santai menyapa para ksatria dan anak-anak Nusantara.',
        dialogue:
          'Ealah le... urip kuwi aja mung golek menang, nanging eling marang kanca lan gotong royong.',
        culturalNote:
          'Gara-gara adalah babak Punakawan asli tradisi Jawa yang memadukan humor dan pitutur luhur.',
        recommendedGesture: 'open_palm',
        gestureCueLabel: 'Buka telapak tangan dan goyangkan pelan ke kiri dan kanan.',
      },
      {
        id: 'semar-2',
        sceneNumber: 2,
        title: 'Adegan 2: Menunjuk Bintang Kebaikan',
        speaker: 'Ki Lurah Semar',
        narration:
          'Semar menunjuk ke arah cahaya di tengah kelir, mengajak setiap orang menyalakan ilmu dan sopan santun.',
        dialogue:
          'Ilmu yang paling berharga adalah ilmu yang membuat kita makin ramah dan suka menolong sesama.',
        culturalNote:
          'Punakawan tidak terdapat pada epos India asli, melainkan ciptaan orisinal budaya Nusantara.',
        recommendedGesture: 'index_up',
        targetZone: {
          x: 0.5,
          y: 0.48,
          radius: 0.16,
          label: 'Cahaya Kelir',
          icon: 'lantern',
        },
        gestureCueLabel: 'Posisikan wayang di tengah kelir sambil mengangkat jari telunjuk!',
      },
      {
        id: 'semar-3',
        sceneNumber: 3,
        title: 'Adegan 3: Salam Gotong Royong',
        speaker: 'Ki Dalang',
        narration:
          'Tawa bijaksana Semar mengakhiri pertemuan dengan hati hangat, siap melangkah ke babak belajar selanjutnya.',
        dialogue:
          'Rahayu sagung dumadi. Mari terus melestarikan wayang kulit sebagai jati diri bangsa.',
        culturalNote:
          'Draf naskah disusun untuk edukasi budaya dan terbuka terhadap peninjauan sanggar/dalang.',
        recommendedGesture: 'closed_fist',
        gestureCueLabel: 'Kepalkan tangan dengan tenang sebagai salam penutup.',
      },
    ],
  },
];

