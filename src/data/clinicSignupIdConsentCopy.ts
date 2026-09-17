/**
 * Copy for the consent on the /clinic-signup-id landing page — the two
 * tickboxes under the name and email fields in the hero, and the notice they
 * refer to below it.
 *
 * ---------------------------------------------------------------------------
 * WHOSE CONSENT THIS IS
 * ---------------------------------------------------------------------------
 * Gray Matter Solutions' own, and nobody else's, exactly as on /clinic-signup:
 * a distributor who puts this link in front of a clinician is distribution, not
 * partnership, and no third party is named in these clauses. Adding one would
 * claim a relationship that does not exist, and under Art. 21 of the PDP Law
 * the controller named in a consent is the one accountable for it.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS NOT src/data/clinicSignupConsentCopy.ts
 * ---------------------------------------------------------------------------
 * /clinic-signup asks Singapore's PDPA question — one compulsory tickbox that
 * bundles the processing with the marketing, which is how a Singapore funnel
 * may ask it. Indonesia's UU No. 27 Tahun 2022 (UU PDP) does not let the same
 * sentence carry both: Art. 22(2) requires a request covering more than one
 * purpose to state each purpose and to be separable, and Art. 22(3) voids a
 * consent that fails it. So this funnel asks twice:
 *
 *   1. `consentProcessing` — REQUIRED. Collecting and processing the name, the
 *      email, the quiz answers and the cognitive result, in order to run the
 *      assessment and send the result; and the transfer of that data out of
 *      Indonesia, which Art. 56 requires consent for where the receiving
 *      country has no adequacy finding. The assessment cannot run without it,
 *      which is why the landing page refuses to start the run until it is
 *      ticked.
 *
 *   2. `consentMarketing` — OPTIONAL. Newsletters, brain-health mail and event
 *      invitations. A separate purpose, so a separate tick, and refusing it
 *      changes nothing about the assessment. `consentMarketingNote` says so on
 *      screen, because a visitor who believes the free assessment depends on it
 *      has not given the freely-made consent Art. 20 asks for.
 *
 * The two land in separate columns — `consent_analytics` and
 * `consent_marketing` — so a PDP request about marketing is answered from the
 * column that actually holds the answer. See db/migrations/022.
 *
 * ---------------------------------------------------------------------------
 * WHAT THE NOTICE BELOW THE HERO HAS TO CARRY
 * ---------------------------------------------------------------------------
 * Art. 21(1) lists what the data subject must be told BEFORE consent is taken:
 * the lawfulness of the processing, its purpose, the types of personal data,
 * the retention period of the documents holding it, the details of the
 * information collected, the period of processing, and their rights. `items`
 * below is that list, in that order, and `rights` is Art. 5–13. Nothing there
 * is decorative — dropping a row drops a disclosure the law names.
 *
 * The quiz answers and the cognitive result are health data, which Art. 4(2)
 * makes *data pribadi spesifik*: the notice says so rather than filing them
 * under "your details".
 *
 * ---------------------------------------------------------------------------
 * LANGUAGE
 * ---------------------------------------------------------------------------
 * Both languages translate in full, and the Indonesian is the operative text —
 * `languageNote` says so in the English version. Art. 22(1) wants the request
 * in language the data subject understands, and a consent given in Indonesia is
 * read in Indonesian; the English is a courtesy for a clinician who picked it,
 * not a second agreement.
 */

import type { ClinicSignupIdLang } from "src/i18n/clinicSignupId";

/**
 * The wording the visitor agreed to, recorded with the row.
 *
 * Art. 20(2) puts the burden of proving consent on the controller, and "they
 * ticked a box" is not proof of *what* they ticked. Bump this whenever any
 * string below changes in substance, so an old row still says which text it
 * answered. /api/save-lead writes it to `consent_version`.
 */
export const CLINIC_SIGNUP_ID_CONSENT_VERSION = "clinic-signup-id/2026-09-17";

/**
 * How long a lead row is kept, stated because Art. 21(1)(d) requires the
 * retention period to be disclosed before consent — a notice that leaves it out
 * is incomplete, so this cannot be left blank the way an unset URL can.
 *
 * 24 months is this file's assumption, not a decision from the clinical or
 * legal team. Change the number here and in both `items` rows if theirs differs.
 */
export const CLINIC_SIGNUP_ID_RETENTION_MONTHS = 24;

/** One labelled row of the Art. 21(1) notice. */
export type ConsentNoticeItem = {
  term: string;
  detail: string;
};

export type ClinicSignupIdConsentCopy = {
  /** The small line above the tickboxes, as the design sets it. */
  heading: string;
  /**
   * The authorisation confirmation, above both tickboxes. Answering for someone
   * else is processing that person's data, which needs their consent and not
   * only the filler's say-so — so the line says both.
   */
  ownBehalf: string;
  /** The chips that mark each tickbox, so which is which is visible at a glance. */
  requiredMark: string;
  optionalMark: string;
  /** Tickbox 1 — required. Processing, incl. the transfer out of Indonesia. */
  consentProcessing: string;
  /** Tickbox 2 — optional. Marketing, and the line that says it is optional. */
  consentMarketing: string;
  consentMarketingNote: string;
  /** Shown when the run is started without the required tick. */
  errProcessing: string;

  /**
   * The short notice that stays with the form, pointing at the full one.
   *
   * Art. 21 wants the disclosure given before consent is taken, not merely
   * available somewhere — so the summary names the controller, the lawful
   * basis and what the full notice covers, rather than being a bare "see our
   * policy" link. Split around the link's own words.
   */
  noticeSummaryLead: string;
  noticeLinkLabel: string;
  noticeSummaryTail: string;

  /* ------------------------------------------- the notice on its own page -- */
  /** <title> for /clinic-signup-id/privacy. */
  pageTitle: string;
  /** The way back, for a clinician who opened the notice mid-sign-up. */
  backToSignup: string;
  noticeTitle: string;
  /** Names the controller and the law the notice is given under. */
  noticeLead: string;
  /** Art. 21(1)(a)–(f), in the order the article lists them. */
  items: readonly ConsentNoticeItem[];
  /** Art. 5–13. */
  rightsTitle: string;
  rights: readonly string[];
  /**
   * Withdrawal, split around the contact address: it renders as a mailto link
   * once GMS_PDP_CONTACT_EMAIL is set and the sentence closes without an
   * address until then.
   */
  withdrawLead: string;
  withdrawTail: string;
  /** Where to write, when there is an address to write to. */
  contactLead: string;
  contactTail: string;
  /** Split around the policy's name, which links once the URL is set. */
  policyLead: string;
  policyName: string;
  policyTail: string;
  /** The mailing-platform notice, as Mailchimp's own guidance asks for it. */
  processorNote: string;
  /** Which language governs. Empty in the Indonesian set — it is the governing one. */
  languageNote: string;
  /** Art. 25: a child's data needs a parent or guardian. */
  minorsNote: string;
  /** So a clinician can see which wording they are agreeing to. */
  versionLabel: string;
};

const RETENTION = CLINIC_SIGNUP_ID_RETENTION_MONTHS;

/* ==================================================== Bahasa Indonesia ==== */

const ID: ClinicSignupIdConsentCopy = {
  heading: "Sebelum mulai, mohon baca dan setujui hal berikut:",
  ownBehalf:
    "Saya mengisi formulir ini atas nama saya sendiri; atau atas nama orang lain, dan saya menyatakan bahwa orang tersebut telah memberikan persetujuannya serta saya berwenang memberikan jawaban dalam formulir ini.",
  requiredMark: "Wajib",
  optionalMark: "Opsional",
  consentProcessing:
    "Saya menyetujui Gray Matter Solutions Pte Ltd mengumpulkan dan memproses nama, alamat email, jawaban kuis, dan hasil penilaian kognitif saya — termasuk data kesehatan saya — untuk menjalankan penilaian ini dan mengirimkan hasilnya kepada saya, serta menyetujui pengiriman data tersebut ke luar wilayah Republik Indonesia sebagaimana dijelaskan di bawah.",
  consentMarketing:
    "Saya menyetujui Gray Matter Solutions menghubungi saya melalui email berisi buletin, informasi kesehatan otak, dan undangan acara.",
  consentMarketingNote:
    "Persetujuan ini opsional. Penilaian tetap gratis dan hasil Anda tetap dikirim meskipun kotak ini tidak dicentang.",
  errProcessing: "Mohon setujui pemrosesan data pribadi Anda untuk melanjutkan.",

  noticeSummaryLead:
    "Data pribadi Anda dikumpulkan dan diproses oleh Gray Matter Solutions Pte Ltd atas dasar persetujuan Anda, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi. Rincian lengkapnya — tujuan, jenis data, jangka waktu penyimpanan, pengiriman ke luar wilayah Indonesia, dan hak Anda — ada dalam ",
  noticeLinkLabel: "Pemberitahuan Pelindungan Data Pribadi",
  noticeSummaryTail: ", yang terbuka di tab baru agar isian Anda tidak hilang.",

  pageTitle: "Pemberitahuan Pelindungan Data Pribadi | ReCOGnAIze",
  backToSignup: "← Kembali ke formulir pendaftaran",
  noticeTitle: "Pemberitahuan Pelindungan Data Pribadi",
  noticeLead:
    "Pengendali Data Pribadi Anda adalah Gray Matter Solutions Pte Ltd, sebuah perseroan yang berkedudukan di Singapura. Pemberitahuan ini diberikan sebelum persetujuan Anda diminta, sebagaimana diatur Pasal 21 Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.",
  items: [
    {
      term: "Dasar pemrosesan",
      detail:
        "Persetujuan Anda yang sah dan eksplisit, sesuai Pasal 20 ayat (2) huruf a UU No. 27 Tahun 2022.",
    },
    {
      term: "Tujuan pemrosesan",
      detail:
        "Menjalankan penilaian, menghitung skor kecepatan pemrosesan serta profil risiko Anda, menyusun laporan, dan mengirimkan hasilnya ke alamat email Anda. Bila Anda mencentang kotak opsional, juga untuk mengirimkan buletin, informasi kesehatan otak, dan undangan acara.",
    },
    {
      term: "Jenis data pribadi",
      detail:
        "Data pribadi yang bersifat umum: nama dan alamat email. Data pribadi yang bersifat spesifik: jawaban kuesioner kesehatan dan hasil penilaian kognitif Anda, yang merupakan data kesehatan menurut Pasal 4 ayat (2).",
    },
    {
      term: "Rincian informasi yang dikumpulkan",
      detail:
        "Nama, alamat email, jawaban atas setiap pertanyaan kuis, skor permainan waktu reaksi, skor kesehatan otak serta tingkat risiko yang dihitung dari jawaban tersebut, waktu pengisian, dan data teknis tautan yang Anda gunakan (sumber, media, dan kampanye UTM serta halaman perujuk).",
    },
    {
      term: "Jangka waktu pemrosesan",
      detail:
        "Sejak Anda mengirimkan formulir ini sampai tujuan di atas selesai atau Anda menarik persetujuan — mana yang lebih dahulu.",
    },
    {
      term: "Jangka waktu penyimpanan",
      detail: `Dokumen yang memuat data pribadi Anda disimpan selama ${RETENTION} bulan sejak penilaian terakhir Anda, kemudian dihapus atau dimusnahkan. Anda dapat meminta penghapusan lebih awal kapan saja.`,
    },
    {
      term: "Pengiriman ke luar wilayah Indonesia",
      detail:
        "Gray Matter Solutions Pte Ltd berkedudukan di Singapura, dan penyedia layanan email serta basis data kami memproses data di luar wilayah Republik Indonesia. Pengiriman tersebut dilakukan dengan perlindungan yang setara dengan UU No. 27 Tahun 2022 dan atas dasar persetujuan Anda, sesuai Pasal 56.",
    },
    {
      term: "Sifat hasil penilaian",
      detail:
        "Skor dan tingkat risiko dihitung secara otomatis dari jawaban Anda. Hasilnya bersifat edukatif untuk skrining kesejahteraan, bukan diagnosis medis, dan tidak menggantikan pemeriksaan tenaga kesehatan.",
    },
  ],
  rightsTitle: "Hak Anda sebagai Subjek Data Pribadi",
  rights: [
    "Memperoleh informasi tentang identitas kami, dasar hukum, tujuan, dan akuntabilitas pemrosesan data Anda.",
    "Mengakses dan memperoleh salinan data pribadi Anda.",
    "Memperbaiki atau memperbarui data pribadi Anda yang keliru.",
    "Mengakhiri pemrosesan, menghapus, dan/atau memusnahkan data pribadi Anda.",
    "Menarik persetujuan yang telah Anda berikan.",
    "Mengajukan keberatan atas keputusan yang semata-mata didasarkan pada pemrosesan otomatis.",
    "Menunda atau membatasi pemrosesan data pribadi Anda.",
    "Memperoleh dan menggunakan data pribadi Anda dalam format yang dapat dibaca sistem elektronik, serta mengirimkannya kepada pengendali lain.",
    "Menggugat dan menerima ganti rugi atas pelanggaran pemrosesan data pribadi Anda.",
  ],
  withdrawLead:
    "Anda dapat menarik persetujuan ini kapan saja — melalui tautan berhenti berlangganan di setiap email kami, atau dengan menghubungi kami",
  withdrawTail:
    ". Penarikan persetujuan tidak memengaruhi keabsahan pemrosesan yang dilakukan sebelum penarikan tersebut.",
  contactLead: " di ",
  contactTail: "",
  policyLead: "Keterangan selengkapnya mengenai praktik privasi kami ada dalam ",
  policyName: "Kebijakan Privasi",
  policyTail: " kami.",
  processorNote:
    "Kami menggunakan Mailchimp sebagai platform pemasaran kami. Dengan mendaftar, Anda memahami bahwa informasi Anda akan dikirimkan ke Mailchimp untuk diproses.",
  languageNote: "",
  minorsNote:
    "Formulir ini ditujukan untuk orang dewasa. Data pribadi anak hanya diproses dengan persetujuan orang tua atau wali, sesuai Pasal 25.",
  versionLabel: "Versi persetujuan",
};

/* ================================================================ English == */

const EN: ClinicSignupIdConsentCopy = {
  heading: "Before you start, please read and agree to the following:",
  ownBehalf:
    "I am completing this form on my own behalf; or on behalf of another person, and I confirm that they have given their consent and that I am authorised to provide the answers in this form.",
  requiredMark: "Required",
  optionalMark: "Optional",
  consentProcessing:
    "I consent to Gray Matter Solutions Pte Ltd collecting and processing my name, email address, quiz answers and cognitive assessment result — including my health data — in order to run this assessment and send me the result, and to that data being transferred outside the Republic of Indonesia as described below.",
  consentMarketing:
    "I consent to Gray Matter Solutions contacting me by email with newsletters, brain health information and event invitations.",
  consentMarketingNote:
    "This consent is optional. The assessment is free and your result is sent whether or not you tick this box.",
  errProcessing: "Please agree to the processing of your personal data to continue.",

  noticeSummaryLead:
    "Your personal data is collected and processed by Gray Matter Solutions Pte Ltd on the basis of your consent, under Law No. 27 of 2022 on Personal Data Protection. The full details — purposes, data types, retention, transfer outside Indonesia and your rights — are in the ",
  noticeLinkLabel: "Personal Data Protection Notice",
  noticeSummaryTail: ", which opens in a new tab so you don't lose what you have typed.",

  pageTitle: "Personal Data Protection Notice | ReCOGnAIze",
  backToSignup: "← Back to the sign-up form",
  noticeTitle: "Personal Data Protection Notice",
  noticeLead:
    "The Personal Data Controller is Gray Matter Solutions Pte Ltd, a company incorporated in Singapore. This notice is given before your consent is requested, as Article 21 of Law No. 27 of 2022 on Personal Data Protection requires.",
  items: [
    {
      term: "Lawful basis",
      detail:
        "Your valid and explicit consent, under Article 20(2)(a) of Law No. 27 of 2022.",
    },
    {
      term: "Purpose of processing",
      detail:
        "To run the assessment, calculate your processing-speed score and risk profile, produce your report, and send the result to your email address. If you tick the optional box, also to send you newsletters, brain health information and event invitations.",
    },
    {
      term: "Types of personal data",
      detail:
        "General personal data: your name and email address. Specific personal data: your health questionnaire answers and cognitive assessment result, which are health data under Article 4(2).",
    },
    {
      term: "Details of the information collected",
      detail:
        "Your name, email address, your answer to each quiz question, your reaction-time game score, the brain health score and risk level calculated from those answers, the time you submitted, and technical details of the link you arrived on (UTM source, medium and campaign, and the referring page).",
    },
    {
      term: "Period of processing",
      detail:
        "From the moment you submit this form until the purposes above are fulfilled or you withdraw your consent, whichever is sooner.",
    },
    {
      term: "Retention period",
      detail: `Documents containing your personal data are kept for ${RETENTION} months from your most recent assessment and then deleted or destroyed. You may ask us to erase them sooner at any time.`,
    },
    {
      term: "Transfer outside Indonesia",
      detail:
        "Gray Matter Solutions Pte Ltd is based in Singapore, and our email and database providers process data outside the Republic of Indonesia. Those transfers are made with protection equivalent to Law No. 27 of 2022 and on the basis of your consent, under Article 56.",
    },
    {
      term: "Nature of the result",
      detail:
        "Your score and risk level are calculated automatically from your answers. The result is educational, for wellness screening, and is not a medical diagnosis or a substitute for examination by a health professional.",
    },
  ],
  rightsTitle: "Your rights as a Personal Data Subject",
  rights: [
    "To be told who we are, the lawful basis, the purpose and the accountability for processing your data.",
    "To access and obtain a copy of your personal data.",
    "To correct or update your personal data where it is inaccurate.",
    "To end the processing of, erase and/or destroy your personal data.",
    "To withdraw a consent you have given.",
    "To object to a decision based solely on automated processing.",
    "To postpone or restrict the processing of your personal data.",
    "To obtain and use your personal data in a machine-readable format, and to have it sent to another controller.",
    "To sue for and receive compensation for a breach in the processing of your personal data.",
  ],
  withdrawLead:
    "You may withdraw this consent at any time — through the unsubscribe link in any of our emails, or by contacting us",
  withdrawTail:
    ". Withdrawing consent does not affect the lawfulness of processing carried out before the withdrawal.",
  contactLead: " at ",
  contactTail: "",
  policyLead: "For more about our privacy practices, see our ",
  policyName: "Privacy Policy",
  policyTail: ".",
  processorNote:
    "We use Mailchimp as our marketing platform. By registering you acknowledge that your information will be transferred to Mailchimp for processing.",
  languageNote:
    "This English text is a translation for your convenience. The Indonesian version of this consent is the one that governs.",
  minorsNote:
    "This form is intended for adults. A child's personal data is processed only with the consent of a parent or guardian, under Article 25.",
  versionLabel: "Consent version",
};

const BY_LANG: Record<ClinicSignupIdLang, ClinicSignupIdConsentCopy> = { en: EN, id: ID };

export const clinicSignupIdConsentCopy = (
  lang: ClinicSignupIdLang
): ClinicSignupIdConsentCopy => BY_LANG[lang] ?? ID;
