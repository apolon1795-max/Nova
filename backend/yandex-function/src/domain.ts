import { EntrepreneurId, LeadSubmission } from './types.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PHONE_PATTERN = /^\d{10,11}$/;
const MOTHER_NAME_PATTERN = /^[\p{L}\p{M}](?:[\p{L}\p{M}'’ -]{0,48}[\p{L}\p{M}])$/u;
const MIN_FORM_DURATION_MS = 1_500;
const MAX_FORM_DURATION_MS = 24 * 60 * 60 * 1_000;
const ENTREPRENEUR_IDS = new Set<EntrepreneurId>([
  'gates', 'jobs', 'musk', 'durov', 'ovchinnikov', 'bakalchuk', 'bezos', 'zuckerberg',
]);

const RESULT_NAMES: Record<EntrepreneurId, { name: string; archetype: string }> = {
  gates: { name: 'Билл Гейтс', archetype: 'Системный исследователь' },
  jobs: { name: 'Стив Джобс', archetype: 'Создатель впечатлений' },
  musk: { name: 'Илон Маск', archetype: 'Смелый изобретатель' },
  durov: { name: 'Павел Дуров', archetype: 'Независимый новатор' },
  ovchinnikov: { name: 'Фёдор Овчинников', archetype: 'Командный предприниматель' },
  bakalchuk: { name: 'Татьяна Ким', archetype: 'Практичный организатор' },
  bezos: { name: 'Джефф Безос', archetype: 'Архитектор больших систем' },
  zuckerberg: { name: 'Марк Цукерберг', archetype: 'Исследователь цифрового мира' },
};

export class RequestValidationError extends Error {
  constructor(message: string, public readonly statusCode = 422) {
    super(message);
    this.name = 'RequestValidationError';
  }
}

function requireRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RequestValidationError(`Некорректное поле: ${field}`);
  }
  return value as Record<string, unknown>;
}

function cleanRequiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string') throw new RequestValidationError(`Некорректное поле: ${field}`);
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned || cleaned.length > maxLength) throw new RequestValidationError(`Некорректное поле: ${field}`);
  return cleaned;
}

function cleanOptionalString(value: unknown, field: string, maxLength: number): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') throw new RequestValidationError(`Некорректное поле: ${field}`);
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (cleaned.length > maxLength) throw new RequestValidationError(`Некорректное поле: ${field}`);
  return cleaned;
}

function requireIsoDate(value: unknown, field: string): string {
  const iso = cleanRequiredString(value, field, 64);
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) throw new RequestValidationError(`Некорректное поле: ${field}`);
  return new Date(timestamp).toISOString();
}

function requireHttpsUrl(value: unknown, field: string, maxLength = 2_000): string {
  const raw = cleanRequiredString(value, field, maxLength);
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') throw new Error('HTTPS required');
    return url.toString();
  } catch {
    throw new RequestValidationError(`Некорректное поле: ${field}`);
  }
}

function requirePageUrl(value: unknown): string {
  const raw = cleanRequiredString(value, 'context.pageUrl', 2_000);
  try {
    const url = new URL(raw);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) throw new Error('Unsafe protocol');
    return url.toString();
  } catch {
    throw new RequestValidationError('Некорректное поле: context.pageUrl');
  }
}

function readUtm(value: unknown): Record<string, string> {
  const record = requireRecord(value, 'context.utm');
  const allowed = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']);
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(record)) {
    if (!allowed.has(key)) continue;
    const cleaned = cleanOptionalString(item, `context.utm.${key}`, 200);
    if (cleaned) result[key] = cleaned;
  }
  return result;
}

function readSkills(value: unknown): string[] {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new RequestValidationError('Некорректное поле: result.skills');
  }
  return value.map((skill, index) => cleanRequiredString(skill, `result.skills.${index}`, 80));
}

function readScoreSummary(value: unknown): Partial<Record<EntrepreneurId, number>> {
  const record = requireRecord(value, 'result.scoreSummary');
  const result: Partial<Record<EntrepreneurId, number>> = {};
  for (const [key, score] of Object.entries(record)) {
    if (!ENTREPRENEUR_IDS.has(key as EntrepreneurId)) continue;
    if (!Number.isInteger(score) || Number(score) < 0 || Number(score) > 100) {
      throw new RequestValidationError(`Некорректное поле: result.scoreSummary.${key}`);
    }
    result[key as EntrepreneurId] = Number(score);
  }
  return result;
}

export function validateLeadSubmission(raw: unknown): LeadSubmission {
  const root = requireRecord(raw, 'body');
  if (root.schemaVersion !== 1 && root.schemaVersion !== 2) {
    throw new RequestValidationError('Неподдерживаемая версия формы');
  }
  const schemaVersion = root.schemaVersion;
  if (root.source !== 'novatoria-entrepreneur-quiz') throw new RequestValidationError('Некорректный источник заявки');

  const leadId = cleanRequiredString(root.leadId, 'leadId', 64);
  if (!UUID_PATTERN.test(leadId)) throw new RequestValidationError('Некорректный идентификатор заявки');

  const createdAt = requireIsoDate(root.createdAt, 'createdAt');
  const createdTimestamp = Date.parse(createdAt);
  const now = Date.now();
  if (createdTimestamp > now + 5 * 60_000 || createdTimestamp < now - 7 * 24 * 60 * 60_000) {
    throw new RequestValidationError('Некорректное время заявки');
  }

  const contact = requireRecord(root.contact, 'contact');
  const motherName = schemaVersion === 2
    ? cleanRequiredString(contact.motherName, 'contact.motherName', 50)
    : cleanOptionalString(contact.motherName, 'contact.motherName', 50);
  if (motherName && !MOTHER_NAME_PATTERN.test(motherName)) {
    throw new RequestValidationError('Проверьте имя мамы');
  }
  const parentPhone = cleanRequiredString(contact.parentPhone, 'contact.parentPhone', 24);
  if (!PHONE_PATTERN.test(parentPhone.replace(/\D/g, ''))) {
    throw new RequestValidationError('Проверьте номер телефона');
  }

  const resultRecord = requireRecord(root.result, 'result');
  const entrepreneurId = cleanRequiredString(resultRecord.entrepreneurId, 'result.entrepreneurId', 40) as EntrepreneurId;
  if (!ENTREPRENEUR_IDS.has(entrepreneurId)) throw new RequestValidationError('Некорректный результат теста');
  const expected = RESULT_NAMES[entrepreneurId];
  const entrepreneurName = cleanRequiredString(resultRecord.entrepreneurName, 'result.entrepreneurName', 100);
  const archetype = cleanRequiredString(resultRecord.archetype, 'result.archetype', 100);
  if (entrepreneurName !== expected.name || archetype !== expected.archetype) {
    throw new RequestValidationError('Результат теста не прошёл проверку');
  }

  const consent = requireRecord(root.consent, 'consent');
  if (consent.parentPermissionConfirmed !== true) {
    throw new RequestValidationError('Не подтверждено разрешение взрослого');
  }
  const acceptedAt = requireIsoDate(consent.acceptedAt, 'consent.acceptedAt');

  const context = requireRecord(root.context, 'context');
  const formStartedAt = requireIsoDate(context.formStartedAt, 'context.formStartedAt');
  const formDuration = createdTimestamp - Date.parse(formStartedAt);
  if (formDuration < MIN_FORM_DURATION_MS || formDuration > MAX_FORM_DURATION_MS) {
    throw new RequestValidationError('Форма заполнена за недопустимое время');
  }

  const antiSpam = requireRecord(root.antiSpam, 'antiSpam');
  if (cleanOptionalString(antiSpam.website, 'antiSpam.website', 240)) {
    throw new RequestValidationError('Заявка отклонена');
  }

  return {
    schemaVersion,
    leadId,
    source: 'novatoria-entrepreneur-quiz',
    createdAt,
    contact: { motherName, parentPhone },
    result: {
      entrepreneurId,
      entrepreneurName,
      archetype,
      skills: readSkills(resultRecord.skills),
      scoreSummary: readScoreSummary(resultRecord.scoreSummary),
    },
    consent: {
      parentPermissionConfirmed: true,
      privacyUrl: requireHttpsUrl(consent.privacyUrl, 'consent.privacyUrl'),
      acceptedAt,
    },
    context: {
      pageUrl: requirePageUrl(context.pageUrl),
      referrer: cleanOptionalString(context.referrer, 'context.referrer', 2_000),
      language: cleanOptionalString(context.language, 'context.language', 32),
      formStartedAt,
      utm: readUtm(context.utm),
    },
    antiSpam: { website: '' },
  };
}
