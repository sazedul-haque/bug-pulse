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

// ---------------------------------------------------------------------------
// Strict Title-First Deterministic Categorization Engine (Solution 2)
// ---------------------------------------------------------------------------

interface StrictModuleRule {
  category: IssueCategory;
  // Level 1: Strict subject match in the Issue Title
  titlePattern: RegExp;
  // Level 2: Unambiguous signature match in Details (only evaluated if Title has no match)
  detailsPattern: RegExp;
}

const STRICT_RULES: StrictModuleRule[] = [
  // 1. Monetization, Subscriptions & Payments (including Course Bundles)
  {
    category: 'Monetization & Payments',
    titlePattern:
      /\b(subscriptions?|stripe|woocommerce|paypal|razorpay|sepa|ideal|authorize\.net|mollie|paystack|payments?|checkouts?|course[- ]bundles?|bundles?|earnings?|payouts?|commissions?|coupons?|rebill|refunds?|monetiz(e|ation)|cart|pricing|billings?|renewals?)\b/i,
    detailsPattern:
      /\b(stripe|woocommerce|paypal|razorpay|authorize\.net|mollie|paystack|subscriptions?|payment\s+gateway|payouts?|course\s+bundles?|recurring\s+payments?|checkouts?\s+page|native\s+subscriptions?)\b/i,
  },

  // 2. Email Notifications
  {
    category: 'Email Notifications',
    titlePattern:
      /\b(emails?|mailers?|smtp|wp_mail|phpmailer|mailgun|sendgrid|deliverability|notifications?|digest)\b/i,
    detailsPattern:
      /\b(duplicate\s+emails?|emails?\s+notifications?|smtp\b|wp_mail|phpmailer|mailgun|sendgrid|emails?\s+templates?|welcome\s+emails?|enrollment\s+emails?)\b/i,
  },

  // 3. Security, Authentication & Permissions
  {
    category: 'Security & Auth',
    titlePattern:
      /\b(vulnerabilit(y|ies)|sql\s+injection|sqli|idor|bola|xss|csrf|2fa|two[- ]factor|otp|nonces?|privilege\s+escalation|unauthenticated|active\s+device|brute\s+force|sanitiz(e|ation)|securit(y|ies)|authoriz(e|ation)|authenticat(e|ion))\b/i,
    detailsPattern:
      /\b(sql\s+injection|sqli\b|idor\b|bola\b|xss\b|csrf\b|vulnerabilit(y|ies)|2fa\b|two[- ]factor|nonces?\b|privilege\s+escalation|unauthenticated)\b/i,
  },

  // 4. Quizzes & Grading
  {
    category: 'Quizzes & Grading',
    titlePattern:
      /\b(quiz(zes)?|questions?|gradebooks?|grad(ing|es?)|marks?|assessments?|latex|passing\s+grade|true\s*\/\s*false|short\s+answer|fill\s+in\s+the\s+blank)\b/i,
    detailsPattern:
      /\b(gradebooks?|latex\s+formula|passing\s+grade|quiz\s+attempts?|true\s*\/\s*false|single\s+choice\s+question|multiple\s+choice\s+question)\b/i,
  },

  // 5. Video & Media Player
  {
    category: 'Video & Media Player',
    titlePattern:
      /\b(videos?|players?|bunny\.?net|youtube|vimeo|streamable|hls|presto|playback|subtitles?|vtt|captions?|mp4|fullscreen\s+video)\b/i,
    detailsPattern:
      /\b(bunny\.?net|youtube\.com|vimeo\.com|streamable\.com|hls\s+stream|video\s+players?|playback\s+speed|presto\s+player)\b/i,
  },

  // 6. Translations & i18n
  {
    category: 'Translations & i18n',
    titlePattern:
      /\b(translations?|wpml|loco|pot\s+files?|poedit|polylang|translatepress|languages?|rtl|korean|japanese|hebrew|bangla|arabic|unicode|slug\s+issue|slug\s+generation|multilingual|i18n|l10n|locales?)\b/i,
    detailsPattern:
      /\b(wpml\b|loco\s+translate|pot\s+files?|poedit|polylang|translatepress|slug\s+generation|rtl\s+direction|multilingual)\b/i,
  },

  // 7. Certificates & Badges
  {
    category: 'Certificates & Badges',
    titlePattern:
      /\b(certificates?|certs?|cert_hash|badges?|cert\s+templates?|pdf\s+certificates?)\b/i,
    detailsPattern:
      /\b(cert_hash|certificate\s+builders?|verify\s+certificates?|pdf\s+certificates?|gamipress\s+badges?)\b/i,
  },

  // 8. Integrations & Addons
  {
    category: 'Integrations & Addons',
    titlePattern:
      /\b(elementor|divi|gutenberg|google\s+meet|google\s+classroom|zoom|h5p|learndash|learnpress|buddypress|buddyboss|paid\s+memberships\s+pro|pmpro|rest\s+apis?|webhooks?|zapier|integrations?|addons?)\b/i,
    detailsPattern:
      /\b(elementor\b|divi\b|google\s+meet|google\s+classroom|zoom\s+meeting|h5p\b|learndash|pmpro\b|rest\s+apis?\s+endpoint)\b/i,
  },

  // 9. Course Progression & Drip
  {
    category: 'Course Progression & Drip',
    titlePattern:
      /\b(content\s+drips?|drips?|course\s+progression|progression|prerequisites?|curriculum|assignments?|announcements?|course\s+builder)\b/i,
    detailsPattern:
      /\b(content\s+drips?|drip\s+content|course\s+progression|prerequisites?\s+course|curriculum\s+builders?)\b/i,
  },

  // 10. Dashboard & UI/UX
  {
    category: 'Dashboard & UI/UX',
    titlePattern:
      /\b(dashboards?|dark\s+modes?|frontends?|responsives?|sidebars?|navbars?|drawers?|modals?|dropdowns?|\bui\b|\bux\b)\b/i,
    detailsPattern:
      /\b(dark\s+mode|frontend\s+dashboard|student\s+dashboard|instructor\s+dashboard|responsive\s+layout)\b/i,
  },
];

export function detectCategory(title: string, details: string): IssueCategory {
  const safeTitle = (title || '').trim();
  const safeDetails = (details || '').trim();

  // LEVEL 1: Check Issue Title first (Primary Subject)
  if (safeTitle) {
    for (const rule of STRICT_RULES) {
      if (rule.titlePattern.test(safeTitle)) {
        return rule.category;
      }
    }
  }

  // LEVEL 2: Check Details using high-confidence signature patterns only (no generic noise words)
  if (safeDetails) {
    for (const rule of STRICT_RULES) {
      if (rule.detailsPattern.test(safeDetails)) {
        return rule.category;
      }
    }
  }

  // LEVEL 3: Deterministic fallback
  return 'General & Other';
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
