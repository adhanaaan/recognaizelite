/**
 * Malay (Bahasa Melayu) question bank for the Brain Health Quiz.
 *
 * A translation of `src/data/brainHealthQuestions.ts`, item for item, with
 * every `id`, `score`, `axis`, `citation` and `showIf` left exactly as the
 * English bank has them. Scoring runs off the English bank's ids
 * (`src/lib/brainHealthScoring.ts` reads `QUESTIONS_BY_ID`), so a run answered
 * in Malay scores identically to the same run answered in English — only the
 * words on screen change. Mirrors `brainHealthQuestions.zh.ts`.
 */

import type { Question } from "src/types/quiz";

export const QUESTIONS_MS: Question[] = [
  {
    id: "age",
    type: "single-select",
    axis: "risk",
    prompt: "Berapa umur anda?",
    citation: "caide",
    options: [
      { id: "18-29", label: "18 hingga 29", score: 0 },
      { id: "30-39", label: "30 hingga 39", score: 0 },
      { id: "40-49", label: "40 hingga 49", score: 4 },
      { id: "50-59", label: "50 hingga 59", score: 8 },
      { id: "60+", label: "60 dan ke atas", score: 12 },
    ],
  },
  {
    id: "sex",
    type: "single-select",
    axis: "meta",
    prompt: "Apakah jantina anda semasa lahir?",
    options: [
      { id: "female", label: "Perempuan", score: 0 },
      { id: "male", label: "Lelaki", score: 0 },
    ],
  },
  {
    id: "hotFlushes",
    type: "single-select",
    axis: "risk",
    prompt: "Pernahkah anda perasan rasa panas mendadak, berpeluh malam, atau perubahan haid?",
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
    prompt: "Adakah anda mempunyai sejarah keluarga demensia atau Alzheimer?",
    citation: "caide",
    options: [
      { id: "immediate", label: "Ya, keluarga terdekat (ibu bapa atau adik-beradik)", score: 8 },
      { id: "extended", label: "Ya, keluarga lanjutan (nenek kakek, bapa/emak saudara)", score: 4 },
      { id: "none", label: "Tidak", score: 0 },
      { id: "unsure", label: "Saya tidak pasti", score: 0 },
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
      { id: "unsure", label: "Tidak pasti", score: 0 },
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
      { id: "unsure", label: "Tidak pasti", score: 0 },
    ],
  },
  {
    id: "diabetes",
    type: "single-select",
    axis: "risk",
    prompt: "Diabetes atau pra-diabetes?",
    citation: "lancet2024",
    options: [
      { id: "yes", label: "Ya", score: 4 },
      { id: "no", label: "Tidak", score: 0 },
      { id: "unsure", label: "Tidak pasti", score: 0 },
    ],
  },
  {
    id: "hearingLoss",
    type: "single-select",
    axis: "risk",
    prompt: "Kehilangan pendengaran tanpa rawatan?",
    helpText: "Tanpa alat bantu pendengaran atau bantuan lain.",
    citation: "lancet2024",
    options: [
      { id: "yes", label: "Ya", score: 8 },
      { id: "no", label: "Tidak", score: 0 },
      { id: "unsure", label: "Tidak pasti", score: 0 },
    ],
  },
  {
    id: "visionLoss",
    type: "single-select",
    axis: "risk",
    prompt: "Kehilangan penglihatan tanpa rawatan?",
    helpText: "Tidak diperbetulkan dengan cermin mata, kanta atau pembedahan.",
    citation: "lancet2024",
    options: [
      { id: "yes", label: "Ya", score: 4 },
      { id: "no", label: "Tidak", score: 0 },
      { id: "unsure", label: "Tidak pasti", score: 0 },
    ],
  },
  {
    id: "smoking",
    type: "single-select",
    axis: "risk",
    prompt: "Adakah anda merokok sekarang, atau pernah merokok dalam 10 tahun lepas?",
    citation: "lancet2024",
    options: [
      { id: "current", label: "Saya merokok sekarang", score: 4 },
      { id: "past", label: "Saya merokok dalam 10 tahun lepas", score: 2 },
      { id: "never", label: "Tidak pernah, atau lebih 10 tahun lalu", score: 0 },
    ],
  },
  {
    id: "sleep",
    type: "single-select",
    axis: "risk",
    prompt: "Secara purata, berapa lama anda tidur pada waktu malam?",
    citation: "lancet2024",
    options: [
      { id: "lt6", label: "Kurang daripada 6 jam", score: 4 },
      { id: "6to7", label: "6 hingga 7 jam", score: 2 },
      { id: "7to9", label: "7 hingga 9 jam", score: 0 },
      { id: "gt9", label: "Lebih daripada 9 jam", score: 2 },
    ],
  },
  {
    id: "exercise",
    type: "single-select",
    axis: "risk",
    prompt: "Berapa banyak senaman kardio anda lakukan setiap minggu?",
    citation: "lancet2024",
    options: [
      { id: "lt75", label: "Kurang daripada 75 minit", score: 4 },
      { id: "75to149", label: "75 hingga 149 minit", score: 2 },
      { id: "150to300", label: "150 hingga 300 minit", score: 0 },
      { id: "gt300", label: "Lebih daripada 300 minit", score: 0 },
    ],
  },
  {
    id: "diet",
    type: "single-select",
    axis: "risk",
    prompt: "Bagaimana anda menggambarkan pemakanan anda?",
    citation: "lancet2024",
    options: [
      { id: "poor", label: "Kebanyakannya diproses atau tinggi gula", score: 4 },
      { id: "moderate", label: "Campuran makanan segar dan diproses", score: 2 },
      { id: "healthy", label: "Kebanyakannya segar dan seimbang", score: 0 },
    ],
  },
  {
    id: "alcohol",
    type: "single-select",
    axis: "risk",
    prompt: "Berapa banyak minuman beralkohol anda ambil setiap minggu?",
    helpText:
      "1 minuman bersamaan kira-kira 1 gelas wain kecil, setengah pain bir, atau 1 syot spirit.",
    citation: "whitehall",
    options: [
      { id: "none", label: "Tiada", score: 0 },
      { id: "1to7", label: "1 hingga 7", score: 0 },
      { id: "8to14", label: "8 hingga 14", score: 0 },
      { id: "15to21", label: "15 hingga 21", score: 2 },
      { id: "gt21", label: "Lebih daripada 21", score: 4 },
    ],
  },
  {
    id: "tracks",
    type: "multi-select",
    axis: "meta",
    multiSelect: true,
    prompt: "Apa yang anda sudah pantau?",
    helpText: "Pilih semua yang berkenaan.",
    options: [
      {
        id: "performance",
        label: "Produktiviti, fokus atau prestasi kerja",
        score: 0,
        personaSignal: "highPerformer",
      },
      {
        id: "biometrics",
        label: "Tidur, HRV, kekuatan atau suplemen",
        score: 0,
        personaSignal: "highPerformer",
      },
      {
        id: "hormones",
        label: "Hormon, haid atau gejala menopaus",
        score: 0,
        personaSignal: "perimenopausal",
      },
      {
        id: "family",
        label: "Kesihatan anggota keluarga (saya menjaga seseorang)",
        score: 0,
        personaSignal: "caregiver",
      },
      { id: "nothing", label: "Tiada yang tertentu", score: 0, personaSignal: "neutral" },
    ],
  },
  {
    id: "concentrating",
    type: "single-select",
    axis: "symptom",
    prompt: "Berapa kerap anda sukar menumpukan perhatian dalam mesyuarat atau tugasan panjang?",
    citation: "scd",
    control: "slider",
    options: [
      { id: "almostDaily", label: "Hampir setiap hari", score: 4 },
      { id: "severalWeek", label: "Beberapa kali seminggu", score: 2 },
      { id: "rarely", label: "Jarang", score: 0 },
      { id: "notNotice", label: "Tidak saya perasan", score: 0 },
    ],
  },
  {
    id: "judgement",
    type: "single-select",
    axis: "symptom",
    prompt:
      "Berbanding beberapa tahun lalu, berapa kerap anda menghadapi masalah pertimbangan atau membuat keputusan?",
    citation: "scd",
    control: "slider",
    options: [
      { id: "almostDaily", label: "Hampir setiap hari", score: 4 },
      { id: "severalWeek", label: "Beberapa kali seminggu", score: 2 },
      { id: "rarely", label: "Jarang", score: 0 },
      { id: "notNotice", label: "Tidak saya perasan", score: 0 },
    ],
  },
  {
    id: "forgetfulness",
    type: "single-select",
    axis: "symptom",
    prompt:
      "Berapa kerap anda terlupa, seperti di mana anda letak sesuatu atau apa yang anda hendak lakukan?",
    citation: "scd",
    control: "slider",
    options: [
      { id: "almostDaily", label: "Hampir setiap hari", score: 4 },
      { id: "severalWeek", label: "Beberapa kali seminggu", score: 2 },
      { id: "rarely", label: "Jarang", score: 0 },
      { id: "notNotice", label: "Tidak saya perasan", score: 0 },
    ],
  },
  {
    id: "persistence",
    type: "single-select",
    axis: "symptom",
    prompt: "Adakah keadaan terlupa ini berterusan dan bukan sekali sekala?",
    citation: "scd",
    showIf: { questionId: "forgetfulness", equals: ["almostDaily", "severalWeek", "rarely"] },
    options: [
      { id: "yes", label: "Ya, ia berterusan", score: 12 },
      { id: "no", label: "Tidak, ia datang dan pergi", score: 0 },
    ],
  },
  {
    id: "someoneElseNoticed",
    type: "single-select",
    axis: "symptom",
    prompt:
      "Pernahkah keluarga atau rakan menyebut mereka perasan perubahan pada tingkah laku atau tabiat anda, walaupun anda tidak?",
    citation: "scd",
    options: [
      { id: "yes", label: "Ya", score: 8 },
      { id: "no", label: "Tidak", score: 0 },
    ],
  },
];

export const QUESTIONS_MS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS_MS.map((q) => [q.id, q])
);
