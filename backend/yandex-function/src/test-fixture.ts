import { randomUUID } from 'node:crypto';
import { LeadSubmission } from './types.js';

export function makeValidLead(overrides: Partial<LeadSubmission> = {}): LeadSubmission {
  const now = Date.now();
  const lead: LeadSubmission = {
    schemaVersion: 1,
    leadId: randomUUID(),
    source: 'novatoria-entrepreneur-quiz',
    createdAt: new Date(now).toISOString(),
    contact: { parentPhone: '+7 999 111-22-33' },
    result: {
      entrepreneurId: 'gates',
      entrepreneurName: 'Билл Гейтс',
      archetype: 'Системный исследователь',
      skills: ['Аналитика', 'Стратегия', 'Фокус'],
      scoreSummary: { gates: 12, jobs: 4 },
    },
    consent: {
      parentPermissionConfirmed: true,
      privacyUrl: 'https://новатория18.рф/page38711582.html',
      acceptedAt: new Date(now).toISOString(),
    },
    context: {
      pageUrl: 'https://nova-pi-eosin.vercel.app/',
      referrer: '',
      language: 'ru-RU',
      formStartedAt: new Date(now - 3_000).toISOString(),
      utm: {},
    },
    antiSpam: { website: '' },
  };
  return { ...lead, ...overrides };
}
