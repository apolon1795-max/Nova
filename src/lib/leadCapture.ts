import { Entrepreneur, EntrepreneurId, ENTREPRENEUR_IDS } from '../types';

const DEFAULT_PRIVACY_URL = 'https://новатория18.рф/page38711582.html';
const DEFAULT_LEAD_ENDPOINT = '/api/lead';
const REQUEST_TIMEOUT_MS = 25_000;
const PHONE_DIGITS_PATTERN = /^\d{10,11}$/;

export type NotificationDelivery = 'sent' | 'skipped' | 'failed';

export interface LeadReceipt {
  leadId: string;
  storedAt: string;
  duplicate: boolean;
  notifications: {
    telegram: NotificationDelivery;
  };
}

export interface LeadFormMeta {
  parentPermissionConfirmed: boolean;
  formStartedAt: string;
  website: string;
  leadId: string;
}

export interface LeadSubmission {
  schemaVersion: 1;
  leadId: string;
  source: 'novatoria-entrepreneur-quiz';
  createdAt: string;
  contact: {
    parentPhone: string;
  };
  result: {
    entrepreneurId: EntrepreneurId;
    entrepreneurName: string;
    archetype: string;
    skills: string[];
    scoreSummary: Partial<Record<EntrepreneurId, number>>;
  };
  consent: {
    parentPermissionConfirmed: true;
    privacyUrl: string;
    acceptedAt: string;
  };
  context: {
    pageUrl: string;
    referrer: string;
    language: string;
    formStartedAt: string;
    utm: Record<string, string>;
  };
  antiSpam: {
    website: string;
  };
}

type LeadErrorCode = 'timeout' | 'network' | 'rejected' | 'invalid_response';

export class LeadSubmissionError extends Error {
  constructor(public readonly code: LeadErrorCode, message: string) {
    super(message);
    this.name = 'LeadSubmissionError';
  }
}

export function getPrivacyUrl(): string {
  return import.meta.env.VITE_PRIVACY_URL?.trim() || DEFAULT_PRIVACY_URL;
}

function getLeadEndpoint(): string {
  const configured = import.meta.env.VITE_LEAD_ENDPOINT?.trim();
  if (!configured) return DEFAULT_LEAD_ENDPOINT;
  try {
    const endpoint = new URL(configured);
    if (endpoint.protocol === 'https:') return endpoint.toString();
  } catch {
    // The user-facing error below is intentionally generic.
  }
  throw new LeadSubmissionError('rejected', 'Сервис заявок настроен некорректно');
}

export function createLeadId(): string {
  return crypto.randomUUID();
}

export function getPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function isPhoneValid(phone: string): boolean {
  const digits = getPhoneDigits(phone);
  if (!PHONE_DIGITS_PATTERN.test(digits)) return false;
  return digits.length === 10 || digits.startsWith('7') || digits.startsWith('8');
}

function readUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = params.get(key)?.trim();
    if (value) result[key] = value.slice(0, 200);
  }
  return result;
}

function cleanScores(scores: Record<string, number>): Partial<Record<EntrepreneurId, number>> {
  const result: Partial<Record<EntrepreneurId, number>> = {};
  for (const id of ENTREPRENEUR_IDS) {
    const value = scores[id];
    if (Number.isFinite(value) && value >= 0) result[id] = Math.round(value);
  }
  return result;
}

export function buildLeadSubmission(
  person: Entrepreneur,
  scores: Record<string, number>,
  parentPhone: string,
  meta: LeadFormMeta,
): LeadSubmission {
  if (!isPhoneValid(parentPhone)) {
    throw new LeadSubmissionError('rejected', 'Проверь номер телефона мамы или папы');
  }
  if (!meta.parentPermissionConfirmed) {
    throw new LeadSubmissionError('rejected', 'Подтверди, что взрослый разрешил указать номер');
  }

  const submittedAt = new Date().toISOString();
  return {
    schemaVersion: 1,
    leadId: meta.leadId,
    source: 'novatoria-entrepreneur-quiz',
    createdAt: submittedAt,
    contact: {
      parentPhone: parentPhone.trim(),
    },
    result: {
      entrepreneurId: person.id,
      entrepreneurName: person.name,
      archetype: person.archetype,
      skills: person.skills.map((skill) => skill.name),
      scoreSummary: cleanScores(scores),
    },
    consent: {
      parentPermissionConfirmed: true,
      privacyUrl: getPrivacyUrl(),
      acceptedAt: submittedAt,
    },
    context: {
      pageUrl: window.location.href.slice(0, 2_000),
      referrer: document.referrer.slice(0, 2_000),
      language: navigator.language,
      formStartedAt: meta.formStartedAt,
      utm: readUtm(),
    },
    antiSpam: {
      website: meta.website,
    },
  };
}

function isLeadReceipt(value: unknown): value is LeadReceipt {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LeadReceipt> & { stored?: unknown };
  const notifications = candidate.notifications;
  const validDeliveries = new Set<NotificationDelivery>(['sent', 'skipped', 'failed']);
  return candidate.stored === true
    && typeof candidate.leadId === 'string'
    && typeof candidate.storedAt === 'string'
    && Number.isFinite(Date.parse(candidate.storedAt))
    && typeof candidate.duplicate === 'boolean'
    && Boolean(notifications)
    && validDeliveries.has(notifications!.telegram);
}

export async function submitLead(payload: LeadSubmission): Promise<LeadReceipt> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getLeadEndpoint(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Lead-Id': payload.leadId,
      },
      body: JSON.stringify(payload),
      credentials: 'omit',
      signal: controller.signal,
    });

    const responseBody: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = responseBody && typeof responseBody === 'object' && 'message' in responseBody
        ? String(responseBody.message)
        : 'Сервис не принял заявку';
      throw new LeadSubmissionError('rejected', message);
    }
    if (!isLeadReceipt(responseBody) || responseBody.leadId !== payload.leadId) {
      throw new LeadSubmissionError('invalid_response', 'Сервер не подтвердил сохранение результата');
    }
    return responseBody;
  } catch (error) {
    if (error instanceof LeadSubmissionError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new LeadSubmissionError('timeout', 'Сервис не ответил вовремя');
    }
    throw new LeadSubmissionError('network', 'Не удалось связаться с сервисом заявок');
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function getLeadErrorMessage(error: unknown): string {
  if (!(error instanceof LeadSubmissionError)) {
    return 'Не получилось сохранить результат. Проверь интернет и попробуй ещё раз.';
  }

  switch (error.code) {
    case 'timeout':
      return 'Ответ задержался. Проверь интернет и попробуй отправить ещё раз.';
    case 'network':
      return 'Нет связи с сервисом. Проверь интернет и попробуй ещё раз.';
    case 'rejected':
      return error.message || 'Проверь заполненные поля и попробуй ещё раз.';
    case 'invalid_response':
      return 'Сервис не подтвердил сохранение. Попробуй ещё раз.';
  }
}

export function buildParentShareText(person: Entrepreneur): string {
  const skills = person.skills.map((skill) => skill.name.toLowerCase()).join(', ');
  return [
    'Привет! Я прошёл тест Новатории «На какого предпринимателя ты похож».',
    '',
    `Мой результат — ${person.name}: ${person.archetype.toLowerCase()}.`,
    `Мои сильные стороны: ${skills}.`,
    '',
    'Хочу показать тебе результат и узнать про бесплатное пробное занятие:',
    window.location.origin,
  ].join('\n');
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function drawCenteredText(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);

  for (const [index, value] of lines.entries()) {
    context.fillText(value, centerX, y + index * lineHeight);
  }
  return y + lines.length * lineHeight;
}

export async function downloadParentShareCard(person: Entrepreneur): Promise<void> {
  await document.fonts?.ready;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Не удалось создать карточку');

  context.fillStyle = '#ffffe6';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#008282';
  drawRoundedRect(context, 54, 54, 972, 1242, 56);
  context.fill();

  context.fillStyle = '#d2ff5f';
  context.beginPath();
  context.arc(900, 180, 155, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#37beee';
  context.beginPath();
  context.arc(92, 1150, 118, 0, Math.PI * 2);
  context.fill();

  context.textAlign = 'center';
  context.textBaseline = 'top';
  context.fillStyle = '#ffffff';
  context.font = '700 52px "Anonymous Pro", monospace';
  context.fillText('НОВАТОРИЯ', 540, 110);

  context.fillStyle = '#d2ff5f';
  context.font = '700 30px "Anonymous Pro", monospace';
  context.fillText('МОЙ РЕЗУЛЬТАТ', 540, 245);

  context.fillStyle = '#ffffff';
  context.font = '700 74px "Anonymous Pro", monospace';
  const titleBottom = drawCenteredText(context, person.name, 540, 315, 810, 76);

  context.fillStyle = '#004f52';
  drawRoundedRect(context, 190, titleBottom + 34, 700, 76, 38);
  context.fill();
  context.fillStyle = '#ffffff';
  context.font = '700 29px "Anonymous Pro", monospace';
  context.fillText(person.archetype.toUpperCase(), 540, titleBottom + 56);

  context.fillStyle = '#d2ff5f';
  context.font = '700 30px "Anonymous Pro", monospace';
  context.fillText('МОИ СИЛЬНЫЕ СТОРОНЫ', 540, titleBottom + 180);

  const skillColors = ['#d2ff5f', '#37beee', '#ff92cd'];
  person.skills.forEach((skill, index) => {
    const skillY = titleBottom + 250 + index * 106;
    context.fillStyle = skillColors[index] || '#ffffff';
    drawRoundedRect(context, 180, skillY, 720, 78, 24);
    context.fill();
    context.fillStyle = '#004f52';
    context.font = '700 34px "Anonymous Pro", monospace';
    context.fillText(skill.name, 540, skillY + 22);
  });

  context.fillStyle = 'rgba(255,255,255,0.12)';
  drawRoundedRect(context, 150, 1068, 780, 128, 30);
  context.fill();
  context.fillStyle = '#ffffff';
  context.font = '400 28px "Geologica", sans-serif';
  drawCenteredText(context, 'Я прошёл тест «На какого предпринимателя ты похож»', 540, 1096, 670, 38);

  context.fillStyle = '#d2ff5f';
  context.font = '700 27px "Anonymous Pro", monospace';
  context.fillText('НОВАТОРИЯ18.РФ', 540, 1242);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('Не удалось сохранить карточку'))), 'image/png');
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `novatoria-${person.id}-result.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
