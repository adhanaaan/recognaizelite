import type { ClinicSignupIdLang } from "src/i18n/clinicSignupId";
import { liteEventCopy, type LiteEventCopy } from "src/i18n/liteEventCopy";

/**
 * Every visitor-facing string in the /clinic-signup-id flow, in Bahasa
 * Indonesia.
 *
 * The English set is not restated here. It is the /lite-event family's, read
 * through `liteEventCopy("en")`, because /clinic-signup-id runs that same flow
 * — a second copy of those several hundred strings would only drift from it.
 * `LiteEventCopy` is `typeof EN` over there, so a missing or misspelled key in
 * the Indonesian object below is a type error rather than a screen that
 * silently falls back to English in a clinic.
 *
 * Copy that is not the visitor's to read — the leads table, the API payloads,
 * the emailed report — is deliberately untouched and stays English, so a
 * clinic's afternoon still reconciles against the same columns.
 *
 * The consent is not here. It is its own module, because the consent this
 * funnel asks for is not the one the other funnels ask for — see
 * src/data/clinicSignupIdConsentCopy.ts.
 */

const EN = liteEventCopy("en");

const ID: LiteEventCopy = {
  picker: {
    label: "Pilih bahasa Anda",
  },

  /* ------------------------------------------------------------- landing -- */
  landing: {
    headTitle: "Pemeriksaan Kesehatan Otak | ReCOGnAIze",
    metaDescription:
      "Anda memantau jantung, tidur, dan gula darah Anda. Ini gagasan yang sama untuk otak Anda: pemeriksaan 3 menit dan skor yang bisa Anda tindak lanjuti.",
    ogTitle: "Anda memantau segalanya. Bagaimana dengan otak Anda?",
    ogDescription: "Ikuti kuis 3 menit dan ketahui bagaimana kinerja otak Anda.",
    pill: "Tervalidasi secara klinis di NTU LKCMedicine",
    heroLine1Lead: "Anda memantau ",
    heroLine1Emph: "segalanya",
    heroLine2Lead: "Bagaimana dengan ",
    heroLine2Emph: "otak",
    heroLine2Tail: " Anda?",
    heroSub: "Ikuti kuis 3 menit dan ketahui bagaimana kinerja otak Anda",
    cta: "Mulai gratis",
    featuredIn: "Diliput di",
    trustLead: "Berdasarkan model risiko ",
    trustStrong1: "Lancet Commission 2024",
    trustMid: " dan ",
    trustStrong2: "skor risiko demensia CAIDE",
    trustTail: ".",
  },

  /* --------------------------------------------------------------- ready -- */
  ready: {
    headTitle: "Apa yang terjadi berikutnya | ReCOGnAIze",
    inTheNext: "Dalam",
    duration: "3 menit",
    steps: [
      "Mainkan satu permainan kognitif 60 detik",
      "Ikuti kuis berbasis medis tentang faktor risiko kesehatan otak",
      "Lihat perbandingan Anda dengan orang seusia Anda",
    ],
    quizArtHigh: "Beberapa kali",
    quizArtLow: "Tidak terlalu terasa",
    curveWeak: "Lemah",
    curveAdequate: "Memadai",
    mostImportantly: "Dan yang terpenting,",
    learnToImprove: "Pelajari cara Anda bisa meningkatkannya",
    cta: "Saya siap!",
  },

  /* ----------------------------------------------------------- challenge -- */
  challenge: {
    headTitle: "Tantangan waktu reaksi | ReCOGnAIze",
    step: "Langkah 1 dari 3",
    h1: "Tantangan waktu reaksi",
    bodyLead: "Seberapa ",
    bodyEmph: "cepat",
    bodyTail:
      " otak Anda memproses informasi? Cocokkan sebanyak mungkin simbol dengan angkanya dalam 60 detik.",
    demoBadge: "Demo · berjalan sendiri",
    cta: "Mulai tutorial",
  },

  countdown: {
    title: "Tantangan waktu reaksi",
    subtitle: "Cocokkan sebanyak mungkin simbol dengan angkanya",
  },

  /* -------------------------------------------------------- game complete -- */
  gameComplete: {
    headTitle: "Permainan selesai | ReCOGnAIze",
    badge: "1 | Permainan Kognitif",
    h1: "Permainan selesai!",
    correctSymbols: "Simbol yang benar:",
    nextEyebrow: "Berikutnya",
    nextBody: "Ikuti kuis berbasis medis tentang faktor risiko kesehatan otak",
    cta: "Lanjutkan",
  },

  /* ---------------------------------------------------------------- quiz -- */
  quiz: {
    headTitle: "Kuis Kesehatan Otak | ReCOGnAIze",
    groupRiskFactors: "Beberapa faktor risiko",
    groupRiskFactorsNote: "Ini tentang kesehatan Anda sendiri, bukan keluarga Anda.",
    groupLifestyle: "Gaya hidup Anda",
    groupChanges: "Perubahan yang mungkin Anda rasakan",
    back: "← Kembali",
    continue: "Lanjutkan",
    didYouKnow: "Tahukah Anda",
    source: "Sumber",
    preparing: "Menyiapkan hasil Anda…",
    questionXOfY: (current: number, total: number) => `Pertanyaan ${current} dari ${total}`,
  },

  /* ------------------------------------------------------------- results -- */
  results: {
    headTitle: "Ke mana hasil Anda kami kirim? | ReCOGnAIze",
    badge: "3 | Hasil",
    h1: "Ke mana hasil Anda kami kirim?",
    sub: "Beri tahu nama dan email Anda, dan kami akan mengirimkan salinannya",
    nameLabel: "Nama",
    namePlaceholder: "Nama Anda",
    emailLabel: "Email",
    emailPlaceholder: "anda@email.com",
    consentRequiredMark: "Wajib",
    consentAnalyticsLead:
      ". Saya setuju data penilaian saya digunakan untuk analitik kampanye oleh Gray Matter Solutions, sesuai dengan ",
    consentPolicy: "Kebijakan Privasi",
    consentAnalyticsTail: " mereka.",
    consentMarketing: "Kirimi saya tips dan kabar terbaru seputar kesehatan otak sesekali.",
    errName: "Mohon masukkan nama Anda.",
    errEmail: "Mohon masukkan alamat email yang valid.",
    errConsent: "Mohon setujui persetujuan yang diwajibkan untuk melanjutkan.",
    errSave: "Kami tidak dapat menyimpannya. Silakan coba lagi.",
    saving: "Menyimpan…",
    submit: "Tampilkan skor saya",
    privacy:
      "Kami hanya menggunakan data Anda untuk mengirimkan hasil dan rekomendasi kesehatan otak. Berhenti berlangganan kapan saja.",
  },

  /* ------------------------------------------------------------- loading -- */
  loading: {
    headTitle: "Menyusun profil Anda | ReCOGnAIze",
    spinnerLabel: "Menyusun profil Anda",
    greeting: "Kami sedang menyusun profil Anda",
    greetingNamed: (name: string) => `${name}, kami sedang menyusun profil Anda`,
    crumbs: [
      "Meninjau profil faktor Anda…",
      "Membandingkan dengan kelompok seusia Anda…",
      "Menimbang faktor gaya hidup dan biomedis…",
      "Merujuk kerangka Lancet Commission 2024…",
      "Menyiapkan Skor Kesehatan Otak Anda…",
    ],
  },

  /* -------------------------------------------------------------- report -- */
  report: {
    headTitle: "Laporan kecepatan otak Anda | ReCOGnAIze",
    sections: [
      "Peringkat Anda",
      "Apa artinya",
      "Faktor risiko",
      "Garis dasar Anda",
      "Tes lengkap",
      "Penawaran",
      "Penutup",
    ],
    share: "Bagikan hasil",
    shared: "Tersalin",
    moreBelow: "Hasil lainnya di bawah",
    shareSheetTitle: "Skor kecepatan otak saya",
    shareScore: (percentile: number, peers: string) =>
      `Reaksi saya lebih cepat daripada ${percentile}% ${peers} dalam tes kognitif 60 detik.`,
    previewNotice:
      "Mode pratinjau. Tidak ada permainan yang selesai di perangkat ini, jadi angka di bawah hanyalah contoh.",
    ageBandLabel: "Kelompok usia Anda",
    agedChip: (label: string) => `Usia ${label}`,
    allAges: "Semua usia",
    curve: {
      slower: "Lebih lambat",
      average: "Rata-rata",
      faster: "Lebih cepat",
      you: "ANDA",
    },
    countupLead: "Anda",
    countupLeadNamed: (name: string) => `${name}, Anda`,
    countupMid: "lebih cepat daripada",
    countupTail: "orang seusia Anda.",

    meaningEyebrow: "Apa artinya sebenarnya",
    meaningH2: [
      "Kecepatan pemrosesan adalah ",
      "seberapa cepat",
      " otak Anda ",
      "menyerap",
      " apa yang dilihatnya dan ",
      "meresponsnya",
      ".",
    ],

    riskEyebrow: "Juga diukur",
    riskH2: "Kecepatan bukan satu-satunya hal yang kami lihat.",
    trend: {
      managed: "Faktor risiko dikelola",
      unmanaged: "Faktor risiko dibiarkan",
      faster: "Lebih cepat",
      slower: "Lebih lambat",
      agePrefix: "Usia ",
      caption:
        "Tren ilustratif, dibentuk dari Jaarsma dkk. 2024 dan Yaffe dkk. 2020 (CARDIA). Bukan prediksi klinis.",
      aria: "Grafik ilustratif: kecepatan pemrosesan menurun perlahan seiring usia bila faktor risiko dikelola, dan turun tajam bila dibiarkan",
    },
    riskLevelLabel: "Tingkat risiko Anda:",
    riskFactorsIntro: "Beberapa faktor yang memengaruhi tingkat risiko Anda",
    goodNews: "Kabar baiknya",
    goodNewsAbout: "Sekitar",
    goodNewsBody:
      "kasus demensia di seluruh dunia dapat dicegah atau ditunda dengan menangani faktor risiko yang dapat diubah sepanjang hidup seseorang.",

    baselineLabel: "Garis dasar Anda",
    baselineProgress: "2 dari 5 selesai",
    radarAxes: ["Kecepatan", "Memori", "Perhatian", "Eksekutif", "Skor Risiko"],
    radarAria: "Radar garis dasar: dua dari lima bagian terukur, tiga masih kosong",

    howItWorksEyebrow: "Cara kerjanya",
    howItWorksH2: "Dari tes ke telekonsultasi dalam tiga langkah",
    howItWorksSteps: [
      {
        step: "Langkah 1",
        title: "Ikuti tes online",
        body: "Penilaian online dengan permainan khusus yang mengukur cara otak Anda menangani empat aspek — kecepatan, fokus, perencanaan, dan memori.",
        domains: ["Kecepatan", "Fokus", "Perencanaan", "Memori"],
      },
      {
        step: "Langkah 2",
        title: "Dapatkan laporan lengkap Anda",
        body: "Tingkat risiko keseluruhan Anda untuk gangguan kognitif ringan, rincian pada keempat domain, dan — bila relevan — kemungkinan penyebab yang mendasarinya.",
        domains: [] as string[],
      },
      {
        step: "Langkah 3",
        title: "Ikuti telekonsultasi",
        body: "Dokter bersertifikat menganalisis laporan Anda bersama Anda lewat konsultasi telehealth dan menjelaskannya secara rinci beserta langkah lanjutan yang jelas.",
        domains: [] as string[],
      },
    ],
    takeAssessment: "Ikuti penilaian lengkap →",

    clinicianQuote:
      "Setiap permainan ini mengukur fungsi otak tertentu dengan cara yang sama seperti saya menilainya di klinik. Kami tidak menguji apakah Anda bisa bermain, kami menguji seberapa baik setiap bagian otak Anda menjalankan tugas hariannya untuk Anda.",
    clinicianName: "A/Prof Nagaendran Kandiah",
    clinicianRole: "Salah satu pendiri, Gray Matter Solutions",
    clinicianCreds: "MBBS, FAMS (Neurologi), FRCP (Edin)",

    nextSectionLabel: "Langkah berikutnya",
    interested: "Saya tertarik",
    interestedDone: "Terima kasih, sudah tercatat",
    nextEyebrow: "Apa yang terjadi berikutnya",
    nextH2: "Ambil langkah berikutnya bersama ReCOGnAIze",
    nextBody:
      "Skor Kesehatan Otak dan rekomendasi Anda sedang dikirim ke kotak masuk Anda. Kuis hari ini memperkirakan profil risiko Anda; penilaian ReCOGnAIze menunjukkan bagaimana otak Anda benar-benar bekerja.",
    nextReassurance:
      "Berapa pun skor Anda hari ini, sebagian besar faktor di baliknya dapat diubah. Itulah gunanya memeriksa sejak dini.",
    nextProductName: "Penilaian kesehatan otak ReCOGnAIze",
    nextPoints: [
      "Dikembangkan di Dementia Research Centre, NTU",
      "Terdaftar di HSA Singapura",
      "Hasil ditinjau bersama tenaga medis profesional",
    ],
    nextCallout: "Bicara dengan tim kami di booth",
    /* Unused on this funnel: the report's tickbox was removed, because the
       landing page's compulsory consent already covers this mail. The key
       stays because LiteEventCopy requires it — the sibling funnels render it. */
    tipsOptIn: "Kirimi saya tips kesehatan otak, dan akses awal saat kami meluncur.",
    credibilityLine: "Dibangun bersama Dementia Research Centre, NTU · Lancet Commission 2024",

    offerH2: (title: string) => `Menyambut ${title}, kami punya penawaran khusus untuk Anda`,
    offerMission:
      "Dengan misi kami memajukan kesehatan kognitif preventif, setiap orang seharusnya merawat otaknya sama seperti tubuhnya — sedini mungkin.",
    normalPrice: "Harga normal",
    discountLabel: (title: string) => `Diskon ${title}`,
    total: "Total",
    takeFullTest: "Ikuti tes lengkap",
    offerFooter: "Membutuhkan sekitar 15 menit. Tugas yang sama dengan yang dipakai klinisi.",

    stillThinking: "Masih perlu waktu untuk mempertimbangkan?",
    researchLine:
      "Dibangun atas riset klinis oleh Nanyang Technological University, LKC Medicine, Dementia Research Centre Singapore.",

    domainName: "kecepatan pemrosesan",
    bandLabels: {
      low: "Rendah",
      moderate: "Sedang",
      elevated: "Tinggi",
      high: "Sangat tinggi",
    } as Record<string, string>,
    factorLabels: {
      Age: "Usia",
      "Hormonal changes": "Perubahan hormon",
      "Family history": "Riwayat keluarga",
      "Blood pressure": "Tekanan darah",
      Cholesterol: "Kolesterol",
      "Diabetes / pre-diabetes": "Diabetes / pradiabetes",
      "Untreated hearing loss": "Gangguan pendengaran tanpa penanganan",
      "Untreated vision loss": "Gangguan penglihatan tanpa penanganan",
      Smoking: "Merokok",
      Sleep: "Tidur",
      Exercise: "Olahraga",
      Diet: "Pola makan",
      Alcohol: "Alkohol",
      "Physical activity": "Aktivitas fisik",
      Stress: "Stres",
    } as Record<string, string>,
    quizAgeLabels: {
      "18-29": "18 hingga 29",
      "30-39": "30 hingga 39",
      "40-49": "40 hingga 49",
      "50-59": "50 hingga 59",
      "60+": "60 ke atas",
    } as Record<string, string>,
    peopleAged: (label: string) => `orang berusia ${label}`,
    peopleYourAge: "orang seusia Anda",
  },

  /* --------------------------------------------------------- report full -- */
  reportFull: {
    headTitle: "Gambaran lengkap | ReCOGnAIze",
    back: "← Kembali ke hasil Anda",
    eyebrow: "Gambaran lengkap",
    heading: "Ikuti penilaian kesehatan otak yang lengkap",
    paperNote: "Tervalidasi dalam riset yang ditelaah sejawat",
    offerName: "Penilaian kesehatan otak BrainScan",
    offerNote:
      "Dikembangkan di Dementia Research Centre NTU · Terdaftar di HSA Singapura",
    includes: [
      "Permainan neurosains tervalidasi klinis untuk mendeteksi fungsi otak tertentu",
      "Keempat domain kognitif: kecepatan pemrosesan, memori, perhatian, dan fungsi eksekutif",
      "Ulasan & rekomendasi disertai laporan mendalam yang lengkap",
    ],
    faqs: [
      {
        q: "Apa itu BrainScan?",
        a: "Penilaian kesehatan otak digital yang dikembangkan di Dementia Research Centre NTU dan terdaftar di HSA Singapura.",
      },
      {
        q: "Apa bedanya kuis 3 menit ini dengan BrainScan?",
        a: "Kuis ini adalah perkiraan edukatif gratis berdasarkan faktor risiko Anda yang dapat diubah. BrainScan adalah penilaian lengkap, tervalidasi dalam riset yang ditelaah sejawat, yang menunjukkan bagaimana otak Anda benar-benar bekerja.",
      },
      {
        q: "Apakah penilaian ini tepercaya?",
        a: "Ya. BrainScan dikembangkan dan divalidasi di Lee Kong Chian School of Medicine NTU, Dementia Research Centre, dan terdaftar di HSA Singapura.",
      },
      {
        q: "Untuk siapa penilaian ini?",
        a: "Siapa pun yang ingin selangkah lebih awal menjaga kesehatan otaknya: entah Anda ingin mempertahankan performa kognitif terbaik, sedang melalui perubahan hormon, atau mendampingi orang terkasih yang hidup dengan demensia.",
      },
      {
        q: "Apa yang berikutnya?",
        a: "Unduh bukti penawaran Anda dan tunjukkan di meja depan untuk menebus penilaian berdiskon. Tesnya sendiri berjalan di peramban dan memakan waktu sekitar sepuluh menit.",
      },
    ],
    disclaimer:
      "Laporan ini hanya ditujukan untuk skrining kesejahteraan dan tujuan edukasi. Laporan ini tidak mendiagnosis penyakit maupun menggantikan evaluasi medis profesional. Temuannya perlu ditafsirkan bersama konsultasi klinis, penilaian gaya hidup, dan, bila relevan, evaluasi biomedis.",
  },

  /* --------------------------------------------------------------- offer -- */
  offer: {
    eyebrow: "Penawaran khusus",
    title: "Bulan Alzheimer Sedunia",
    window: "1 – 30 September 2026",
    productName: "Tes Kognitif BrainScan",
    productSub: "4 domain kognitif",
    domains: ["Kecepatan Pemrosesan", "Fungsi Eksekutif", "Memori", "Perhatian"],
    normalPrice: "Harga normal",
    discountLabel: "Diskon Bulan Alzheimer",
    total: "Total",
    claimCode: "Kode klaim Anda:",
    preparing: "Menyiapkan…",
    download: "Unduh bukti penawaran",
    redeemNote: "Tunjukkan ini di meja depan untuk menebusnya.",
  },
};

const BY_LANG: Record<ClinicSignupIdLang, LiteEventCopy> = { en: EN, id: ID };

export function clinicSignupIdCopy(lang: ClinicSignupIdLang): LiteEventCopy {
  return BY_LANG[lang] ?? EN;
}

/**
 * The countdown screen sits on the shared /symbol-matching route, outside this
 * flow's React tree and its hook. It reads the app-wide `APP_LANG` instead,
 * which `setClinicSignupIdLang` keeps in step — see src/i18n/clinicSignupId.ts.
 *
 * Returns null for every language that is not this funnel's Indonesian, so the
 * shared screen can fall through to `liteEventGameCopy` for the /lite-event
 * family's own languages. Resolving it here rather than adding a "BAHASA"
 * branch to that function is what keeps the two copy modules from importing
 * each other in a cycle.
 */
export function clinicSignupIdGameCopy(appLang: string): LiteEventCopy["countdown"] | null {
  return appLang === "BAHASA" ? ID.countdown : null;
}
