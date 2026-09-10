import { ExtractedLink, IssueCategory, IssuePriority, IssueStatus } from '../types/issue';

export function normalizePriority(raw: string | undefined | null): IssuePriority {
  if (!raw) return 'Unassigned';
  const clean = raw.toLowerCase().trim();
  if (clean.includes('hight') || clean.includes('high') || clean.includes('urgent') || clean.includes('critical')) {
    return 'High';
  }
  if (clean.includes('mid') || clean.includes('medium')) {
    return 'Mid';
  }
  if (clean.includes('low')) {
    return 'Low';
  }
  return 'Unassigned';
}

export function normalizeStatus(raw: string | undefined | null): IssueStatus {
  if (!raw) return 'New';
  const clean = raw.trim();
  const lower = clean.toLowerCase();

  if (
    lower === 'done' ||
    lower === 'completed' ||
    lower === 'resolved' ||
    lower === 'fixed' ||
    lower === 'closed'
  ) {
    return 'Done';
  }
  if (
    lower === 'accepted' ||
    lower === 'in progress' ||
    lower === 'in-progress' ||
    lower === 'approved' ||
    lower === 'investigating'
  ) {
    return 'Accepted';
  }
  if (lower === 'feature' || lower === 'enhancement' || lower === 'idea') {
    return 'Feature';
  }
  if (lower === 'request' || lower === 'feedback' || lower === 'need info' || lower === 'needs info') {
    return 'Request';
  }
  if (
    lower === 'rejected' ||
    lower === 'wontfix' ||
    lower === "won't fix" ||
    lower === 'invalid' ||
    lower === 'cancelled' ||
    lower === 'declined'
  ) {
    return 'Rejected';
  }
  return 'New';
}

interface CategoryRule {
  category: IssueCategory;
  // Strong unambiguous triggers (high confidence)
  highConfidence: RegExp[];
  // Standard domain keywords
  keywords: RegExp[];
  // Generic / weak context words that only count slightly in details
  weakKeywords?: RegExp[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Email Notifications',
    highConfidence: [
      /\bduplicate\s+emails?\b/i,
      /\bemails?\s+notification/i,
      /\benrollment\s+emails?\b/i,
      /\bwelcome\s+emails?\b/i,
      /\breset\s+password\s+emails?\b/i,
      /\bemail\s+templates?\b/i,
      /\bsmtp\b/i,
      /\bwp_mail\b/i,
      /\bphpmailer\b/i,
      /\bmailgun\b/i,
      /\bsendgrid\b/i,
      /\bdeliverability\b/i,
    ],
    keywords: [
      /\bemails?\b/i,
      /\bmailers?\b/i,
      /\bmailboxes?\b/i,
      /\bunsubscribe\b/i,
    ],
    weakKeywords: [
      /\bnotifications?\b/i,
      /\bnotified\b/i,
    ],
  },
  {
    category: 'Security & Auth',
    highConfidence: [
      /\bsql\s+injection\b/i,
      /\bsqli\b/i,
      /\bidor\b/i,
      /\bbola\b/i,
      /\bxss\b/i,
      /\bcsrf\b/i,
      /\bvulnerabilit(y|ies)\b/i,
      /\b2fa\b/i,
      /\btwo[- ]factor\b/i,
      /\botp\b/i,
      /\bnonces?\b/i,
      /\bprivilege\s+escalation\b/i,
      /\bunauthenticated\b/i,
      /\bactive\s+device\s+limit\b/i,
      /\bbrute\s+force\b/i,
      /\bsanitiz(e|ation)\b/i,
    ],
    keywords: [
      /\bsecurit(y|ies)\b/i,
      /\bauthoriz(e|ation)\b/i,
      /\bauthenticat(e|ion)\b/i,
      /\bpermissions?\b/i,
      /\bprivileges?\b/i,
    ],
    weakKeywords: [
      /\blogin\b/i,
      /\baccess\s+control\b/i,
    ],
  },
  {
    category: 'Monetization & Payments',
    highConfidence: [
      /\bstripe\b/i,
      /\bwoocommerce\b/i,
      /\bpaypal\b/i,
      /\brazorpay\b/i,
      /\bsepa\b/i,
      /\bideal\b/i,
      /\bauthorize\.net\b/i,
      /\bmollie\b/i,
      /\bpaystack\b/i,
      /\bpayment\s+gateway/i,
      /\brecurring\s+payment/i,
      /\bsubscriptions?\b/i,
      /\brebill\b/i,
      /\bmonetiz(e|ation)\b/i,
      /\bearnings?\b/i,
      /\bpayouts?\b/i,
      /\bcommissions?\b/i,
      /\bcoupons?\b/i,
    ],
    keywords: [
      /\bpayments?\b/i,
      /\bcheckouts?\b/i,
      /\bpricing\b/i,
      /\bdiscounts?\b/i,
      /\bwithdraw(als?)?\b/i,
      /\brefunds?\b/i,
      /\bcart\b/i,
    ],
    weakKeywords: [
      /\borders?\b/i,
      /\bprices?\b/i,
      /\bpurchas(e|es|ed)\b/i,
      /\binvoices?\b/i,
    ],
  },
  {
    category: 'Quizzes & Grading',
    highConfidence: [
      /\bgradebooks?\b/i,
      /\bpassing\s+grade\b/i,
      /\btrue\s*\/\s*false\b/i,
      /\blatex\b/i,
      /\bfill\s+in\s+the\s+blank\b/i,
      /\bshort\s+answer\b/i,
      /\bopen\s+ended\b/i,
      /\bshuffle\s+questions?\b/i,
      /\bquiz\s+attempts?\b/i,
      /\bquiz\s+results?\b/i,
    ],
    keywords: [
      /\bquiz(zes)?\b/i,
      /\bquestions?\b/i,
      /\bgrades?\b/i,
      /\bgrading\b/i,
      /\bmarks?\b/i,
      /\bassessments?\b/i,
    ],
    weakKeywords: [
      /\bscores?\b/i,
      /\bpoints?\b/i,
    ],
  },
  {
    category: 'Video & Media Player',
    highConfidence: [
      /\bbunny\.?net\b/i,
      /\byoutube\b/i,
      /\bvimeo\b/i,
      /\bstreamable\b/i,
      /\bhls\b/i,
      /\bpresto\s+player\b/i,
      /\bvideo\s+players?\b/i,
      /\bplayback\s+speed\b/i,
      /\bsubtitles?\b/i,
      /\bvtt\b/i,
      /\bcaptions?\b/i,
      /\bfullscreen\s+video\b/i,
      /\bvideo\s+sources?\b/i,
    ],
    keywords: [
      /\bvideos?\b/i,
      /\bplayers?\b/i,
      /\bstreams?\b/i,
      /\bstreaming\b/i,
      /\bmp4\b/i,
      /\bplayback\b/i,
      /\bwebcam\b/i,
    ],
    weakKeywords: [
      /\bmedia\b/i,
      /\bembed\b/i,
    ],
  },
  {
    category: 'Translations & i18n',
    highConfidence: [
      /\bwpml\b/i,
      /\bloco(\s+translate)?\b/i,
      /\bpot\s+files?\b/i,
      /\bpoedit\b/i,
      /\bpolylang\b/i,
      /\btranslatepress\b/i,
      /\bmultilingual\b/i,
      /\bi18n\b/i,
      /\bl10n\b/i,
      /\bslug\s+generation\b/i,
      /\bhangul\b/i,
      /\bkanji\b/i,
      /\bkatakana\b/i,
      /\bhiragana\b/i,
    ],
    keywords: [
      /\btranslations?\b/i,
      /\blanguages?\b/i,
      /\brtl\b/i,
      /\bkorean\b/i,
      /\bjapanese\b/i,
      /\bhebrew\b/i,
      /\bbangla\b/i,
      /\barabic\b/i,
      /\bunicode\b/i,
      /\blocales?\b/i,
      /\btranslating\b/i,
    ],
    weakKeywords: [
      /\bstrings?\b/i,
    ],
  },
  {
    category: 'Certificates & Badges',
    highConfidence: [
      /\bcert_hash\b/i,
      /\bcertificate\s+builders?\b/i,
      /\bverify\s+certificates?\b/i,
      /\bcert\s+templates?\b/i,
      /\bpdf\s+certificates?\b/i,
      /\bdownload\s+certificates?\b/i,
      /\bgamipress\s+badges?\b/i,
      /\bbadges?\b/i,
    ],
    keywords: [
      /\bcertificates?\b/i,
      /\bcerts?\b/i,
    ],
    weakKeywords: [
      /\btemplates?\b/i,
    ],
  },
  {
    category: 'Course Progression & Drip',
    highConfidence: [
      /\bcontent\s+drips?\b/i,
      /\bdrip\s+contents?\b/i,
      /\bcourse\s+progression\b/i,
      /\bprerequisites?\b/i,
      /\bcourse\s+bundles?\b/i,
      /\blesson\s+drips?\b/i,
      /\benrollment\s+expirations?\b/i,
      /\bcourse\s+builders?\b/i,
      /\bcurriculum\s+builders?\b/i,
    ],
    keywords: [
      /\bdrips?\b/i,
      /\benroll(ments?|ed|ing)?\b/i,
      /\bprogression\b/i,
      /\blessons?\b/i,
      /\bcurriculum\b/i,
      /\bassignments?\b/i,
      /\bannouncements?\b/i,
    ],
    weakKeywords: [
      /\bcourses?\b/i,
      /\bcompleting\b/i,
    ],
  },
  {
    category: 'Integrations & Addons',
    highConfidence: [
      /\belementor\b/i,
      /\bdivi\b/i,
      /\bgutenberg\b/i,
      /\bgoogle\s+meet\b/i,
      /\bgoogle\s+classroom\b/i,
      /\bzoom\b/i,
      /\bh5p\b/i,
      /\blearndash\b/i,
      /\blearnpress\b/i,
      /\bbuddypress\b/i,
      /\bbuddyboss\b/i,
      /\bpaid\s+memberships\s+pro\b/i,
      /\bpmpro\b/i,
      /\brest\s+apis?\b/i,
      /\bwebhooks?\b/i,
      /\bzapier\b/i,
    ],
    keywords: [
      /\bintegrations?\b/i,
      /\baddons?\b/i,
      /\bmigrations?\b/i,
      /\bplugin\s+compatibility\b/i,
    ],
    weakKeywords: [
      /\bapis?\b/i,
      /\bextensions?\b/i,
    ],
  },
  {
    category: 'Dashboard & UI/UX',
    highConfidence: [
      /\bdark\s+modes?\b/i,
      /\bfrontend\s+dashboards?\b/i,
      /\bstudent\s+dashboards?\b/i,
      /\binstructor\s+dashboards?\b/i,
      /\bresponsive\s+layouts?\b/i,
      /\bmobile\s+menus?\b/i,
      /\bdrawers?\b/i,
      /\bmodals?\b/i,
    ],
    keywords: [
      /\bdashboards?\b/i,
      /\bui\b/i,
      /\bux\b/i,
      /\bmobile\b/i,
      /\bresponsives?\b/i,
      /\bsidebars?\b/i,
      /\bnavbars?\b/i,
      /\bdropdowns?\b/i,
      /\bbuttons?\b/i,
      /\bstyling\b/i,
      /\bthemes?\b/i,
      /\blayouts?\b/i,
      /\bcss\b/i,
      /\bfrontends?\b/i,
    ],
    weakKeywords: [
      /\btabs?\b/i,
      /\bviews?\b/i,
    ],
  },
];

export function detectCategory(title: string, details: string): IssueCategory {
  const safeTitle = title || '';
  const safeDetails = details || '';

  let bestCategory: IssueCategory = 'General & Other';
  let maxScore = 0;

  for (const rule of CATEGORY_RULES) {
    let score = 0;

    // 1. High-confidence regex matches
    for (const regex of rule.highConfidence) {
      if (regex.test(safeTitle)) score += 15;
      if (regex.test(safeDetails)) score += 5;
    }

    // 2. Standard domain keyword matches
    for (const regex of rule.keywords) {
      if (regex.test(safeTitle)) score += 10;
      if (regex.test(safeDetails)) score += 2;
    }

    // 3. Weak / generic keyword matches
    if (rule.weakKeywords) {
      for (const regex of rule.weakKeywords) {
        if (regex.test(safeTitle)) score += 4;
        if (regex.test(safeDetails)) score += 0.5;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestCategory = rule.category;
    }
  }

  return maxScore > 0 ? bestCategory : 'General & Other';
}

export function extractMediaLinks(text: string): ExtractedLink[] {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s,">)]+)/g;
  const matches = text.match(urlRegex) || [];
  const uniqueUrls = Array.from(new Set(matches));

  return uniqueUrls.map((url) => {
    const cleanUrl = url.replace(/[.,;:)]$/, '');
    if (cleanUrl.includes('loom.com/share')) {
      return { url: cleanUrl, type: 'loom', label: 'Loom Video' };
    }
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      return { url: cleanUrl, type: 'youtube', label: 'YouTube Video' };
    }
    if (cleanUrl.includes('streamable.com')) {
      return { url: cleanUrl, type: 'streamable', label: 'Streamable Video' };
    }
    if (
      cleanUrl.includes('prnt.sc') ||
      cleanUrl.includes('snipboard.io') ||
      cleanUrl.includes('ibb.co') ||
      cleanUrl.includes('cleanshot.com') ||
      cleanUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    ) {
      return { url: cleanUrl, type: 'image', label: 'Screenshot / Image' };
    }
    if (cleanUrl.includes('drive.google.com') || cleanUrl.includes('dropbox.com')) {
      return { url: cleanUrl, type: 'google-drive', label: 'Cloud File / Drive' };
    }
    if (cleanUrl.includes('tutorlms.com/account/tickets')) {
      return { url: cleanUrl, type: 'ticket', label: 'Support Ticket' };
    }
    return { url: cleanUrl, type: 'external', label: 'External Link' };
  });
}

export function parseDateToTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  // e.g. "7/16/25, 1:19 PM" or "2026-04-15"
  try {
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) return parsed;

    // Handle "M/D/YY, H:MM AM/PM"
    const parts = dateStr.split(',');
    if (parts.length >= 1) {
      const dateParts = parts[0].trim().split('/');
      if (dateParts.length === 3) {
        let year = parseInt(dateParts[2], 10);
        if (year < 100) year += 2000;
        const month = parseInt(dateParts[0], 10) - 1;
        const day = parseInt(dateParts[1], 10);
        const d = new Date(year, month, day);
        return d.getTime();
      }
    }
  } catch {
    // fallback
  }
  return 0;
}
