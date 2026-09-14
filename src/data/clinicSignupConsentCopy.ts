/**
 * Copy for the consent on the /clinic-signup landing page — the tickbox under
 * the name and email fields in the hero.
 *
 * ---------------------------------------------------------------------------
 * WHOSE CONSENT THIS IS
 * ---------------------------------------------------------------------------
 * Gray Matter Solutions' own, and nobody else's. This funnel reaches clinicians
 * through Eisai, but that is distribution, not partnership: Eisai gives
 * clinicians the option to try the assessment, and the personal data collected
 * here is never theirs to hold or to mail from. Eisai is therefore not named in
 * these clauses, and must not be added to them — naming a pharmaceutical
 * company in a consent it is not party to claims a relationship that does not
 * exist. Their own sign-up form was the model for the shape of this block and
 * for nothing else.
 *
 * ---------------------------------------------------------------------------
 * WHY IT IS COMPULSORY, AND WHY IT IS STILL A TICKBOX
 * ---------------------------------------------------------------------------
 * The assessment is free, and the consent is the condition of taking it, so
 * `consent` below is phrased as the condition it is ("By registering, I
 * consent…") rather than as an offer. The clinician still has to tick the box:
 * the wording carries the fact that there is no way past it, and the tick is
 * what records the moment they agreed. The landing page refuses to start the
 * run without it, reusing the shared `errConsent` line.
 *
 * The three languages translate in full. Nothing here is a partner's verbatim
 * wording that a paraphrase would misstate (contrast src/data/parkwayConsentCopy.ts,
 * which reproduces IHH's clauses and so stays English throughout); this is our
 * own copy, and a clinician who chose 中文 should be able to read what they are
 * agreeing to.
 */

import type { LiteEventLang } from "src/i18n/liteEvent";

export type ClinicSignupConsentCopy = {
  /** The small line above the tickbox, as the design sets it. */
  heading: string;
  /**
   * The tickbox label, in two parts: the authorisation confirmation, then the
   * consent itself. Split so the consent can be set in bold — it is the part
   * that is compulsory, and the part a clinician is most likely to skim past.
   */
  ownBehalf: string;
  consent: string;
  /**
   * The fine print under the button: what the data is used for, how to stop it,
   * and where the policy is. Split around the policy's name, which renders as a
   * link once GMS_PRIVACY_POLICY_URL is set and as plain text until then.
   */
  dataProtectionLead: string;
  policyName: string;
  dataProtectionTail: string;
  /** The mailing-platform notice, as Mailchimp's own guidance asks for it. */
  processingNote: string;
};

const EN: ClinicSignupConsentCopy = {
  heading: "I hereby confirm that I am submitting this form:",
  ownBehalf:
    "On my own behalf; or on behalf of another person, and I confirm that I am authorized to provide the answers in this form.",
  consent:
    "By registering, I consent for Gray Matter Solutions to contact me with emails and newsletters.",
  dataProtectionLead:
    "By registering, you agree for Gray Matter Solutions Pte Ltd and its related corporations and/or third-party service providers to collect, store, process and/or disclose your personal data for the purpose of sending you your assessment results, electronic direct mailers (EDMs), newsletters, and invitations to talks and events organised by us. You can unsubscribe at any time by clicking the link in the footer of our emails. For more information about our privacy practices, refer to our ",
  policyName: "Privacy Policy",
  dataProtectionTail: ".",
  processingNote:
    "We use Mailchimp as our marketing platform. By registering you acknowledge that your information will be transferred to Mailchimp for processing.",
};

const ZH: ClinicSignupConsentCopy = {
  heading: "我在此确认，我提交此表格：",
  ownBehalf:
    "以本人名义提交；或代表他人提交，并确认本人已获授权在此表格中提供相关答案。",
  consent: "注册即表示本人同意 Gray Matter Solutions 通过电子邮件与通讯与本人联系。",
  dataProtectionLead:
    "注册即表示您同意 Gray Matter Solutions Pte Ltd 及其关联公司和／或第三方服务供应商收集、储存、处理和／或披露您的个人资料，用于向您发送评估结果、电子邮件通讯（EDM）、新闻通讯，以及由我方举办的讲座与活动邀请。您可随时点击邮件页脚的链接取消订阅。有关我们隐私做法的更多信息，请参阅我们的",
  policyName: "隐私政策",
  dataProtectionTail: "。",
  processingNote:
    "我们使用 Mailchimp 作为营销平台。注册即表示您了解您的信息将传输至 Mailchimp 进行处理。",
};

const MS: ClinicSignupConsentCopy = {
  heading: "Saya dengan ini mengesahkan bahawa saya menghantar borang ini:",
  ownBehalf:
    "Bagi pihak diri saya sendiri; atau bagi pihak orang lain, dan saya mengesahkan bahawa saya diberi kuasa untuk memberikan jawapan dalam borang ini.",
  consent:
    "Dengan mendaftar, saya bersetuju untuk dihubungi oleh Gray Matter Solutions melalui e-mel dan surat berita.",
  dataProtectionLead:
    "Dengan mendaftar, anda bersetuju untuk Gray Matter Solutions Pte Ltd dan syarikat berkaitannya dan/atau penyedia perkhidmatan pihak ketiga mengumpul, menyimpan, memproses dan/atau mendedahkan data peribadi anda bagi tujuan menghantar keputusan penilaian anda, mel terus elektronik (EDM), surat berita, serta jemputan ke ceramah dan acara yang dianjurkan oleh kami. Anda boleh berhenti melanggan pada bila-bila masa dengan mengklik pautan di bahagian bawah e-mel kami. Untuk maklumat lanjut tentang amalan privasi kami, rujuk ",
  policyName: "Dasar Privasi",
  dataProtectionTail: " kami.",
  processingNote:
    "Kami menggunakan Mailchimp sebagai platform pemasaran kami. Dengan mendaftar, anda mengakui bahawa maklumat anda akan dipindahkan kepada Mailchimp untuk diproses.",
};

const BY_LANG: Record<LiteEventLang, ClinicSignupConsentCopy> = { en: EN, zh: ZH, ms: MS };

export const clinicSignupConsentCopy = (lang: LiteEventLang): ClinicSignupConsentCopy =>
  BY_LANG[lang] ?? EN;
