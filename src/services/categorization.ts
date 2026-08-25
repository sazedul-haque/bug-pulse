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

export function detectCategory(title: string, details: string): IssueCategory {
  const text = `${title} ${details}`.toLowerCase();

  if (
    text.includes('stripe') ||
    text.includes('woocommerce') ||
    text.includes('paypal') ||
    text.includes('payment') ||
    text.includes('subscription') ||
    text.includes('checkout') ||
    text.includes('earning') ||
    text.includes('order') ||
    text.includes('cart') ||
    text.includes('monetization') ||
    text.includes('price') ||
    text.includes('rebill') ||
    text.includes('razorpay') ||
    text.includes('sepa') ||
    text.includes('ideal')
  ) {
    return 'Monetization & Payments';
  }

  if (
    text.includes('quiz') ||
    text.includes('question') ||
    text.includes('gradebook') ||
    text.includes('marks') ||
    text.includes('assessment') ||
    text.includes('latex') ||
    text.includes('shuffle') ||
    text.includes('true/false') ||
    text.includes('passing grade')
  ) {
    return 'Quizzes & Grading';
  }

  if (
    text.includes('video') ||
    text.includes('player') ||
    text.includes('youtube') ||
    text.includes('vimeo') ||
    text.includes('bunnynet') ||
    text.includes('bunny.net') ||
    text.includes('hls') ||
    text.includes('stream') ||
    text.includes('fullscreen')
  ) {
    return 'Video & Media Player';
  }

  if (
    text.includes('translation') ||
    text.includes('wpml') ||
    text.includes('loco') ||
    text.includes('pot file') ||
    text.includes('language') ||
    text.includes('rtl') ||
    text.includes('korean') ||
    text.includes('japanese') ||
    text.includes('hebrew') ||
    text.includes('bangla') ||
    text.includes('unicode')
  ) {
    return 'Translations & i18n';
  }

  if (
    text.includes('certificate') ||
    text.includes('cert_hash') ||
    text.includes('badge') ||
    text.includes('template') && text.includes('cert')
  ) {
    return 'Certificates & Badges';
  }

  if (
    text.includes('vulnerability') ||
    text.includes('sql injection') ||
    text.includes('idor') ||
    text.includes('bola') ||
    text.includes('security') ||
    text.includes('authorization') ||
    text.includes('2fa') ||
    text.includes('otp') ||
    text.includes('nonce') ||
    text.includes('active device') ||
    text.includes('permission') ||
    text.includes('privilege')
  ) {
    return 'Security & Auth';
  }

  if (
    text.includes('email') ||
    text.includes('mailer') ||
    text.includes('notification') ||
    text.includes('smtp') ||
    text.includes('reset password')
  ) {
    return 'Email Notifications';
  }

  if (
    text.includes('drip') ||
    text.includes('enroll') ||
    text.includes('bundle') ||
    text.includes('prerequisite') ||
    text.includes('expiration') ||
    text.includes('access') ||
    text.includes('progression') ||
    text.includes('lesson') ||
    text.includes('course builder')
  ) {
    return 'Course Progression & Drip';
  }

  if (
    text.includes('elementor') ||
    text.includes('divi') ||
    text.includes('google meet') ||
    text.includes('google classroom') ||
    text.includes('zoom') ||
    text.includes('h5p') ||
    text.includes('rest api') ||
    text.includes('api') ||
    text.includes('migration') ||
    text.includes('learndash') ||
    text.includes('learnpress')
  ) {
    return 'Integrations & Addons';
  }

  if (
    text.includes('dashboard') ||
    text.includes('ui') ||
    text.includes('mobile') ||
    text.includes('responsive') ||
    text.includes('menu') ||
    text.includes('button') ||
    text.includes('dark mode') ||
    text.includes('sidebar') ||
    text.includes('layout')
  ) {
    return 'Dashboard & UI/UX';
  }

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
