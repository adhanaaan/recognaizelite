/**
 * Indonesian (Bahasa Indonesia) question bank for the Brain Health Quiz.
 *
 * A translation of `src/data/brainHealthQuestions.ts`, item for item, with
 * every `id`, `score`, `axis`, `citation` and `showIf` left exactly as the
 * English bank has them. Scoring runs off the English bank's ids
 * (`src/lib/brainHealthScoring.ts` reads `QUESTIONS_BY_ID`), so a run answered
 * in Indonesian scores identically to the same run answered in English — only
 * the words on screen change. Mirrors `brainHealthQuestions.ms.ts`.
 *
 * "ID" throughout is the language, the ISO 639-1 code for Indonesian, which is
 * why the exported map reads `QUESTIONS_ID_BY_ID`: the Indonesian bank, keyed
 * by question id.
 */

import type { Question } from "src/types/quiz";

export const QUESTIONS_ID: Question[] = [
  {
    id: "age",
    type: "single-select",
    axis: "risk",
    prompt: "Berapa usia Anda?",
    citation: "caide",
    options: [
      { id: "18-29", label: "18 hingga 29", score: 0 },
      { id: "30-39", label: "30 hingga 39", score: 0 },
      { id: "40-49", label: "40 hingga 49", score: 4 },
      { id: "50-59", label: "50 hingga 59", score: 8 },
      { id: "60+", label: "60 tahun ke atas", score: 12 },
    ],
  },
  {
    id: "sex",
    type: "single-select",
    axis: "meta",
    prompt: "Apa jenis kelamin Anda saat lahir?",
    options: [
      { id: "female", label: "Perempuan", score: 0 },
      { id: "male", label: "Laki-laki", score: 0 },
    ],
  },
  {
    id: "hotFlushes",
    type: "single-select",
    axis: "risk",
    prompt: "Apakah Anda merasakan hot flash, keringat malam, atau perubahan siklus menstruasi?",
    citation: "straw10",
    showIf: { questionId: "sex", equals: "female" },
    options: [
      { id: "yes", label: "Ya", score: 4 },
      { id: "no", label: "Tidak", score: 0 },
    ],
  },
  {
    id: "familyHistory",
    type: "single-select",
    axis: "risk",
    prompt: "Apakah ada riwayat demensia atau Alzheimer dalam keluarga Anda?",
    citation: "caide",
    options: [
      { id: "immediate", label: "Ya, keluarga inti (orang tua atau saudara kandung)", score: 8 },
      { id: "extended", label: "Ya, keluarga besar (kakek-nenek, paman, dan bibi)", score: 4 },
      { id: "none", label: "Tidak", score: 0 },
      { id: "unsure", label: "Saya tidak yakin", score: 0 },
    ],
  },
  {
    id: "highBp",
    type: "single-select",
    axis: "risk",
    prompt: "Tekanan darah tinggi?",
    citation: "lancet2024",
    options: [
      { id: "yes", label: "Ya", score: 4 },
      { id: "no", label: "Tidak", score: 0 },
      { id: "unsure", label: "Tidak yakin", score: 0 },
    ],
  },
  {
    id: "highCholesterol",
    type: "single-select",
    axis: "risk",
    prompt: "Kolesterol tinggi?",
    citation: "lancet2024",
    options: [
      { id: "yes", label: "Ya", score: 4 },
      { id: "no", label: "Tidak", score: 0 },
      { id: "unsure", label: "Tidak yakin", score: 0 },
    ],
  },
  {
    id: "diabetes",
    type: "single-select",
    axis: "risk",
    prompt: "Diabetes atau pradiabetes?",
    citation: "lancet2024",
    options: [
      { id: "yes", label: "Ya", score: 4 },
      { id: "no", label: "Tidak", score: 0 },
      { id: "unsure", label: "Tidak yakin", score: 0 },
    ],
  },
  {
    id: "hearingLoss",
    type: "single-select",
    axis: "risk",
    prompt: "Gangguan pendengaran yang tidak ditangani?",
    helpText: "Tanpa alat bantu dengar atau bantuan lainnya.",
    citation: "lancet2024",
    options: [
      { id: "yes", label: "Ya", score: 8 },
      { id: "no", label: "Tidak", score: 0 },
      { id: "unsure", label: "Tidak yakin", score: 0 },
    ],
  },
  {
    id: "visionLoss",
    type: "single-select",
    axis: "risk",
    prompt: "Gangguan penglihatan yang tidak ditangani?",
    helpText: "Belum dikoreksi dengan kacamata, lensa, atau operasi.",
    citation: "lancet2024",
    options: [
      { id: "yes", label: "Ya", score: 4 },
      { id: "no", label: "Tidak", score: 0 },
      { id: "unsure", label: "Tidak yakin", score: 0 },
    ],
  },
  {
    id: "smoking",
    type: "single-select",
    axis: "risk",
    prompt: "Apakah Anda perokok aktif, atau pernah merokok dalam 10 tahun terakhir?",
    citation: "lancet2024",
    options: [
      { id: "current", label: "Saya merokok saat ini", score: 4 },
      { id: "past", label: "Saya merokok dalam 10 tahun terakhir", score: 2 },
      { id: "never", label: "Tidak pernah, atau lebih dari 10 tahun lalu", score: 0 },
    ],
  },
  {
    id: "sleep",
    type: "single-select",
    axis: "risk",
    prompt: "Rata-rata, berapa lama Anda tidur di malam hari?",
    citation: "lancet2024",
    options: [
      { id: "lt6", label: "Kurang dari 6 jam", score: 4 },
      { id: "6to7", label: "6 hingga 7 jam", score: 2 },
      { id: "7to9", label: "7 hingga 9 jam", score: 0 },
      { id: "gt9", label: "Lebih dari 9 jam", score: 2 },
    ],
  },
  {
    id: "exercise",
    type: "single-select",
    axis: "risk",
    prompt: "Berapa banyak olahraga kardio yang Anda lakukan per minggu?",
    citation: "lancet2024",
    options: [
      { id: "lt75", label: "Kurang dari 75 menit", score: 4 },
      { id: "75to149", label: "75 hingga 149 menit", score: 2 },
      { id: "150to300", label: "150 hingga 300 menit", score: 0 },
      { id: "gt300", label: "Lebih dari 300 menit", score: 0 },
    ],
  },
  {
    id: "diet",
    type: "single-select",
    axis: "risk",
    prompt: "Bagaimana Anda menggambarkan pola makan Anda?",
    citation: "lancet2024",
    options: [
      { id: "poor", label: "Sebagian besar olahan atau tinggi gula", score: 4 },
      { id: "moderate", label: "Campuran makanan segar dan olahan", score: 2 },
      { id: "healthy", label: "Sebagian besar segar dan seimbang", score: 0 },
    ],
  },
  {
    id: "alcohol",
    type: "single-select",
    axis: "risk",
    prompt: "Berapa gelas minuman beralkohol yang Anda konsumsi per minggu?",
    helpText: "1 gelas kira-kira setara 1 gelas kecil anggur, setengah botol bir, atau 1 sloki minuman keras.",
    citation: "whitehall",
    options: [
      { id: "none", label: "Tidak ada", score: 0 },
      { id: "1to7", label: "1 hingga 7", score: 0 },
      { id: "8to14", label: "8 hingga 14", score: 0 },
      { id: "15to21", label: "15 hingga 21", score: 2 },
      { id: "gt21", label: "Lebih dari 21", score: 4 },
    ],
  },
  {
    id: "tracks",
    type: "multi-select",
    axis: "meta",
    multiSelect: true,
    prompt: "Apa yang sudah Anda pantau selama ini?",
    helpText: "Pilih semua yang sesuai.",
    options: [
      {
        id: "performance",
        label: "Produktivitas, fokus, atau performa kerja",
        score: 0,
        personaSignal: "highPerformer",
      },
      {
        id: "biometrics",
        label: "Tidur, HRV, kekuatan, atau suplemen",
        score: 0,
        personaSignal: "highPerformer",
      },
      {
        id: "hormones",
        label: "Hormon, siklus menstruasi, atau gejala menopause",
        score: 0,
        personaSignal: "perimenopausal",
      },
      {
        id: "family",
        label: "Kesehatan anggota keluarga (saya ikut merawat seseorang)",
        score: 0,
        personaSignal: "caregiver",
      },
      { id: "nothing", label: "Tidak ada yang khusus", score: 0, personaSignal: "neutral" },
    ],
  },
  {
    id: "concentrating",
    type: "single-select",
    axis: "symptom",
    prompt: "Seberapa sering Anda sulit berkonsentrasi dalam rapat atau tugas yang panjang?",
    citation: "scd",
    control: "slider",
    options: [
      { id: "almostDaily", label: "Hampir setiap hari", score: 4 },
      { id: "severalWeek", label: "Beberapa kali seminggu", score: 2 },
      { id: "rarely", label: "Jarang", score: 0 },
      { id: "notNotice", label: "Tidak saya rasakan", score: 0 },
    ],
  },
  {
    id: "judgement",
    type: "single-select",
    axis: "symptom",
    prompt:
      "Dibandingkan beberapa tahun lalu, seberapa sering Anda mengalami kesulitan dalam menilai sesuatu atau mengambil keputusan?",
    citation: "scd",
    control: "slider",
    options: [
      { id: "almostDaily", label: "Hampir setiap hari", score: 4 },
      { id: "severalWeek", label: "Beberapa kali seminggu", score: 2 },
      { id: "rarely", label: "Jarang", score: 0 },
      { id: "notNotice", label: "Tidak saya rasakan", score: 0 },
    ],
  },
  {
    id: "forgetfulness",
    type: "single-select",
    axis: "symptom",
    prompt:
      "Seberapa sering Anda mengalami lupa, misalnya lupa menaruh barang atau lupa apa yang hendak Anda lakukan?",
    citation: "scd",
    control: "slider",
    options: [
      { id: "almostDaily", label: "Hampir setiap hari", score: 4 },
      { id: "severalWeek", label: "Beberapa kali seminggu", score: 2 },
      { id: "rarely", label: "Jarang", score: 0 },
      { id: "notNotice", label: "Tidak saya rasakan", score: 0 },
    ],
  },
  {
    id: "persistence",
    type: "single-select",
    axis: "symptom",
    prompt: "Apakah kelupaan ini berlangsung terus-menerus, bukan sesekali saja?",
    citation: "scd",
    showIf: { questionId: "forgetfulness", equals: ["almostDaily", "severalWeek", "rarely"] },
    options: [
      { id: "yes", label: "Ya, berlangsung terus-menerus", score: 12 },
      { id: "no", label: "Tidak, datang dan pergi", score: 0 },
    ],
  },
  {
    id: "someoneElseNoticed",
    type: "single-select",
    axis: "symptom",
    prompt:
      "Apakah keluarga atau teman pernah menyebut adanya perubahan pada perilaku atau kebiasaan Anda, meski Anda sendiri tidak menyadarinya?",
    citation: "scd",
    options: [
      { id: "yes", label: "Ya", score: 8 },
      { id: "no", label: "Tidak", score: 0 },
    ],
  },
];

export const QUESTIONS_ID_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS_ID.map((q) => [q.id, q])
);
