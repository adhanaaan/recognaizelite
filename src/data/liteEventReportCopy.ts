/**
 * Chinese and Malay copy for the /lite-event report — the personalised v2
 * report's four variants (optimizer/senior × strong/weak).
 *
 * The English copy stays where it was, in `liteTwoReportContent.ts`, shared
 * with /lite-two. This module only adds the other two languages and an
 * accessor that picks between the three, so /lite-two is untouched by the
 * /lite-event language toggle.
 *
 * The chip colours and rule colours are styling, not copy, so they are lifted
 * from the English sets rather than restated per language.
 */

import type { LiteEventLang } from "src/i18n/liteEvent";
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

/* ================================================================ 中文 ==== */

const ZH_PERKS = [
  "跟上节奏很快的对话",
  "迅速适应变化的环境",
  "在收银员扫完之前就算好账单",
] as const;

const ZH_STRUGGLES = [
  "快节奏的对话需要更费力才能跟上",
  "在嘈杂的环境里更难跟上进度",
  "算账单比以前花更久的时间",
] as const;

const ZH_STRONG_ACCENT = "如果这些对您来说毫不费力，您的分数正好说明了原因。";
const ZH_WEAK_ACCENT = "如果最近这些当中有任何一项让您觉得吃力，您的分数就是原因。";

const ZH_OPTIMIZER_RISK =
  "我们也看了您的风险因素——高血压、睡眠不足、运动不够这类健康与生活习惯，长期下来会拖慢大脑的速度。";

const ZH_SENIOR_RISK =
  "我们也看了您的风险因素。高血压、睡眠不足、听力损失或运动太少这类习惯，多年下来会拖慢您的思考速度。";

const ZH_OPTIMIZER_PRODUCT = {
  eyebrow: "开始测试",
  h2: "接下来该怎么做？做完整的 ReCOGnAIze 评估",
  bodyLead: "经磁共振扫描验证，基于南洋理工大学对 1,500 人的五年研究，成果发表于 ",
} as const;

const ZH_SENIOR_PRODUCT = {
  eyebrow: "测试如何进行",
  h2: "接下来该怎么做？做完整的 ReCOGnAIze 评估",
  bodyLead: "经磁共振脑部扫描验证，基于南洋理工大学对 1,500 名成人的五年研究，成果发表于 ",
} as const;

const zhWithName = (name: string | null, line: string) => (name ? `${name}，${line}` : line);

const ZH_COPY: Record<LiteTwoVariantKey, LiteTwoReportCopy> = {
  "optimizer-strong": {
    hero: {
      eyebrow: "反应速度挑战",
      h1Kind: "countup",
      h1: ({ name, percentile }) => zhWithName(name, `您的反应速度快过 ${percentile}% 的同龄人。`),
      sub: ({ topBand, domain }) => `这是您年龄组中${domain}排名前 ${topBand}% 的水平。`,
      scrollCue: "了解更多",
    },
    meaning: {
      intro: "处理速度快，意味着您可以：",
      perks: ZH_PERKS,
      accent: ZH_STRONG_ACCENT,
    },
    tip: {
      h2: ({ name }) => (name ? `${name}，这里有一个提升速度的小窍门` : "这里有一个提升速度的小窍门"),
      chip: "记忆",
      ...MEMORY_CHIP_STYLE,
      headline: "不用查看，就能想起朋友常喝的咖啡是什么。",
      body: "这类小细节说明您的记忆在帮您。练习在一整段对话中记住一个小信息——这能让快车道保持畅通。",
      shareText: "我从一个 60 秒大脑速度测试得到的建议：不用查看就想起朋友常喝的咖啡。来试试你的：",
    },
    risk: {
      body: ZH_OPTIMIZER_RISK,
      actionablesIntro: "以下是您现在就能做的 3 件事",
      actionables: [
        "保持现在的状态——您的速度很好，用规律的睡眠和运动把它守住。",
        "每天给大脑一点挑战——换一条上班路线、学一项新技能，或者调整一下日常安排。",
        "记录您的基线——做完整评估，日后就有一个可以对照的参考点。",
      ],
    },
    baseline: {
      eyebrow: "目前的基线",
      h2Lead: "您只完成了 ",
      h2Gradient: "5 项中的 2 项",
      paragraphs: [
        "速度游戏和您的问卷答案给了我们两个维度——速度与风险。",
        "但大脑不只有两个维度。记忆、注意力和执行功能各自说着不同的故事，一项表现好并不代表另一项没问题。",
        "完整测试会补上其余部分，让建议真正贴合您的大脑。",
      ],
    },
    product: ZH_OPTIMIZER_PRODUCT,
    closing: {
      quote: [
        "明天的会议不好开，如果注意力跟不上，我就发挥不出来。多亏检查了大脑，我现在知道该怎么调整了。很高兴发现了 ReCOGnAIze！",
      ],
      attribution: ({ ageLabel }) =>
        ageLabel ? `— Chelsea，和您一样 ${ageLabel} 岁` : "— Chelsea，与您年龄相近",
    },
    exit: {
      body: "您的分数已经发到邮箱，随附一份提升分数的简短策略。",
      body2: "当您准备好测试其余三个大脑领域时，随时来找我们。",
    },
  },

  "optimizer-weak": {
    hero: {
      eyebrow: "反应速度挑战",
      h1Kind: "plain",
      h1: ({ name }) => zhWithName(name, "今天大多数人的反应比您快。"),
      sub: ({ avgSeconds, percentile, domain }) =>
        avgSeconds
          ? `平均 ${avgSeconds} 秒——处于您年龄组的后 ${percentile}%。`
          : `这是您年龄组中${domain}排名后 ${percentile}% 的水平。`,
      scrollCue: "了解更多",
    },
    meaning: {
      intro: "速度更快能为您带来什么：",
      perks: ZH_PERKS,
      accent: ZH_WEAK_ACCENT,
    },
    tip: {
      h2: ({ name }) => (name ? `${name}，这里有一个提升速度的小窍门` : "这里有一个提升速度的小窍门"),
      chip: "速度",
      ...SPEED_CHIP_STYLE,
      headline: "一封邮件只看一遍，就直接处理掉。",
      body: "这样的练习能提升您吸收信息的速度。",
      shareText: "我从一个 60 秒大脑速度测试得到的建议：一封邮件只看一遍就处理掉。来试试你的：",
    },
    risk: {
      body: ZH_OPTIMIZER_RISK,
      actionablesIntro: "以下是您现在就能做的 3 件事",
      actionables: [
        "优先保证睡眠——目标 7 至 9 小时；哪怕多睡一小时，第二天的反应速度都会更好。",
        "动 20 分钟——快走或任何有氧运动都能促进大脑供血，改善处理速度。",
        "做完整评估——找出真正拖慢您的那个领域，才能对症下药。",
      ],
    },
    baseline: {
      eyebrow: "目前的基线",
      h2Lead: "您只完成了 ",
      h2Gradient: "5 项中的 2 项",
      paragraphs: [
        "速度游戏和您的问卷答案给了我们两个维度：速度与风险。今天速度偏低，而单独一天的一次游戏本身就有波动。",
        "记忆、注意力和执行功能各自说着不同的故事，速度慢也完全可能三者都很强。",
        "完整测试会找出真正拖住您的那一项，让策略对准真正的瓶颈。",
      ],
    },
    product: ZH_OPTIMIZER_PRODUCT,
    closing: {
      quote: [
        "五项里速度是我最差的，当时挺难受。结果问题不在速度，而是执行功能——这才是我下午总是崩掉的原因。修对了地方。很高兴发现了 ReCOGnAIze！",
      ],
      attribution: ({ ageLabel }) =>
        ageLabel ? `— Chelsea，和您一样 ${ageLabel} 岁` : "— Chelsea，与您年龄相近",
    },
    exit: {
      body: "您的分数已经发到邮箱，随附一份提升分数的简短策略。",
      body2: "当您准备好找出究竟是哪个领域在拖慢您时，随时来找我们。",
    },
  },

  "senior-strong": {
    hero: {
      eyebrow: "处理速度检测",
      h1Kind: "plain",
      h1: ({ name }) => zhWithName(name, "您的速度高于同年龄组的平均水平。"),
      sub: ({ avgSeconds, topBand, ageLabel, domain }) => {
        const cohort = ageLabel ? `${ageLabel} 岁人群中` : "同年龄组中";
        return avgSeconds
          ? `平均 ${avgSeconds} 秒——位于${cohort}的前 ${topBand}%。`
          : `这是${cohort}${domain}排名前 ${topBand}% 的水平。`;
      },
      scrollCue: "我们测了什么？",
    },
    meaning: {
      intro: "在日常生活中，您会在这些地方感受到：",
      perks: ZH_PERKS,
      accent: ZH_STRONG_ACCENT,
    },
    tip: {
      h2: ({ name }) => (name ? `根据您的档案，给 ${name} 一个建议` : "根据您的档案，给您一个建议"),
      chip: "记忆",
      ...MEMORY_CHIP_STYLE,
      headline: "不用查看，就能想起朋友常喝的咖啡是什么。",
      body: "这样的小回忆，正是您的记忆在工作。",
      shareText: "我从一个 60 秒大脑速度检测得到的建议：不用查看就想起朋友常喝的咖啡。来试试你的：",
    },
    risk: {
      body: ZH_SENIOR_RISK,
      actionablesIntro: "以下是您现在就能做的 3 件事",
      actionables: [
        "每天散步——哪怕 15 分钟，也有助于大脑供血，支持长期的认知健康。",
        "保持社交活跃——经常聊天和参加团体活动，能让大脑的多个领域都保持运作。",
        "用完整评估建立基线——这样您和医生日后就有数字可以对照。",
      ],
    },
    baseline: {
      eyebrow: "今天我们测了什么",
      h2Lead: "您只完成了 ",
      h2Gradient: "5 项中的 2 项",
      paragraphs: [
        "今天的游戏只测了一件事：您接收信息并作出反应的速度。您的问卷答案给了我们第二件事：您的风险状况。",
        "脑健康不是一个数字。记忆、注意力和执行功能各司其职，某一项稳而另一项慢，是很常见的。",
        "完整测试会覆盖其余三项，让我们的建议贴合您的整体状况。",
      ],
    },
    product: ZH_SENIOR_PRODUCT,
    closing: {
      quote: [
        "我常常在聊天时跟不上话题，一直以为是年纪的关系。报告显示是注意力退了，不是记忆。",
        "现在我清楚该在哪里用功，医生也有了数字。",
      ],
      attribution: () => "— Siew Ling，64 岁，与您年龄相近",
    },
    exit: {
      body: "您的结果已经发到邮箱，每一项分数都附有通俗的解释。",
      body2: "当您准备好检测其余三个领域时，我们就在这里。您也可以把报告带给医生看。",
    },
  },

  "senior-weak": {
    hero: {
      eyebrow: "处理速度检测",
      h1Kind: "plain",
      h1: ({ name }) => zhWithName(name, "今天您的速度低于同年龄组的水平。"),
      sub: ({ avgSeconds }) =>
        avgSeconds
          ? `平均 ${avgSeconds} 秒。单独一天的一次游戏并不构成诊断。`
          : "单独一天的一次游戏并不构成诊断。",
      scrollCue: "我们测了什么？",
    },
    meaning: {
      intro: "速度偏慢，常常会这样表现出来：",
      perks: ZH_STRUGGLES,
      accent: ZH_WEAK_ACCENT,
    },
    tip: {
      h2: () => "根据您的档案，这里有一件值得练习的事",
      chip: "速度",
      ...SPEED_CHIP_STYLE,
      headline: "读完一页，然后把主要意思说出来。",
      body: "这样的小练习能训练您吸收信息的速度。",
      shareText: "我从一个 60 秒大脑速度检测得到的建议：读完一页，然后把主要意思说出来。来试试你的：",
    },
    risk: {
      body: ZH_SENIOR_RISK,
      actionablesIntro: "以下是您现在就能做的 3 件事",
      actionables: [
        "每天散步——哪怕 15 分钟，也有助于大脑供血，支持思考速度。",
        "保持简单的作息——规律的三餐、稳定的睡眠和熟悉的安排，都能减轻大脑的负担。",
        "做完整评估——把结果分享给医生，让他们手上有数字，而不只是症状。",
      ],
    },
    baseline: {
      eyebrow: "今天我们测了什么",
      h2Lead: "您只完成了 ",
      h2Gradient: "5 项中的 2 项",
      paragraphs: [
        "今天的游戏只测了一件事：您接收信息并作出反应的速度。单独一天结果偏慢，可能只是疲倦、药物，或者单纯对游戏不熟悉。",
        "记忆、注意力和执行功能各司其职，速度慢并不能说明这三项的情况。",
        "完整测试会覆盖其余三项，让您和医生看到全貌，而不是一个数字。",
      ],
    },
    product: ZH_SENIOR_PRODUCT,
    closing: {
      quote: [
        "我第一次的分数比预期慢，当时挺担心的。",
        "完整测试显示我的记忆和注意力都没问题。只是其中一项，而医生也有了可以着手的数字。",
      ],
      attribution: () => "— Siew Ling，64 岁，与您年龄相近",
    },
    exit: {
      body: "您的结果已经在邮箱里，每一项分数都附有通俗的解释。",
      body2: "如果偏慢的结果让您担心，请把报告带给医生。其余三个领域，我们随时在这里。",
    },
  },
};

/* ======================================================= Bahasa Melayu ==== */

const MS_PERKS = [
  "Mengikuti perbualan yang pantas",
  "Menyesuaikan diri dengan cepat kepada persekitaran yang berubah",
  "Mengira jumlah bil sebelum kasyer habis memindai",
] as const;

const MS_STRUGGLES = [
  "Perbualan pantas lebih memerlukan usaha untuk diikuti",
  "Persekitaran yang sibuk terasa lebih sukar diikuti",
  "Mengira jumlah bil mengambil masa lebih lama daripada dahulu",
] as const;

const MS_STRONG_ACCENT = "Jika semua itu terasa mudah, skor anda baru sahaja memberitahu sebabnya.";
const MS_WEAK_ACCENT =
  "Jika mana-mana daripada itu terasa memenatkan kebelakangan ini, skor anda ialah sebabnya.";

const MS_OPTIMIZER_RISK =
  "Kami juga melihat faktor risiko anda — tabiat kesihatan dan gaya hidup seperti tekanan darah tinggi, tidur yang tidak cukup, atau senaman yang kurang boleh memperlahankan otak anda dari masa ke masa.";

const MS_SENIOR_RISK =
  "Kami juga melihat faktor risiko anda. Tabiat seperti tekanan darah tinggi, tidur yang tidak cukup, kehilangan pendengaran, atau senaman yang terlalu sedikit boleh memperlahankan pemikiran anda selama bertahun-tahun.";

const MS_OPTIMIZER_PRODUCT = {
  eyebrow: "Ambil ujian",
  h2: "Apa yang anda buat sekarang? Ambil penilaian ReCOGnAIze yang PENUH",
  bodyLead:
    "Disahkan terhadap imbasan MRI, dibina atas kajian NTU selama lima tahun terhadap 1,500 orang dan diterbitkan dalam ",
} as const;

const MS_SENIOR_PRODUCT = {
  eyebrow: "Cara ujian ini berfungsi",
  h2: "Apa yang anda buat sekarang? Ambil penilaian ReCOGnAIze yang PENUH",
  bodyLead:
    "Disahkan terhadap imbasan otak MRI, dibina atas kajian NTU selama lima tahun terhadap 1,500 orang dewasa, diterbitkan dalam ",
} as const;

const msWithName = (name: string | null, line: string) =>
  name ? `${name}, ${line}` : line[0].toUpperCase() + line.slice(1);

const MS_COPY: Record<LiteTwoVariantKey, LiteTwoReportCopy> = {
  "optimizer-strong": {
    hero: {
      eyebrow: "Cabaran masa reaksi",
      h1Kind: "countup",
      h1: ({ name, percentile }) =>
        msWithName(name, `anda lebih pantas daripada ${percentile}% orang sebaya anda.`),
      sub: ({ topBand, domain }) =>
        `Itu ${topBand}% teratas dalam kumpulan umur anda bagi ${domain}.`,
      scrollCue: "Beritahu saya lebih lanjut",
    },
    meaning: {
      intro: "Dengan kelajuan pemprosesan yang tinggi, anda boleh:",
      perks: MS_PERKS,
      accent: MS_STRONG_ACCENT,
    },
    tip: {
      h2: ({ name }) =>
        name
          ? `${name}, ini satu tip khas untuk mengoptimumkan kelajuan anda`
          : "Ini satu tip khas untuk mengoptimumkan kelajuan anda",
      chip: "Memori",
      ...MEMORY_CHIP_STYLE,
      headline: "Ingat pesanan kopi seorang rakan tanpa perlu menyemak.",
      body: "Perincian kecil seperti ini menunjukkan memori anda sedang membantu. Berlatih memegang satu fakta kecil sepanjang satu perbualan — itu yang mengekalkan laluan pantas anda pantas.",
      shareText:
        "Tip saya daripada ujian kelajuan otak 60 saat: ingat pesanan kopi seorang rakan tanpa menyemak. Cuba tip anda:",
    },
    risk: {
      body: MS_OPTIMIZER_RISK,
      actionablesIntro: "Ini 3 tindakan yang anda boleh buat sekarang",
      actionables: [
        "Teruskan apa yang anda buat — kelajuan anda kukuh, jadi lindunginya dengan tidur yang konsisten dan senaman yang tetap.",
        "Cabar otak anda setiap hari — cuba jalan baharu ke tempat kerja, pelajari kemahiran baharu, atau ubah rutin anda.",
        "Rekod garis dasar anda — ambil penilaian penuh supaya anda ada titik rujukan untuk dibandingkan pada masa depan.",
      ],
    },
    baseline: {
      eyebrow: "Garis dasar anda sejauh ini",
      h2Lead: "Anda baru melengkapkan ",
      h2Gradient: "2 daripada 5",
      paragraphs: [
        "Permainan kelajuan dan jawapan kuiz anda memberi kami dua paksi — kelajuan dan risiko.",
        "Tetapi otak anda tidak berfungsi pada dua dimensi. Memori, perhatian dan fungsi eksekutif masing-masing menceritakan kisah berbeza, dan anda boleh cemerlang pada satu sementara bergelut dengan yang lain.",
        "Ujian penuh mengisi yang selebihnya, supaya saranan anda benar-benar padan dengan otak anda.",
      ],
    },
    product: MS_OPTIMIZER_PRODUCT,
    closing: {
      quote: [
        "Mesyuarat esok satu yang sukar, dan kalau perhatian saya tidak terjaga, saya tidak dapat menyampaikan yang terbaik. Terima kasih kerana saya memeriksa otak saya, kini saya tahu cara mengoptimumkannya. Bersyukur saya jumpa ReCOGnAIze!",
      ],
      attribution: ({ ageLabel }) =>
        ageLabel ? `— Chelsea, berumur ${ageLabel} seperti anda` : "— Chelsea, sebaya dengan anda",
    },
    exit: {
      body: "Skor anda sudah ada dalam peti masuk, bersama satu set strategi ringkas untuk menaikkannya.",
      body2:
        "Apabila anda sedia menguji tiga domain otak yang lain, anda tahu di mana kami berada.",
    },
  },

  "optimizer-weak": {
    hero: {
      eyebrow: "Cabaran masa reaksi",
      h1Kind: "plain",
      h1: ({ name }) => msWithName(name, "kebanyakan orang lebih pantas daripada anda hari ini."),
      sub: ({ avgSeconds, percentile, domain }) =>
        avgSeconds
          ? `${avgSeconds} saat secara purata — ${percentile}% terbawah dalam kumpulan umur anda.`
          : `Itu ${percentile}% terbawah dalam kumpulan umur anda bagi ${domain}.`,
      scrollCue: "Beritahu saya lebih lanjut",
    },
    meaning: {
      intro: "Ini yang akan terbuka dengan kelajuan yang lebih tinggi:",
      perks: MS_PERKS,
      accent: MS_WEAK_ACCENT,
    },
    tip: {
      h2: ({ name }) =>
        name
          ? `${name}, ini satu tip khas untuk mengoptimumkan kelajuan anda`
          : "Ini satu tip khas untuk mengoptimumkan kelajuan anda",
      chip: "Kelajuan",
      ...SPEED_CHIP_STYLE,
      headline: "Baca satu e-mel sekali lalu dan terus bertindak ke atasnya.",
      body: "Latihan seperti ini menajamkan sepantas mana anda menerima maklumat.",
      shareText:
        "Tip saya daripada ujian kelajuan otak 60 saat: baca satu e-mel sekali lalu dan terus bertindak. Cuba tip anda:",
    },
    risk: {
      body: MS_OPTIMIZER_RISK,
      actionablesIntro: "Ini 3 tindakan yang anda boleh buat sekarang",
      actionables: [
        "Utamakan tidur — sasarkan 7-9 jam; satu jam tambahan pun boleh menajamkan masa reaksi anda esok.",
        "Bergerak selama 20 minit — berjalan pantas atau apa-apa kardio meningkatkan aliran darah ke otak dan memperbaiki kelajuan pemprosesan.",
        "Ambil penilaian penuh — ketahui domain mana yang sebenarnya menghalang anda supaya anda betulkan halangan yang sebenar.",
      ],
    },
    baseline: {
      eyebrow: "Garis dasar anda sejauh ini",
      h2Lead: "Anda baru melengkapkan ",
      h2Gradient: "2 daripada 5",
      paragraphs: [
        "Permainan kelajuan dan jawapan kuiz anda memberi kami dua paksi: kelajuan dan risiko. Hari ini kelajuan datang rendah, dan satu permainan pada satu hari ialah isyarat yang bising.",
        "Memori, perhatian dan fungsi eksekutif masing-masing menceritakan kisah berbeza, dan anda boleh perlahan pada kelajuan tetapi kukuh pada ketiga-tiganya.",
        "Ujian penuh mencari yang mana sebenarnya menghalang anda, supaya strategi anda menyasarkan halangan yang sebenar.",
      ],
    },
    product: MS_OPTIMIZER_PRODUCT,
    closing: {
      quote: [
        "Kelajuan ialah yang paling lemah antara lima, dan itu mengecewakan. Ternyata kelajuan bukan masalahnya — fungsi eksekutif saya yang bermasalah, dan itulah sebabnya waktu petang saya runtuh. Saya betulkan yang betul. Bersyukur saya jumpa ReCOGnAIze!",
      ],
      attribution: ({ ageLabel }) =>
        ageLabel ? `— Chelsea, berumur ${ageLabel} seperti anda` : "— Chelsea, sebaya dengan anda",
    },
    exit: {
      body: "Skor anda sudah ada dalam peti masuk, bersama satu set strategi ringkas untuk menaikkannya.",
      body2:
        "Apabila anda sedia mencari domain yang sebenarnya memperlahankan anda, anda tahu di mana kami berada.",
    },
  },

  "senior-strong": {
    hero: {
      eyebrow: "Pemeriksaan kelajuan pemprosesan",
      h1Kind: "plain",
      h1: ({ name }) =>
        msWithName(name, "kelajuan anda melebihi purata bagi kumpulan umur anda."),
      sub: ({ avgSeconds, topBand, ageLabel, domain }) => {
        const cohort = ageLabel ? `bagi umur ${ageLabel}` : "bagi kumpulan umur anda";
        return avgSeconds
          ? `${avgSeconds} saat secara purata — ${topBand}% teratas ${cohort}.`
          : `Itu ${topBand}% teratas ${cohort} bagi ${domain}.`;
      },
      scrollCue: "Apa yang kami ukur?",
    },
    meaning: {
      intro: "Di sinilah anda perasan kesannya dalam kehidupan harian:",
      perks: MS_PERKS,
      accent: MS_STRONG_ACCENT,
    },
    tip: {
      h2: ({ name }) =>
        name
          ? `Berdasarkan profil anda, ini satu tip untuk ${name}`
          : "Berdasarkan profil anda, ini satu tip untuk anda",
      chip: "Memori",
      ...MEMORY_CHIP_STYLE,
      headline: "Ingat pesanan kopi seorang rakan tanpa perlu menyemak.",
      body: "Ingatan kecil seperti ini ialah memori anda sedang bekerja.",
      shareText:
        "Tip saya daripada pemeriksaan kelajuan otak 60 saat: ingat pesanan kopi seorang rakan tanpa menyemak. Cuba tip anda:",
    },
    risk: {
      body: MS_SENIOR_RISK,
      actionablesIntro: "Ini 3 tindakan yang anda boleh buat sekarang",
      actionables: [
        "Berjalan perlahan setiap hari — 15 minit pun membantu aliran darah ke otak dan menyokong kesihatan kognitif jangka panjang.",
        "Kekal aktif bersosial — perbualan tetap dan aktiviti berkumpulan mengekalkan otak anda terlibat merentas beberapa domain.",
        "Tetapkan garis dasar dengan penilaian penuh — supaya anda dan doktor anda ada nombor untuk dibandingkan dari masa ke masa.",
      ],
    },
    baseline: {
      eyebrow: "Apa yang kami liputi hari ini",
      h2Lead: "Anda baru melengkapkan ",
      h2Gradient: "2 daripada 5",
      paragraphs: [
        "Permainan hari ini mengukur satu perkara: sepantas mana anda menerima maklumat dan bertindak balas. Jawapan kuiz anda memberi kami yang kedua: profil risiko anda.",
        "Kesihatan otak bukan satu nombor. Memori, perhatian dan fungsi eksekutif masing-masing melakukan kerja berbeza, dan biasa untuk seseorang stabil pada satu dan lebih perlahan pada yang lain.",
        "Ujian penuh meliputi tiga yang selebihnya, supaya apa yang kami sarankan padan dengan seluruh profil anda.",
      ],
    },
    product: MS_SENIOR_PRODUCT,
    closing: {
      quote: [
        "Saya sering hilang arah dalam perbualan dan menyalahkan usia saya. Laporan menunjukkan perhatian saya yang merosot, bukan memori.",
        "Sekarang saya tahu dengan tepat apa yang perlu diusahakan, dan doktor saya ada nombornya.",
      ],
      attribution: () => "— Siew Ling, 64, sebaya dengan anda",
    },
    exit: {
      body: "Keputusan anda sudah ada dalam peti masuk, dengan penjelasan mudah bagi setiap skor.",
      body2:
        "Apabila anda sedia memeriksa tiga domain yang lain, kami akan berada di sini. Anda boleh bawa laporan itu kepada doktor anda.",
    },
  },

  "senior-weak": {
    hero: {
      eyebrow: "Pemeriksaan kelajuan pemprosesan",
      h1Kind: "plain",
      h1: ({ name }) =>
        msWithName(name, "kelajuan anda di bawah kumpulan umur anda hari ini."),
      sub: ({ avgSeconds }) =>
        avgSeconds
          ? `${avgSeconds} saat secara purata. Satu permainan pada satu hari bukan satu diagnosis.`
          : "Satu permainan pada satu hari bukan satu diagnosis.",
      scrollCue: "Apa yang kami ukur?",
    },
    meaning: {
      intro: "Kelajuan yang lebih perlahan sering muncul seperti ini:",
      perks: MS_STRUGGLES,
      accent: MS_WEAK_ACCENT,
    },
    tip: {
      h2: () => "Berdasarkan profil anda, ini satu perkara untuk dilatih",
      chip: "Kelajuan",
      ...SPEED_CHIP_STYLE,
      headline: "Baca satu halaman, kemudian sebut idea utamanya dengan kuat.",
      body: "Latihan kecil seperti ini melatih sepantas mana anda menerima maklumat.",
      shareText:
        "Tip saya daripada pemeriksaan kelajuan otak 60 saat: baca satu halaman, kemudian sebut idea utamanya dengan kuat. Cuba tip anda:",
    },
    risk: {
      body: MS_SENIOR_RISK,
      actionablesIntro: "Ini 3 tindakan yang anda boleh buat sekarang",
      actionables: [
        "Berjalan perlahan setiap hari — 15 minit pun membantu aliran darah ke otak dan menyokong kelajuan berfikir.",
        "Kekalkan rutin yang mudah — waktu makan yang tetap, tidur yang konsisten, dan struktur yang biasa mengurangkan beban kognitif.",
        "Ambil penilaian penuh — kongsi keputusan dengan doktor anda supaya mereka ada nombor untuk digunakan, bukan hanya gejala.",
      ],
    },
    baseline: {
      eyebrow: "Apa yang kami liputi hari ini",
      h2Lead: "Anda baru melengkapkan ",
      h2Gradient: "2 daripada 5",
      paragraphs: [
        "Permainan hari ini mengukur satu perkara: sepantas mana anda menerima maklumat dan bertindak balas. Keputusan yang lebih perlahan pada satu hari boleh berpunca daripada keletihan, ubat, atau sekadar permainan yang belum biasa.",
        "Memori, perhatian dan fungsi eksekutif masing-masing melakukan kerja berbeza, dan kelajuan yang perlahan tidak memberitahu kami keadaan ketiga-tiganya.",
        "Ujian penuh meliputi tiga yang selebihnya, supaya anda dan doktor anda melihat gambaran keseluruhan dan bukan satu nombor.",
      ],
    },
    product: MS_SENIOR_PRODUCT,
    closing: {
      quote: [
        "Skor pertama saya kembali lebih perlahan daripada yang saya sangka, dan itu merunsingkan saya.",
        "Ujian penuh menunjukkan memori dan perhatian saya baik. Hanya satu bahagian, dan doktor saya ada nombor untuk digunakan.",
      ],
      attribution: () => "— Siew Ling, 64, sebaya dengan anda",
    },
    exit: {
      body: "Keputusan anda ada dalam peti masuk dengan penjelasan mudah bagi setiap skor.",
      body2:
        "Jika keputusan yang lebih perlahan itu merunsingkan anda, bawa laporan itu kepada doktor anda. Kami akan berada di sini untuk tiga domain yang lain.",
    },
  },
};

const BY_LANG: Record<LiteEventLang, Record<LiteTwoVariantKey, LiteTwoReportCopy>> = {
  en: LITE_TWO_REPORT_COPY,
  zh: ZH_COPY,
  ms: MS_COPY,
};

/** The one report copy set this run should render. */
export function liteEventReportCopy(
  lang: LiteEventLang,
  persona: LiteTwoPersona,
  band: LiteTwoBand
): LiteTwoReportCopy {
  const map = BY_LANG[lang] ?? LITE_TWO_REPORT_COPY;
  return map[liteTwoVariantKey(persona, band)];
}
