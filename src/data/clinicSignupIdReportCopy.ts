/**
 * Indonesian copy for the /clinic-signup-id report — the personalised v2
 * report's four variants (optimizer/senior × strong/weak).
 *
 * The English copy stays where it was, in `liteTwoReportContent.ts`, shared
 * with /lite-two. This module only adds Bahasa Indonesia and an accessor that
 * picks between the two, so no other funnel is touched by this one's language
 * toggle. Mirrors `liteEventReportCopy.ts`, which does the same job for that
 * family's Chinese and Malay.
 *
 * The chip colours and rule colours are styling, not copy, so they are lifted
 * from the English sets rather than restated per language.
 */

import type { ClinicSignupIdLang } from "src/i18n/clinicSignupId";
import {
  LITE_TWO_REPORT_COPY,
  liteTwoVariantKey,
  type LiteTwoBand,
  type LiteTwoPersona,
  type LiteTwoReportCopy,
  type LiteTwoVariantKey,
} from "src/data/liteTwoReportContent";

const MEMORY_CHIP_STYLE = {
  chipClassName: "bg-[#DBEAFE] text-[#1E3A8A]",
  ruleColor: "#3B82F6",
} as const;

const SPEED_CHIP_STYLE = {
  chipClassName: "bg-[#FFEDD5] text-[#9A3412]",
  ruleColor: "#F97316",
} as const;

/* ==================================================== Bahasa Indonesia ==== */

const ID_PERKS = [
  "Mengikuti percakapan yang berlangsung cepat",
  "Menyesuaikan diri dengan cepat pada situasi yang berubah",
  "Menghitung total belanja sebelum diberitahu kasir",
] as const;

const ID_STRUGGLES = [
  "Percakapan yang cepat terasa lebih melelahkan untuk diikuti",
  "Lingkungan yang ramai terasa lebih sulit diikuti",
  "Menghitung total belanja memakan waktu lebih lama daripada dulu",
] as const;

const ID_STRONG_ACCENT = "Jika semua itu terasa mudah, skor Anda baru saja menjelaskan sebabnya.";
const ID_WEAK_ACCENT =
  "Jika salah satu dari itu terasa melelahkan belakangan ini, skor Anda adalah sebabnya.";

const ID_OPTIMIZER_RISK =
  "Kami juga melihat faktor risiko Anda — kebiasaan kesehatan dan gaya hidup seperti tekanan darah tinggi, kurang tidur, atau olahraga yang kurang dapat memperlambat otak Anda seiring waktu.";

const ID_SENIOR_RISK =
  "Kami juga melihat faktor risiko Anda. Kebiasaan seperti tekanan darah tinggi, kurang tidur, gangguan pendengaran, atau olahraga yang terlalu sedikit dapat memperlambat cara Anda berpikir selama bertahun-tahun.";

const ID_OPTIMIZER_PRODUCT = {
  eyebrow: "Ikuti tesnya",
  h2: "Apa langkah Anda sekarang? Ikuti penilaian ReCOGnAIze LENGKAP",
  bodyLead:
    "Divalidasi terhadap pemindaian MRI, dibangun atas studi NTU selama lima tahun terhadap 1.500 orang dan diterbitkan di ",
} as const;

const ID_SENIOR_PRODUCT = {
  eyebrow: "Cara tes ini bekerja",
  h2: "Apa langkah Anda sekarang? Ikuti penilaian ReCOGnAIze LENGKAP",
  bodyLead:
    "Divalidasi terhadap pemindaian otak MRI, dibangun atas studi NTU selama lima tahun terhadap 1.500 orang dewasa, diterbitkan di ",
} as const;

const idWithName = (name: string | null, line: string) =>
  name ? `${name}, ${line}` : line[0].toUpperCase() + line.slice(1);

const ID_COPY: Record<LiteTwoVariantKey, LiteTwoReportCopy> = {
  "optimizer-strong": {
    hero: {
      eyebrow: "Tantangan waktu reaksi",
      h1Kind: "countup",
      h1: ({ name, percentile }) =>
        idWithName(name, `Anda lebih cepat daripada ${percentile}% orang seusia Anda.`),
      sub: ({ topBand, domain }) =>
        `Itu ${topBand}% teratas di kelompok usia Anda untuk ${domain}.`,
      scrollCue: "Jelaskan lebih lanjut",
    },
    meaning: {
      intro: "Dengan kecepatan pemrosesan yang tinggi, Anda bisa:",
      perks: ID_PERKS,
      accent: ID_STRONG_ACCENT,
    },
    tip: {
      h2: ({ name }) =>
        name
          ? `${name}, ini satu tips khusus untuk mengoptimalkan kecepatan Anda`
          : "Ini satu tips khusus untuk mengoptimalkan kecepatan Anda",
      chip: "Memori",
      ...MEMORY_CHIP_STYLE,
      headline: "Ingat pesanan kopi seorang teman tanpa perlu mengeceknya.",
      body: "Detail kecil seperti ini menunjukkan memori Anda sedang membantu. Latih menahan satu fakta kecil sepanjang satu percakapan — itulah yang menjaga jalur cepat Anda tetap cepat.",
      shareText:
        "Tips saya dari tes kecepatan otak 60 detik: ingat pesanan kopi seorang teman tanpa mengecek. Coba tips Anda:",
    },
    risk: {
      body: ID_OPTIMIZER_RISK,
      actionablesIntro: "Ini 3 langkah yang bisa Anda lakukan sekarang",
      actionables: [
        "Teruskan yang sudah Anda lakukan — kecepatan Anda kuat, jadi jagalah dengan tidur yang teratur dan olahraga yang rutin.",
        "Tantang otak Anda setiap hari — coba rute baru ke tempat kerja, pelajari keterampilan baru, atau ubah rutinitas Anda.",
        "Catat garis dasar Anda — ikuti penilaian lengkap agar Anda punya titik acuan untuk dibandingkan di kemudian hari.",
      ],
    },
    baseline: {
      eyebrow: "Garis dasar Anda sejauh ini",
      h2Lead: "Anda baru menyelesaikan ",
      h2Gradient: "2 dari 5",
      paragraphs: [
        "Permainan kecepatan dan jawaban kuis Anda memberi kami dua sumbu — kecepatan dan risiko.",
        "Tetapi otak Anda tidak bekerja dalam dua dimensi. Memori, perhatian, dan fungsi eksekutif masing-masing menceritakan hal berbeda, dan Anda bisa unggul di satu sisi sambil kesulitan di sisi lain.",
        "Tes lengkap mengisi sisanya, sehingga rekomendasi Anda benar-benar cocok dengan otak Anda.",
      ],
    },
    product: ID_OPTIMIZER_PRODUCT,
    closing: {
      quote: [
        "Rapat besok tidak mudah, dan kalau perhatian saya tidak terjaga, saya tidak bisa memberi yang terbaik. Untung saya memeriksa otak saya, sekarang saya tahu cara mengoptimalkannya. Senang saya menemukan ReCOGnAIze!",
      ],
      attribution: ({ ageLabel }) =>
        ageLabel ? `— Chelsea, berusia ${ageLabel} seperti Anda` : "— Chelsea, seusia dengan Anda",
    },
    exit: {
      body: "Skor Anda akan masuk ke email, beserta satu set strategi ringkas untuk menaikkannya.",
      body2:
        "Saat Anda siap menguji tiga domain otak lainnya, Anda tahu di mana kami berada.",
    },
  },

  "optimizer-weak": {
    hero: {
      eyebrow: "Tantangan waktu reaksi",
      h1Kind: "plain",
      h1: ({ name }) =>
        idWithName(name, "kebanyakan orang lebih cepat daripada Anda hari ini."),
      sub: ({ avgSeconds, percentile, domain }) =>
        avgSeconds
          ? `${avgSeconds} detik rata-rata — ${percentile}% terbawah di kelompok usia Anda.`
          : `Itu ${percentile}% terbawah di kelompok usia Anda untuk ${domain}.`,
      scrollCue: "Jelaskan lebih lanjut",
    },
    meaning: {
      intro: "Dengan kecepatan yang lebih tinggi, Anda bisa:",
      perks: ID_PERKS,
      accent: ID_WEAK_ACCENT,
    },
    tip: {
      h2: ({ name }) =>
        name
          ? `${name}, ini satu tips khusus untuk mengoptimalkan kecepatan Anda`
          : "Ini satu tips khusus untuk mengoptimalkan kecepatan Anda",
      chip: "Kecepatan",
      ...SPEED_CHIP_STYLE,
      headline: "Baca satu email sekali jalan, lalu langsung tindak lanjuti.",
      body: "Latihan seperti ini mengasah seberapa cepat Anda menyerap informasi.",
      shareText:
        "Tips saya dari tes kecepatan otak 60 detik: baca satu email sekali jalan lalu langsung tindak lanjuti. Coba tips Anda:",
    },
    risk: {
      body: ID_OPTIMIZER_RISK,
      actionablesIntro: "Ini 3 langkah yang bisa Anda lakukan sekarang",
      actionables: [
        "Utamakan tidur — targetkan 7-9 jam; satu jam tambahan saja bisa menajamkan waktu reaksi Anda besok.",
        "Bergeraklah 20 menit — jalan cepat atau kardio apa pun meningkatkan aliran darah ke otak dan memperbaiki kecepatan pemrosesan.",
        "Ikuti penilaian lengkap — ketahui domain mana yang sebenarnya memengaruhi performa Anda agar Anda membenahi hambatan yang tepat.",
      ],
    },
    baseline: {
      eyebrow: "Garis dasar Anda sejauh ini",
      h2Lead: "Anda baru menyelesaikan ",
      h2Gradient: "2 dari 5",
      paragraphs: [
        "Permainan kecepatan dan jawaban kuis Anda memberi kami dua sumbu: kecepatan dan risiko. Jika hari ini kecepatannya rendah, itu bukan berarti tanda kesehatan otak yang buruk.",
        "Memori, perhatian, dan fungsi eksekutif masing-masing menceritakan hal berbeda, dan Anda bisa lambat pada kecepatan tetapi kuat pada ketiganya.",
        "Tes lengkap bisa mencari mana yang sebenarnya menahan performa Anda, sehingga bisa menyesuaikan strategi yang tepat.",
      ],
    },
    product: ID_OPTIMIZER_PRODUCT,
    closing: {
      quote: [
        "Kecepatan adalah yang paling lemah di antara kelimanya, dan itu mengecewakan. Ternyata kecepatan bukan masalahnya — fungsi eksekutif saya yang bermasalah, dan itulah sebabnya sore hari saya berantakan. Saya membenahi yang tepat. Senang saya menemukan ReCOGnAIze!",
      ],
      attribution: ({ ageLabel }) =>
        ageLabel ? `— Chelsea, berusia ${ageLabel} seperti Anda` : "— Chelsea, seusia dengan Anda",
    },
    exit: {
      body: "Skor Anda akan masuk ke email, beserta satu set strategi ringkas untuk menaikkannya.",
      body2:
        "Saat Anda siap mencari domain yang sebenarnya memperlambat Anda, Anda tahu di mana kami berada.",
    },
  },

  "senior-strong": {
    hero: {
      eyebrow: "Pemeriksaan kecepatan pemrosesan",
      h1Kind: "plain",
      h1: ({ name }) =>
        idWithName(name, "kecepatan Anda di atas rata-rata kelompok usia Anda."),
      sub: ({ avgSeconds, topBand, ageLabel, domain }) => {
        const cohort = ageLabel ? `untuk usia ${ageLabel}` : "untuk kelompok usia Anda";
        return avgSeconds
          ? `${avgSeconds} detik rata-rata — ${topBand}% teratas ${cohort}.`
          : `Itu ${topBand}% teratas ${cohort} untuk ${domain}.`;
      },
      scrollCue: "Apa yang kami ukur?",
    },
    meaning: {
      intro: "Di sinilah Anda merasakannya dalam keseharian:",
      perks: ID_PERKS,
      accent: ID_STRONG_ACCENT,
    },
    tip: {
      h2: ({ name }) =>
        name
          ? `Berdasarkan profil Anda, ini satu tips untuk ${name}`
          : "Berdasarkan profil Anda, ini satu tips untuk Anda",
      chip: "Memori",
      ...MEMORY_CHIP_STYLE,
      headline: "Ingat pesanan kopi seorang teman tanpa perlu mengeceknya.",
      body: "Ingatan kecil seperti ini adalah memori Anda yang sedang bekerja.",
      shareText:
        "Tips saya dari pemeriksaan kecepatan otak 60 detik: ingat pesanan kopi seorang teman tanpa mengecek. Coba tips Anda:",
    },
    risk: {
      body: ID_SENIOR_RISK,
      actionablesIntro: "Ini 3 langkah yang bisa Anda lakukan sekarang",
      actionables: [
        "Jalan santai setiap hari — 15 menit pun membantu aliran darah ke otak dan menopang kesehatan kognitif jangka panjang.",
        "Tetap aktif bersosialisasi — percakapan rutin dan kegiatan bersama menjaga otak Anda terlibat di beberapa domain sekaligus.",
        "Tetapkan garis dasar lewat penilaian lengkap — agar Anda dan dokter Anda punya angka untuk dibandingkan dari waktu ke waktu.",
      ],
    },
    baseline: {
      eyebrow: "Apa yang kami cakup hari ini",
      h2Lead: "Anda baru menyelesaikan ",
      h2Gradient: "2 dari 5",
      paragraphs: [
        "Permainan hari ini mengukur satu hal: seberapa cepat Anda menyerap informasi dan meresponsnya. Jawaban kuis Anda memberi kami yang kedua: profil risiko Anda.",
        "Kesehatan otak bukan satu angka. Memori, perhatian, dan fungsi eksekutif menjalankan tugas yang berbeda, dan wajar bila seseorang stabil di satu sisi dan lebih lambat di sisi lain.",
        "Tes lengkap mencakup tiga sisanya, sehingga yang kami rekomendasikan cocok dengan keseluruhan profil Anda.",
      ],
    },
    product: ID_SENIOR_PRODUCT,
    closing: {
      quote: [
        "Saya sering kehilangan arah dalam percakapan dan menyalahkan usia saya. Laporannya menunjukkan perhatian saya yang menurun, bukan memori.",
        "Sekarang saya tahu persis apa yang perlu dilatih, dan dokter saya punya angkanya.",
      ],
      attribution: () => "— Siew Ling, 64, seusia dengan Anda",
    },
    exit: {
      body: "Hasil Anda akan masuk ke email, dengan penjelasan sederhana untuk setiap skor.",
      body2:
        "Saat Anda siap memeriksa tiga domain lainnya, kami ada di sini. Laporannya bisa Anda bawa ke dokter Anda.",
    },
  },

  "senior-weak": {
    hero: {
      eyebrow: "Pemeriksaan kecepatan pemrosesan",
      h1Kind: "plain",
      h1: ({ name }) =>
        idWithName(name, "kecepatan Anda di bawah kelompok usia Anda hari ini."),
      sub: ({ avgSeconds }) =>
        avgSeconds
          ? `${avgSeconds} detik rata-rata. Satu permainan dalam satu hari bukanlah diagnosis.`
          : "Satu permainan dalam satu hari bukanlah diagnosis.",
      scrollCue: "Apa yang kami ukur?",
    },
    meaning: {
      intro: "Kecepatan yang lebih lambat sering muncul seperti ini:",
      perks: ID_STRUGGLES,
      accent: ID_WEAK_ACCENT,
    },
    tip: {
      h2: () => "Berdasarkan profil Anda, ini satu hal untuk dilatih",
      chip: "Kecepatan",
      ...SPEED_CHIP_STYLE,
      headline: "Baca satu halaman, lalu sebutkan gagasan utamanya dengan suara keras.",
      body: "Latihan kecil seperti ini melatih seberapa cepat Anda menyerap informasi.",
      shareText:
        "Tips saya dari pemeriksaan kecepatan otak 60 detik: baca satu halaman, lalu sebutkan gagasan utamanya dengan suara keras. Coba tips Anda:",
    },
    risk: {
      body: ID_SENIOR_RISK,
      actionablesIntro: "Ini 3 langkah yang bisa Anda lakukan sekarang",
      actionables: [
        "Jalan santai setiap hari — 15 menit pun membantu aliran darah ke otak dan menopang kecepatan berpikir.",
        "Jaga rutinitas tetap sederhana — jam makan yang tetap, tidur yang teratur, dan struktur yang familier mengurangi beban kognitif.",
        "Ikuti penilaian lengkap — bagikan hasilnya kepada dokter Anda agar mereka punya angka untuk dipakai, bukan sekadar keluhan.",
      ],
    },
    baseline: {
      eyebrow: "Apa yang kami cakup hari ini",
      h2Lead: "Anda baru menyelesaikan ",
      h2Gradient: "2 dari 5",
      paragraphs: [
        "Permainan hari ini mengukur satu hal: seberapa cepat Anda menyerap informasi dan meresponsnya. Hasil yang lebih lambat dalam satu hari bisa berasal dari kelelahan, obat, atau sekadar permainan yang belum terbiasa.",
        "Memori, perhatian, dan fungsi eksekutif menjalankan tugas yang berbeda, dan kecepatan yang lambat tidak memberi tahu kami keadaan ketiganya.",
        "Tes lengkap mencakup tiga sisanya, sehingga Anda dan dokter Anda melihat gambaran utuh, bukan satu angka.",
      ],
    },
    product: ID_SENIOR_PRODUCT,
    closing: {
      quote: [
        "Skor pertama saya keluar lebih lambat dari dugaan, dan itu membuat saya khawatir.",
        "Tes lengkapnya menunjukkan memori dan perhatian saya baik. Hanya satu bagian saja, dan dokter saya punya angka untuk dipakai.",
      ],
      attribution: () => "— Siew Ling, 64, seusia dengan Anda",
    },
    exit: {
      body: "Hasil Anda akan masuk ke email dengan penjelasan sederhana untuk setiap skor.",
      body2:
        "Jika hasil yang lebih lambat itu membuat Anda khawatir, bawalah laporannya ke dokter Anda. Kami ada di sini untuk tiga domain lainnya.",
    },
  },
};

const BY_LANG: Record<ClinicSignupIdLang, Record<LiteTwoVariantKey, LiteTwoReportCopy>> = {
  en: LITE_TWO_REPORT_COPY,
  id: ID_COPY,
};

/** The one report copy set this run should render. */
export function clinicSignupIdReportCopy(
  lang: ClinicSignupIdLang,
  persona: LiteTwoPersona,
  band: LiteTwoBand
): LiteTwoReportCopy {
  const map = BY_LANG[lang] ?? LITE_TWO_REPORT_COPY;
  return map[liteTwoVariantKey(persona, band)];
}
