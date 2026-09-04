import type { LiteEventLang } from "./liteEvent";

/**
 * Every visitor-facing string in the /lite-event flow, in the three languages
 * the funnel offers.
 *
 * The English object is the source of truth for the shape: `LiteEventCopy` is
 * `typeof EN`, so a missing or misspelled key in the Chinese or Malay object is
 * a type error rather than a screen that silently falls back to English at a
 * booth. Lines needing live numbers are functions.
 *
 * Copy that is not the visitor's to read — the leads table, the API payloads,
 * the emailed report — is deliberately untouched and stays English, so a
 * booth's afternoon still reconciles against the same columns.
 */

const EN = {
  /** The picker itself. */
  picker: {
    label: "Choose your language",
  },

  /* ------------------------------------------------------------- landing -- */
  landing: {
    headTitle: "Brain Health Check | ReCOGnAIze",
    metaDescription:
      "You track your heart, your sleep, your blood sugar. This is the same idea for your brain: a 3-minute check and a score you can act on.",
    ogTitle: "You tracked everything. What about your brain?",
    ogDescription: "Take a 3-min quiz and find out how your brain is performing.",
    pill: "Clinically validated at NTU LKCMedicine",
    /** The headline is two lines, each with one italic emphasis. */
    heroLine1Lead: "You tracked ",
    heroLine1Emph: "everything",
    heroLine2Lead: "What about your ",
    heroLine2Emph: "brain",
    heroLine2Tail: "?",
    heroSub: "Take a 3-min quiz and find out how your brain is performing",
    cta: "Get started for free",
    featuredIn: "As featured in",
    trustLead: "Based on the ",
    trustStrong1: "2024 Lancet Commission",
    trustMid: " risk model and the ",
    trustStrong2: "CAIDE dementia risk score",
    trustTail: ".",
  },

  /* --------------------------------------------------------------- ready -- */
  ready: {
    headTitle: "What happens next | ReCOGnAIze",
    inTheNext: "In the next",
    duration: "3 mins",
    steps: [
      "Play a 60-second cognitive game",
      "Take a medically-backed quiz on brain health risk factors",
      "See how you compare to people your age",
    ],
    /** Labels inside the little step previews. */
    quizArtHigh: "Several times",
    quizArtLow: "Not that noticeable",
    curveWeak: "Weak",
    curveAdequate: "Adequate",
    mostImportantly: "And most importantly,",
    learnToImprove: "Learn how you can improve",
    cta: "I'm ready!",
  },

  /* ----------------------------------------------------------- challenge -- */
  challenge: {
    headTitle: "Reaction time challenge | ReCOGnAIze",
    step: "Step 1 of 3",
    h1: "Reaction time challenge",
    bodyLead: "How ",
    bodyEmph: "fast",
    bodyTail:
      " does your brain process? Match as many symbols to their numbers as you can in 60 seconds.",
    /** Badge over the board that plays itself, inside AutoPlayDemo. */
    demoBadge: "Demo · plays itself",
    cta: "Start tutorial",
  },

  /**
   * The countdown screen belongs to the shared /symbol-matching route, which
   * reads these through APP_LANG rather than the hook — see
   * `liteEventGameCopy` at the bottom of this file.
   */
  countdown: {
    title: "Reaction time challenge",
    subtitle: "Match as many symbols to their numbers",
  },

  /* -------------------------------------------------------- game complete -- */
  gameComplete: {
    headTitle: "Game complete | ReCOGnAIze",
    badge: "1 | Cognitive Game",
    h1: "Game complete!",
    correctSymbols: "Correct symbols:",
    nextEyebrow: "Next",
    nextBody: "Take a medically-backed quiz on brain health risk factors",
    cta: "Continue",
  },

  /* ---------------------------------------------------------------- quiz -- */
  quiz: {
    headTitle: "Brain Health Quiz | ReCOGnAIze",
    groupRiskFactors: "Some risk factors",
    groupRiskFactorsNote: "These are about your own health, not your family's.",
    groupLifestyle: "Your lifestyle",
    groupChanges: "Changes you might have noticed",
    back: "← Back",
    continue: "Continue",
    didYouKnow: "Did you know",
    source: "Source",
    preparing: "Preparing your result…",
    questionXOfY: (current: number, total: number) => `Question ${current} of ${total}`,
  },

  /* ------------------------------------------------------------- results -- */
  results: {
    headTitle: "Where should we send your results? | ReCOGnAIze",
    badge: "3 | Result",
    h1: "Where should we send your results?",
    sub: "Tell us your name and email, and we'll send you a copy",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    /**
     * The two tickboxes between the email field and the button.
     *
     * The first is required and its label says so before anything else, in
     * bold; the second is the newsletter opt-in and is not. Both are recorded
     * either way, so the leads table distinguishes a visitor who opted in from
     * one who was never asked.
     *
     * The required line is split the way the landing copy is split, because it
     * carries a link: lead, the policy's name, then the tail. The name renders
     * as plain text rather than a link until the policy URL is set - see
     * GMS_PRIVACY_POLICY_URL in src/utils/parkway.ts.
     */
    consentRequiredMark: "Required",
    consentAnalyticsLead:
      ". I agree that my assessment data may be used for campaign analytics by Gray Matter Solutions, in accordance with their ",
    consentPolicy: "Privacy Policy",
    consentAnalyticsTail: ".",
    consentMarketing: "Send me occasional brain health tips and updates.",
    errName: "Please enter your name.",
    errEmail: "Please enter a valid email address.",
    errConsent: "Please agree to the required consent to continue.",
    errSave: "We couldn't save that. Please try again.",
    saving: "Saving…",
    submit: "Reveal my score",
    privacy:
      "We'll only use your details to share your result and brain health recommendations. Unsubscribe any time.",
  },

  /* ------------------------------------------------------------- loading -- */
  loading: {
    headTitle: "Building your profile | ReCOGnAIze",
    spinnerLabel: "Building your profile",
    greeting: "We are building your profile",
    greetingNamed: (name: string) => `${name}, we are building your profile`,
    crumbs: [
      "Reviewing your profile of factors…",
      "Comparing with an age-matched cohort…",
      "Weighing lifestyle and biomedical factors…",
      "Cross-referencing the 2024 Lancet Commission framework…",
      "Preparing your Brain Health Score…",
    ],
  },

  /* -------------------------------------------------------------- report -- */
  report: {
    headTitle: "Your brain speed report | ReCOGnAIze",
    sections: [
      "Your rank",
      "What it means",
      "Risk factors",
      "Your baseline",
      "The test",
      "The offer",
      "Wrap up",
    ],
    share: "Share results",
    shared: "Copied",
    /** Floating cue on viewports too short to show the hero's own scroll cue. */
    moreBelow: "More results below",
    shareSheetTitle: "My brain speed score",
    shareScore: (percentile: number, peers: string) =>
      `I reacted faster than ${percentile}% of ${peers} on a 60-second cognitive test.`,
    previewNotice:
      "Preview mode. No finished game on this device, so the numbers below are a sample.",
    ageBandLabel: "Your age band",
    agedChip: (label: string) => `Aged ${label}`,
    allAges: "All ages",
    /** The score curve's axis words and the marker on the visitor's position. */
    curve: {
      slower: "Slower",
      average: "Average",
      faster: "Faster",
      you: "YOU",
    },
    /** The animated "faster than X% of your peers" headline, in three spans. */
    countupLead: "You are",
    countupLeadNamed: (name: string) => `${name}, you are`,
    countupMid: "faster than",
    countupTail: "of your peers.",

    meaningEyebrow: "What that actually means",
    meaningH2: [
      "Processing speed is ",
      "how fast",
      " your brain ",
      "takes in",
      " what it sees and ",
      "responds",
      ".",
    ],

    riskEyebrow: "Also measured",
    riskH2: "Speed was not the only thing we looked at.",
    /** The two-trajectory risk chart. */
    trend: {
      managed: "Risk factors managed",
      unmanaged: "Risk factors unmanaged",
      faster: "Faster",
      slower: "Slower",
      agePrefix: "Age ",
      caption:
        "Illustrative trend, shaped by Jaarsma et al. 2024 and Yaffe et al. 2020 (CARDIA). Not a clinical prediction.",
      aria: "Illustrative chart: processing speed declines gently with age when risk factors are managed, and drops steeply when they are left unmanaged",
    },
    riskLevelLabel: "Your risk level:",
    riskFactorsIntro: "Some factors that affect your risk level",
    goodNews: "The good news is",
    goodNewsAbout: "About",
    goodNewsBody:
      "of dementia cases worldwide could be prevented or delayed by addressing the modifiable risk factors across a person's life.",

    baselineLabel: "Your baseline",
    baselineProgress: "2 of 5 done",
    radarAxes: ["Speed", "Memory", "Attention", "Executive", "Risk"],
    radarAria: "Baseline radar: two of five parts measured, three still empty",

    howItWorksEyebrow: "How it works",
    howItWorksH2: "From test to teleconsult in three steps",
    howItWorksSteps: [
      {
        step: "Step 1",
        title: "Take an online test",
        body: "An online assessment with specialised games that measure how your brain handles four aspects — speed, focus, planning, and memory.",
        domains: ["Speed", "Focus", "Planning", "Memory"],
      },
      {
        step: "Step 2",
        title: "Get your full report",
        body: "Your overall risk level for mild cognitive impairment, a breakdown across the four domains, and — where relevant — the most likely underlying cause.",
        domains: [] as string[],
      },
      {
        step: "Step 3",
        title: "Hop on a teleconsult",
        body: "A certified doctor analyses your report with you over a telehealth consultation and explains it in detail with clear next steps.",
        domains: [] as string[],
      },
    ],
    takeAssessment: "Take the assessment →",

    clinicianQuote:
      "Each of these games measures a specific brain function the same way I would assess it in clinic. We are not testing whether you can play, we are testing how well each part of your brain is doing the work it does for you every day.",
    clinicianName: "A/Prof Nagaendran Kandiah",
    clinicianRole: "Co-founder, Gray Matter Solutions",
    clinicianCreds: "MBBS, FAMS (Neurology), FRCP (Edin)",

    /* /lite-event-template's closing — the CTA on trial there. See that
       funnel's report.tsx; /lite-event still renders the offer keys below. */
    nextSectionLabel: "Next steps",
    interested: "I'm interested",
    interestedDone: "Thanks, noted",
    nextEyebrow: "What happens next",
    nextH2: "Take the next step with ReCOGnAIze",
    nextBody:
      "Your Brain Health Score and recommendations are on their way to your inbox. Today's quiz estimates your risk profile; the ReCOGnAIze assessment shows how your brain is actually performing.",
    nextReassurance:
      "Whatever your score today, most of the factors behind it can change. That is the point of checking early.",
    nextProductName: "ReCOGnAIze brain health assessment",
    nextPoints: [
      "Developed at NTU's Dementia Research Centre",
      "Registered with Singapore's HSA",
      "Results reviewed with a medical professional",
    ],
    nextCallout: "Speak to our team at the booth",
    tipsOptIn: "Send me brain health tips, and early access when we launch.",
    credibilityLine: "Built with NTU's Dementia Research Centre · 2024 Lancet Commission",

    offerH2: (title: string) => `Celebrating ${title}, we have a special offer for you`,
    offerMission:
      "With our mission to advance preventive cognitive health, everyone should treat their brain the same as their body — as early as possible.",
    normalPrice: "Normal price",
    discountLabel: (title: string) => `${title} discount`,
    total: "Total",
    takeFullTest: "Take the full test",
    offerFooter: "Takes about 15 minutes. Same tasks clinicians use.",

    stillThinking: "Still need time to think?",
    researchLine:
      "Built on clinical research by Nanyang Technological University, LKC Medicine, Dementia Research Centre Singapore.",

    /* Derived labels — the report renders values produced by the shared
       scoring engine and the report API, which are English either way. */
    domainName: "processing speed",
    bandLabels: {
      low: "Low",
      moderate: "Moderate",
      elevated: "Elevated",
      high: "High",
    } as Record<string, string>,
    factorLabels: {
      Age: "Age",
      "Hormonal changes": "Hormonal changes",
      "Family history": "Family history",
      "Blood pressure": "Blood pressure",
      Cholesterol: "Cholesterol",
      "Diabetes / pre-diabetes": "Diabetes / pre-diabetes",
      "Untreated hearing loss": "Untreated hearing loss",
      "Untreated vision loss": "Untreated vision loss",
      Smoking: "Smoking",
      Sleep: "Sleep",
      Exercise: "Exercise",
      Diet: "Diet",
      Alcohol: "Alcohol",
      "Physical activity": "Physical activity",
      Stress: "Stress",
    } as Record<string, string>,
    quizAgeLabels: {
      "18-29": "18 to 29",
      "30-39": "30 to 39",
      "40-49": "40 to 49",
      "50-59": "50 to 59",
      "60+": "60 and over",
    } as Record<string, string>,
    peopleAged: (label: string) => `people aged ${label}`,
    peopleYourAge: "people your age",
  },

  /* --------------------------------------------------------- report full -- */
  reportFull: {
    headTitle: "The full picture | ReCOGnAIze",
    back: "← Back to your result",
    eyebrow: "The full picture",
    heading: "Take the complete brain health assessment",
    paperNote: "Validated in peer-reviewed research",
    offerName: "BrainScan brain health assessment",
    offerNote: "Developed at NTU's Dementia Research Centre · Registered with Singapore's HSA",
    includes: [
      "Clinically-validated neuroscientific games to detect specific brain functions",
      "All four cognitive domains: processing speed, memory, attention and executive function",
      "Review & recommendations with a full in-depth report",
    ],
    faqs: [
      {
        q: "What is BrainScan?",
        a: "A digital brain health assessment developed at NTU's Dementia Research Centre and registered with Singapore's HSA.",
      },
      {
        q: "How is this 3-minute quiz different from BrainScan?",
        a: "This quiz is a free, educational estimate based on your modifiable risk factors. BrainScan is the full assessment, validated in peer-reviewed research, that shows how your brain is actually performing.",
      },
      {
        q: "Is this assessment legit?",
        a: "Yes. BrainScan was developed and validated at NTU's Lee Kong Chian School of Medicine, Dementia Research Centre, and is registered with Singapore's HSA.",
      },
      {
        q: "Who is it for?",
        a: "Anyone staying ahead of their brain health: whether you want to maintain peak cognitive performance, you're navigating hormonal changes, or you're supporting a loved one living with dementia.",
      },
      {
        q: "What should I expect next?",
        a: "Download your offer proof and show it at the front desk to claim the discounted assessment. The test itself runs in a browser and takes about ten minutes.",
      },
    ],
    disclaimer:
      "This report is intended for wellness screening and educational purposes only. It does not diagnose medical disease or replace professional medical evaluation. Findings should be interpreted together with clinical consultation, lifestyle assessment, and where appropriate, biomedical evaluation.",
  },

  /* --------------------------------------------------------------- offer -- */
  offer: {
    eyebrow: "Special offer",
    title: "World Alzheimer's Month",
    window: "1 – 30 September 2026",
    productName: "BrainScan Cognitive Test",
    productSub: "4 cognitive domains",
    domains: ["Processing Speed", "Executive Function", "Memory", "Attention"],
    normalPrice: "Normal price",
    discountLabel: "Alzheimer's Month discount",
    total: "Total",
    claimCode: "Your claim code:",
    preparing: "Preparing…",
    download: "Download proof",
    redeemNote: "Show this at the front desk to claim it.",
  },
};

export type LiteEventCopy = typeof EN;

/* ============================================================== 中文 ==== */

const ZH: LiteEventCopy = {
  picker: {
    label: "选择语言",
  },

  landing: {
    headTitle: "脑健康检查 | ReCOGnAIze",
    metaDescription:
      "您会关注心脏、睡眠和血糖。大脑同样值得关注：3 分钟检测，一个可以据以行动的分数。",
    ogTitle: "什么都追踪了，那大脑呢？",
    ogDescription: "花 3 分钟做个测试，看看您的大脑表现如何。",
    pill: "经南洋理工大学李光前医学院临床验证",
    heroLine1Lead: "您什么都",
    heroLine1Emph: "追踪了",
    heroLine2Lead: "那您的",
    heroLine2Emph: "大脑",
    heroLine2Tail: "呢？",
    heroSub: "花 3 分钟做个测试，看看您的大脑表现如何",
    cta: "免费开始",
    featuredIn: "媒体报道",
    trustLead: "基于 ",
    trustStrong1: "2024 年《柳叶刀》委员会",
    trustMid: " 风险模型与 ",
    trustStrong2: "CAIDE 痴呆症风险评分",
    trustTail: "。",
  },

  ready: {
    headTitle: "接下来会发生什么 | ReCOGnAIze",
    inTheNext: "接下来的",
    duration: "3 分钟",
    steps: [
      "玩一个 60 秒的认知小游戏",
      "完成一份有医学依据的脑健康风险因素问卷",
      "看看您与同龄人相比表现如何",
    ],
    quizArtHigh: "每周数次",
    quizArtLow: "没有察觉",
    curveWeak: "偏弱",
    curveAdequate: "良好",
    mostImportantly: "而最重要的是，",
    learnToImprove: "了解如何改善",
    cta: "我准备好了！",
  },

  challenge: {
    headTitle: "反应速度挑战 | ReCOGnAIze",
    step: "第 1 步，共 3 步",
    h1: "反应速度挑战",
    bodyLead: "您的大脑处理信息有",
    bodyEmph: "多快",
    bodyTail: "？在 60 秒内尽可能多地把符号与对应的数字配对。",
    demoBadge: "演示 · 自动播放",
    cta: "开始教程",
  },

  countdown: {
    title: "反应速度挑战",
    subtitle: "把符号与对应的数字配对",
  },

  gameComplete: {
    headTitle: "游戏完成 | ReCOGnAIze",
    badge: "1 | 认知游戏",
    h1: "游戏完成！",
    correctSymbols: "正确配对：",
    nextEyebrow: "接下来",
    nextBody: "完成一份有医学依据的脑健康风险因素问卷",
    cta: "继续",
  },

  quiz: {
    headTitle: "脑健康问卷 | ReCOGnAIze",
    groupRiskFactors: "一些风险因素",
    groupRiskFactorsNote: "以下问题是关于您本人的健康状况，而非家人的。",
    groupLifestyle: "您的生活方式",
    groupChanges: "您可能察觉到的变化",
    back: "← 返回",
    continue: "继续",
    didYouKnow: "您知道吗",
    source: "来源",
    preparing: "正在生成您的结果…",
    questionXOfY: (current: number, total: number) => `第 ${current} 题，共 ${total} 题`,
  },

  results: {
    headTitle: "结果发送到哪里？| ReCOGnAIze",
    badge: "3 | 结果",
    h1: "结果发送到哪里？",
    sub: "留下您的姓名和电邮，我们会把报告副本发给您",
    nameLabel: "姓名",
    namePlaceholder: "您的姓名",
    emailLabel: "电邮",
    emailPlaceholder: "your@email.com",
    consentRequiredMark: "必填",
    consentAnalyticsLead: "。我同意 Gray Matter Solutions 将我的评估数据用于活动分析，并遵照其",
    consentPolicy: "隐私政策",
    consentAnalyticsTail: "。",
    consentMarketing: "我愿意收到不定期的脑健康建议与资讯。",
    errName: "请输入您的姓名。",
    errEmail: "请输入有效的电邮地址。",
    errConsent: "请勾选必填的同意项以继续。",
    errSave: "保存失败，请再试一次。",
    saving: "正在保存…",
    submit: "查看我的分数",
    privacy: "我们只会用您的资料发送结果和脑健康建议。您可随时取消订阅。",
  },

  loading: {
    headTitle: "正在生成您的档案 | ReCOGnAIze",
    spinnerLabel: "正在生成您的档案",
    greeting: "正在生成您的档案",
    greetingNamed: (name: string) => `${name}，正在生成您的档案`,
    crumbs: [
      "正在审阅您的风险因素档案…",
      "正在与同龄人群作比较…",
      "正在权衡生活方式与生理医学因素…",
      "正在参照 2024 年《柳叶刀》委员会框架…",
      "正在准备您的脑健康分数…",
    ],
  },

  report: {
    headTitle: "您的大脑反应速度报告 | ReCOGnAIze",
    sections: ["您的排名", "这代表什么", "风险因素", "您的基线", "完整测试", "专属优惠", "结语"],
    share: "分享结果",
    shared: "已复制",
    moreBelow: "下方还有更多结果",
    shareSheetTitle: "我的大脑速度分数",
    shareScore: (percentile: number, peers: string) =>
      `在一个 60 秒的认知测试中，我的反应速度快过 ${percentile}% 的${peers}。`,
    previewNotice: "预览模式。此设备上没有已完成的游戏记录，以下数字为示例。",
    ageBandLabel: "您的年龄组",
    agedChip: (label: string) => `${label} 岁`,
    allAges: "所有年龄",
    curve: {
      slower: "较慢",
      average: "平均",
      faster: "较快",
      you: "您",
    },
    countupLead: "您的反应速度",
    countupLeadNamed: (name: string) => `${name}，您的反应速度`,
    countupMid: "快过",
    countupTail: "的同龄人。",

    meaningEyebrow: "这究竟代表什么",
    meaningH2: [
      "处理速度就是您的大脑",
      "多快",
      "能够",
      "接收",
      "所看到的信息并作出",
      "反应",
      "。",
    ],

    riskEyebrow: "我们还测了什么",
    riskH2: "速度并不是我们唯一关注的。",
    trend: {
      managed: "风险因素已管理",
      unmanaged: "风险因素未管理",
      faster: "较快",
      slower: "较慢",
      agePrefix: "年龄 ",
      caption:
        "示意性趋势，参考 Jaarsma 等（2024）与 Yaffe 等（2020，CARDIA）。并非临床预测。",
      aria: "示意图：管理好风险因素时，处理速度随年龄缓慢下降；放任不管则会急剧下降。",
    },
    riskLevelLabel: "您的风险等级：",
    riskFactorsIntro: "影响您风险等级的一些因素",
    goodNews: "好消息是",
    goodNewsAbout: "约",
    goodNewsBody: "的全球痴呆症病例，可以通过管理一生中可改变的风险因素来预防或延缓。",

    baselineLabel: "您的基线",
    baselineProgress: "已完成 5 项中的 2 项",
    radarAxes: ["速度", "记忆", "注意力", "执行功能", "风险"],
    radarAria: "基线雷达图：5 个部分中已测量 2 个，其余 3 个仍为空白。",

    howItWorksEyebrow: "测试流程",
    howItWorksH2: "三步完成测试与远程问诊",
    howItWorksSteps: [
      {
        step: "第 1 步",
        title: "在线完成测试",
        body: "一套在线评估，用专门设计的游戏测量大脑在四个方面的表现——速度、专注、规划和记忆。",
        domains: ["速度", "专注", "规划", "记忆"],
      },
      {
        step: "第 2 步",
        title: "获取完整报告",
        body: "包括您轻度认知障碍的总体风险等级、四大认知领域的细分表现，以及在相关情况下最可能的潜在原因。",
        domains: [] as string[],
      },
      {
        step: "第 3 步",
        title: "进行远程问诊",
        body: "由持证医生通过远程医疗问诊与您一同分析报告，详细解释并给出明确的下一步建议。",
        domains: [] as string[],
      },
    ],
    takeAssessment: "开始完整评估 →",

    clinicianQuote:
      "这些游戏中的每一个，都在以我在诊所中评估的同样方式测量一项特定的大脑功能。我们测的不是您会不会玩游戏，而是大脑的每个部分在日常工作中表现得有多好。",
    clinicianName: "Nagaendran Kandiah 副教授",
    clinicianRole: "Gray Matter Solutions 联合创办人",
    clinicianCreds: "MBBS, FAMS (神经内科), FRCP (Edin)",

    nextSectionLabel: "下一步",
    interested: "我有兴趣",
    interestedDone: "已记录，谢谢",
    nextEyebrow: "接下来会怎样",
    nextH2: "迈出下一步，体验 ReCOGnAIze",
    nextBody:
      "您的脑健康分数和建议正在发送到您的邮箱。今天的测验估算的是您的风险概况；ReCOGnAIze 评估则显示您的大脑实际表现如何。",
    nextReassurance:
      "无论您今天的分数如何，背后的大多数因素都是可以改变的。这正是早做检查的意义。",
    nextProductName: "ReCOGnAIze 脑健康评估",
    nextPoints: [
      "由南洋理工大学痴呆症研究中心开发",
      "已在新加坡卫生科学局（HSA）注册",
      "结果由医疗专业人员与您一同解读",
    ],
    nextCallout: "到展位与我们的团队交流",
    tipsOptIn: "请向我发送脑健康建议，并在正式推出时让我优先体验。",
    credibilityLine: "与南洋理工大学痴呆症研究中心共同打造 · 2024 年《柳叶刀》委员会",

    offerH2: (title: string) => `为庆祝${title}，我们为您准备了专属优惠`,
    offerMission:
      "我们的使命是推动预防性认知健康——每个人都应该像对待身体一样对待大脑，越早越好。",
    normalPrice: "原价",
    discountLabel: (title: string) => `${title}折扣`,
    total: "总计",
    takeFullTest: "开始完整测试",
    offerFooter: "约需 15 分钟。与临床医生使用的任务相同。",

    stillThinking: "还需要时间考虑？",
    researchLine:
      "基于南洋理工大学、李光前医学院、新加坡痴呆症研究中心的临床研究成果。",

    domainName: "处理速度",
    bandLabels: {
      low: "低",
      moderate: "中等",
      elevated: "偏高",
      high: "高",
    } as Record<string, string>,
    factorLabels: {
      Age: "年龄",
      "Hormonal changes": "荷尔蒙变化",
      "Family history": "家族史",
      "Blood pressure": "血压",
      Cholesterol: "胆固醇",
      "Diabetes / pre-diabetes": "糖尿病／糖尿病前期",
      "Untreated hearing loss": "未矫正的听力损失",
      "Untreated vision loss": "未矫正的视力损失",
      Smoking: "吸烟",
      Sleep: "睡眠",
      Exercise: "运动",
      Diet: "饮食",
      Alcohol: "饮酒",
      "Physical activity": "体能活动",
      Stress: "压力",
    } as Record<string, string>,
    quizAgeLabels: {
      "18-29": "18 至 29",
      "30-39": "30 至 39",
      "40-49": "40 至 49",
      "50-59": "50 至 59",
      "60+": "60 及以上",
    } as Record<string, string>,
    peopleAged: (label: string) => `${label} 岁的人`,
    peopleYourAge: "同龄人",
  },

  reportFull: {
    headTitle: "完整版图 | ReCOGnAIze",
    back: "← 返回您的结果",
    eyebrow: "完整版图",
    heading: "进行完整的脑健康评估",
    paperNote: "已在同行评审研究中获得验证",
    offerName: "BrainScan 脑健康评估",
    offerNote: "由南洋理工大学痴呆症研究中心开发 · 已在新加坡卫生科学局注册",
    includes: [
      "经临床验证的神经科学游戏，用于检测特定的大脑功能",
      "涵盖四大认知领域：处理速度、记忆、注意力与执行功能",
      "完整深度报告，附解读与建议",
    ],
    faqs: [
      {
        q: "什么是 BrainScan？",
        a: "一项由南洋理工大学痴呆症研究中心开发、并已在新加坡卫生科学局注册的数字化脑健康评估。",
      },
      {
        q: "这个 3 分钟测试与 BrainScan 有什么不同？",
        a: "这个测试是免费的科普性估算，依据的是您可改变的风险因素。BrainScan 才是完整评估，已在同行评审研究中获得验证，显示您的大脑实际表现如何。",
      },
      {
        q: "这项评估可靠吗？",
        a: "可靠。BrainScan 由南洋理工大学李光前医学院痴呆症研究中心开发并验证，并已在新加坡卫生科学局注册。",
      },
      {
        q: "适合什么人？",
        a: "任何想提早掌握自己脑健康状况的人：无论您想保持巅峰认知表现、正在经历荷尔蒙变化，还是在照顾患有痴呆症的亲人。",
      },
      {
        q: "接下来会怎样？",
        a: "下载您的优惠凭证，在前台出示即可享受折扣评估。测试本身在浏览器中进行，约需十分钟。",
      },
    ],
    disclaimer:
      "本报告仅供健康筛查与科普用途，不构成疾病诊断，也不能取代专业医疗评估。结果应结合临床问诊、生活方式评估，并在必要时结合生理医学检查一并解读。",
  },

  offer: {
    eyebrow: "专属优惠",
    title: "世界阿尔茨海默病月",
    window: "2026 年 9 月 1 日 – 30 日",
    productName: "BrainScan 认知测试",
    productSub: "4 大认知领域",
    domains: ["处理速度", "执行功能", "记忆", "注意力"],
    normalPrice: "原价",
    discountLabel: "阿尔茨海默病月折扣",
    total: "总计",
    claimCode: "您的兑换码：",
    preparing: "正在生成…",
    download: "下载优惠凭证",
    redeemNote: "在前台出示即可兑换。",
  },
};

/* ====================================================== Bahasa Melayu ==== */

const MS: LiteEventCopy = {
  picker: {
    label: "Pilih bahasa anda",
  },

  landing: {
    headTitle: "Pemeriksaan Kesihatan Otak | ReCOGnAIze",
    metaDescription:
      "Anda pantau jantung, tidur dan gula dalam darah. Ini idea yang sama untuk otak anda: pemeriksaan 3 minit dan skor yang boleh anda gunakan.",
    ogTitle: "Anda pantau segalanya. Bagaimana dengan otak anda?",
    ogDescription: "Ambil kuiz 3 minit dan ketahui prestasi otak anda.",
    pill: "Disahkan secara klinikal di NTU LKCMedicine",
    heroLine1Lead: "Anda pantau ",
    heroLine1Emph: "segalanya",
    heroLine2Lead: "Bagaimana dengan ",
    heroLine2Emph: "otak",
    heroLine2Tail: " anda?",
    heroSub: "Ambil kuiz 3 minit dan ketahui prestasi otak anda",
    cta: "Mula secara percuma",
    featuredIn: "Disiarkan di",
    trustLead: "Berasaskan model risiko ",
    trustStrong1: "Suruhanjaya Lancet 2024",
    trustMid: " dan ",
    trustStrong2: "skor risiko demensia CAIDE",
    trustTail: ".",
  },

  ready: {
    headTitle: "Apa yang seterusnya | ReCOGnAIze",
    inTheNext: "Dalam masa",
    duration: "3 minit",
    steps: [
      "Main satu permainan kognitif 60 saat",
      "Jawab kuiz berasaskan perubatan tentang faktor risiko kesihatan otak",
      "Lihat perbandingan anda dengan orang sebaya",
    ],
    quizArtHigh: "Beberapa kali",
    quizArtLow: "Tidak ketara",
    curveWeak: "Lemah",
    curveAdequate: "Memadai",
    mostImportantly: "Dan yang paling penting,",
    learnToImprove: "Ketahui cara anda boleh bertambah baik",
    cta: "Saya sedia!",
  },

  challenge: {
    headTitle: "Cabaran masa reaksi | ReCOGnAIze",
    step: "Langkah 1 daripada 3",
    h1: "Cabaran masa reaksi",
    bodyLead: "Berapa ",
    bodyEmph: "pantas",
    bodyTail:
      " otak anda memproses maklumat? Padankan sebanyak mungkin simbol dengan nombornya dalam masa 60 saat.",
    demoBadge: "Demo · main sendiri",
    cta: "Mula tutorial",
  },

  countdown: {
    title: "Cabaran masa reaksi",
    subtitle: "Padankan simbol dengan nombornya",
  },

  gameComplete: {
    headTitle: "Permainan selesai | ReCOGnAIze",
    badge: "1 | Permainan Kognitif",
    h1: "Permainan selesai!",
    correctSymbols: "Simbol betul:",
    nextEyebrow: "Seterusnya",
    nextBody: "Jawab kuiz berasaskan perubatan tentang faktor risiko kesihatan otak",
    cta: "Teruskan",
  },

  quiz: {
    headTitle: "Kuiz Kesihatan Otak | ReCOGnAIze",
    groupRiskFactors: "Beberapa faktor risiko",
    groupRiskFactorsNote: "Soalan ini tentang kesihatan anda sendiri, bukan keluarga anda.",
    groupLifestyle: "Gaya hidup anda",
    groupChanges: "Perubahan yang mungkin anda perasan",
    back: "← Kembali",
    continue: "Teruskan",
    didYouKnow: "Tahukah anda",
    source: "Sumber",
    preparing: "Menyediakan keputusan anda…",
    questionXOfY: (current: number, total: number) =>
      `Soalan ${current} daripada ${total}`,
  },

  results: {
    headTitle: "Ke mana kami hantar keputusan anda? | ReCOGnAIze",
    badge: "3 | Keputusan",
    h1: "Ke mana kami hantar keputusan anda?",
    sub: "Beri nama dan e-mel anda, dan kami akan hantar satu salinan",
    nameLabel: "Nama",
    namePlaceholder: "Nama anda",
    emailLabel: "E-mel",
    emailPlaceholder: "anda@emel.com",
    consentRequiredMark: "Diperlukan",
    consentAnalyticsLead:
      ". Saya bersetuju bahawa data penilaian saya boleh digunakan untuk analitik kempen oleh Gray Matter Solutions, selaras dengan ",
    consentPolicy: "Dasar Privasi",
    consentAnalyticsTail: " mereka.",
    consentMarketing: "Hantarkan saya tip dan berita kesihatan otak dari semasa ke semasa.",
    errName: "Sila masukkan nama anda.",
    errEmail: "Sila masukkan alamat e-mel yang sah.",
    errConsent: "Sila setujui kebenaran yang diperlukan untuk meneruskan.",
    errSave: "Kami tidak dapat menyimpannya. Sila cuba lagi.",
    saving: "Menyimpan…",
    submit: "Tunjukkan skor saya",
    privacy:
      "Kami hanya akan menggunakan maklumat anda untuk berkongsi keputusan dan saranan kesihatan otak. Anda boleh berhenti melanggan pada bila-bila masa.",
  },

  loading: {
    headTitle: "Membina profil anda | ReCOGnAIze",
    spinnerLabel: "Membina profil anda",
    greeting: "Kami sedang membina profil anda",
    greetingNamed: (name: string) => `${name}, kami sedang membina profil anda`,
    crumbs: [
      "Menyemak profil faktor anda…",
      "Membandingkan dengan kohort sebaya…",
      "Menimbang faktor gaya hidup dan bioperubatan…",
      "Merujuk rangka kerja Suruhanjaya Lancet 2024…",
      "Menyediakan Skor Kesihatan Otak anda…",
    ],
  },

  report: {
    headTitle: "Laporan kelajuan otak anda | ReCOGnAIze",
    sections: [
      "Kedudukan anda",
      "Apa maknanya",
      "Faktor risiko",
      "Garis dasar anda",
      "Ujian penuh",
      "Tawaran",
      "Penutup",
    ],
    share: "Kongsi keputusan",
    shared: "Disalin",
    moreBelow: "Lagi keputusan di bawah",
    shareSheetTitle: "Skor kelajuan otak saya",
    shareScore: (percentile: number, peers: string) =>
      `Reaksi saya lebih pantas daripada ${percentile}% ${peers} dalam ujian kognitif 60 saat.`,
    previewNotice:
      "Mod pratonton. Tiada permainan yang selesai pada peranti ini, jadi nombor di bawah adalah contoh.",
    ageBandLabel: "Kumpulan umur anda",
    agedChip: (label: string) => `Umur ${label}`,
    allAges: "Semua umur",
    curve: {
      slower: "Perlahan",
      average: "Purata",
      faster: "Pantas",
      you: "ANDA",
    },
    countupLead: "Anda",
    countupLeadNamed: (name: string) => `${name}, anda`,
    countupMid: "lebih pantas daripada",
    countupTail: "orang sebaya anda.",

    meaningEyebrow: "Apa maksudnya sebenarnya",
    meaningH2: [
      "Kelajuan pemprosesan ialah ",
      "sepantas mana",
      " otak anda ",
      "menerima",
      " apa yang dilihatnya dan ",
      "bertindak balas",
      ".",
    ],

    riskEyebrow: "Turut diukur",
    riskH2: "Kelajuan bukan satu-satunya perkara yang kami lihat.",
    trend: {
      managed: "Faktor risiko diuruskan",
      unmanaged: "Faktor risiko tidak diuruskan",
      faster: "Pantas",
      slower: "Perlahan",
      agePrefix: "Umur ",
      caption:
        "Trend ilustrasi, dibentuk oleh Jaarsma et al. 2024 dan Yaffe et al. 2020 (CARDIA). Bukan ramalan klinikal.",
      aria: "Carta ilustrasi: kelajuan pemprosesan menurun secara perlahan dengan umur apabila faktor risiko diuruskan, dan menurun dengan mendadak apabila dibiarkan.",
    },
    riskLevelLabel: "Tahap risiko anda:",
    riskFactorsIntro: "Beberapa faktor yang mempengaruhi tahap risiko anda",
    goodNews: "Berita baiknya",
    goodNewsAbout: "Kira-kira",
    goodNewsBody:
      "kes demensia di seluruh dunia boleh dicegah atau dilambatkan dengan menangani faktor risiko yang boleh diubah sepanjang hayat seseorang.",

    baselineLabel: "Garis dasar anda",
    baselineProgress: "2 daripada 5 selesai",
    radarAxes: ["Kelajuan", "Memori", "Perhatian", "Eksekutif", "Risiko"],
    radarAria: "Radar garis dasar: dua daripada lima bahagian diukur, tiga masih kosong.",

    howItWorksEyebrow: "Cara ia berfungsi",
    howItWorksH2: "Dari ujian ke telekonsultasi dalam tiga langkah",
    howItWorksSteps: [
      {
        step: "Langkah 1",
        title: "Ambil ujian dalam talian",
        body: "Penilaian dalam talian dengan permainan khusus yang mengukur cara otak anda menangani empat aspek — kelajuan, fokus, perancangan dan memori.",
        domains: ["Kelajuan", "Fokus", "Perancangan", "Memori"],
      },
      {
        step: "Langkah 2",
        title: "Dapatkan laporan penuh anda",
        body: "Tahap risiko keseluruhan anda bagi gangguan kognitif ringan, pecahan merentas empat domain, dan — jika berkaitan — punca asas yang paling berkemungkinan.",
        domains: [] as string[],
      },
      {
        step: "Langkah 3",
        title: "Sertai telekonsultasi",
        body: "Doktor bertauliah menganalisis laporan anda bersama anda melalui konsultasi telekesihatan dan menerangkannya secara terperinci dengan langkah seterusnya yang jelas.",
        domains: [] as string[],
      },
    ],
    takeAssessment: "Ambil penilaian penuh →",

    clinicianQuote:
      "Setiap permainan ini mengukur fungsi otak tertentu dengan cara yang sama seperti saya menilainya di klinik. Kami tidak menguji sama ada anda boleh bermain, kami menguji sebaik mana setiap bahagian otak anda melakukan kerja hariannya untuk anda.",
    clinicianName: "Prof Madya Nagaendran Kandiah",
    clinicianRole: "Pengasas bersama, Gray Matter Solutions",
    clinicianCreds: "MBBS, FAMS (Neurologi), FRCP (Edin)",

    nextSectionLabel: "Langkah seterusnya",
    interested: "Saya berminat",
    interestedDone: "Terima kasih, dicatat",
    nextEyebrow: "Apa yang berlaku seterusnya",
    nextH2: "Teruskan langkah anda dengan ReCOGnAIze",
    nextBody:
      "Skor Kesihatan Otak dan cadangan anda sedang dalam perjalanan ke peti masuk anda. Kuiz hari ini menganggarkan profil risiko anda; penilaian ReCOGnAIze menunjukkan prestasi sebenar otak anda.",
    nextReassurance:
      "Walau apa pun skor anda hari ini, kebanyakan faktor di sebaliknya boleh berubah. Itulah gunanya memeriksa lebih awal.",
    nextProductName: "Penilaian kesihatan otak ReCOGnAIze",
    nextPoints: [
      "Dibangunkan di Dementia Research Centre, NTU",
      "Berdaftar dengan HSA Singapura",
      "Keputusan disemak bersama profesional perubatan",
    ],
    nextCallout: "Berbual dengan pasukan kami di gerai",
    tipsOptIn: "Hantarkan saya tip kesihatan otak, dan akses awal apabila kami dilancarkan.",
    credibilityLine: "Dibina bersama Dementia Research Centre, NTU · Suruhanjaya Lancet 2024",

    offerH2: (title: string) =>
      `Sempena ${title}, kami ada tawaran istimewa untuk anda`,
    offerMission:
      "Dengan misi kami memajukan kesihatan kognitif pencegahan, setiap orang patut menjaga otak sama seperti menjaga badan — seawal mungkin.",
    normalPrice: "Harga biasa",
    discountLabel: (title: string) => `Diskaun ${title}`,
    total: "Jumlah",
    takeFullTest: "Ambil ujian penuh",
    offerFooter: "Mengambil masa kira-kira 15 minit. Tugasan yang sama digunakan klinikal.",

    stillThinking: "Masih perlu masa untuk berfikir?",
    researchLine:
      "Dibina atas penyelidikan klinikal oleh Nanyang Technological University, LKC Medicine, Dementia Research Centre Singapore.",

    domainName: "kelajuan pemprosesan",
    bandLabels: {
      low: "Rendah",
      moderate: "Sederhana",
      elevated: "Tinggi",
      high: "Sangat tinggi",
    } as Record<string, string>,
    factorLabels: {
      Age: "Umur",
      "Hormonal changes": "Perubahan hormon",
      "Family history": "Sejarah keluarga",
      "Blood pressure": "Tekanan darah",
      Cholesterol: "Kolesterol",
      "Diabetes / pre-diabetes": "Diabetes / pra-diabetes",
      "Untreated hearing loss": "Kehilangan pendengaran tanpa rawatan",
      "Untreated vision loss": "Kehilangan penglihatan tanpa rawatan",
      Smoking: "Merokok",
      Sleep: "Tidur",
      Exercise: "Senaman",
      Diet: "Pemakanan",
      Alcohol: "Alkohol",
      "Physical activity": "Aktiviti fizikal",
      Stress: "Tekanan",
    } as Record<string, string>,
    quizAgeLabels: {
      "18-29": "18 hingga 29",
      "30-39": "30 hingga 39",
      "40-49": "40 hingga 49",
      "50-59": "50 hingga 59",
      "60+": "60 dan ke atas",
    } as Record<string, string>,
    peopleAged: (label: string) => `orang berumur ${label}`,
    peopleYourAge: "orang sebaya anda",
  },

  reportFull: {
    headTitle: "Gambaran penuh | ReCOGnAIze",
    back: "← Kembali ke keputusan anda",
    eyebrow: "Gambaran penuh",
    heading: "Ambil penilaian kesihatan otak yang lengkap",
    paperNote: "Disahkan dalam penyelidikan yang dinilai rakan sebaya",
    offerName: "Penilaian kesihatan otak BrainScan",
    offerNote:
      "Dibangunkan di Dementia Research Centre NTU · Berdaftar dengan HSA Singapura",
    includes: [
      "Permainan neurosains yang disahkan secara klinikal untuk mengesan fungsi otak tertentu",
      "Kesemua empat domain kognitif: kelajuan pemprosesan, memori, perhatian dan fungsi eksekutif",
      "Ulasan & saranan dengan laporan mendalam yang penuh",
    ],
    faqs: [
      {
        q: "Apakah itu BrainScan?",
        a: "Penilaian kesihatan otak digital yang dibangunkan di Dementia Research Centre NTU dan berdaftar dengan HSA Singapura.",
      },
      {
        q: "Apa bezanya kuiz 3 minit ini dengan BrainScan?",
        a: "Kuiz ini ialah anggaran pendidikan yang percuma berdasarkan faktor risiko anda yang boleh diubah. BrainScan ialah penilaian penuh, disahkan dalam penyelidikan yang dinilai rakan sebaya, yang menunjukkan prestasi otak anda yang sebenar.",
      },
      {
        q: "Adakah penilaian ini sah?",
        a: "Ya. BrainScan dibangunkan dan disahkan di Lee Kong Chian School of Medicine NTU, Dementia Research Centre, dan berdaftar dengan HSA Singapura.",
      },
      {
        q: "Untuk siapa ia sesuai?",
        a: "Sesiapa yang mahu mendahului kesihatan otaknya: sama ada anda mahu mengekalkan prestasi kognitif terbaik, sedang melalui perubahan hormon, atau menjaga orang tersayang yang hidup dengan demensia.",
      },
      {
        q: "Apa yang seterusnya?",
        a: "Muat turun bukti tawaran anda dan tunjukkannya di kaunter depan untuk menebus penilaian berdiskaun. Ujian itu sendiri berjalan dalam pelayar dan mengambil masa kira-kira sepuluh minit.",
      },
    ],
    disclaimer:
      "Laporan ini bertujuan untuk pemeriksaan kesejahteraan dan pendidikan sahaja. Ia tidak mendiagnosis penyakit perubatan atau menggantikan penilaian perubatan profesional. Penemuan harus ditafsirkan bersama konsultasi klinikal, penilaian gaya hidup dan, jika bersesuaian, penilaian bioperubatan.",
  },

  offer: {
    eyebrow: "Tawaran istimewa",
    title: "Bulan Alzheimer Sedunia",
    window: "1 – 30 September 2026",
    productName: "Ujian Kognitif BrainScan",
    productSub: "4 domain kognitif",
    domains: ["Kelajuan Pemprosesan", "Fungsi Eksekutif", "Memori", "Perhatian"],
    normalPrice: "Harga biasa",
    discountLabel: "Diskaun Bulan Alzheimer",
    total: "Jumlah",
    claimCode: "Kod tebusan anda:",
    preparing: "Menyediakan…",
    download: "Muat turun bukti tawaran",
    redeemNote: "Tunjukkan ini di kaunter depan untuk menebusnya.",
  },
};

const BY_LANG: Record<LiteEventLang, LiteEventCopy> = { en: EN, zh: ZH, ms: MS };

export function liteEventCopy(lang: LiteEventLang): LiteEventCopy {
  return BY_LANG[lang] ?? EN;
}

/**
 * The countdown screen sits on the shared /symbol-matching route, outside this
 * flow's React tree and its hook. It reads the app-wide `APP_LANG` instead,
 * which `setLiteEventLang` keeps in step — see src/i18n/liteEvent.ts.
 */
export function liteEventGameCopy(appLang: string): LiteEventCopy["countdown"] {
  if (appLang === "MANDARIN") return ZH.countdown;
  if (appLang === "MALAY") return MS.countdown;
  return EN.countdown;
}
