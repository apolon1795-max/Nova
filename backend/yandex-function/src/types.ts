export type NotificationDelivery = 'pending' | 'sent' | 'skipped' | 'failed';

export type EntrepreneurId =
  | 'gates'
  | 'jobs'
  | 'musk'
  | 'durov'
  | 'ovchinnikov'
  | 'bakalchuk'
  | 'bezos'
  | 'zuckerberg';

export interface LeadSubmission {
  schemaVersion: 1 | 2;
  leadId: string;
  source: 'novatoria-entrepreneur-quiz';
  createdAt: string;
  contact: {
    motherName: string;
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

export interface StoredLead {
  payload: LeadSubmission;
  storedAt: string;
  telegramStatus: NotificationDelivery;
}

export interface StoreResult {
  lead: StoredLead;
  duplicate: boolean;
}

export interface LeadStorage {
  ensureSchema(): Promise<void>;
  insertOrGet(payload: LeadSubmission, storedAt: string): Promise<StoreResult>;
  updateNotificationStatus(leadId: string, telegramStatus: NotificationDelivery): Promise<void>;
}

export interface CloudFunctionEvent {
  httpMethod?: string;
  headers?: Record<string, string | undefined>;
  body?: string | Record<string, unknown> | null;
  isBase64Encoded?: boolean;
}

export interface CloudFunctionResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded?: false;
}

export interface PublicLeadReceipt {
  stored: true;
  leadId: string;
  storedAt: string;
  duplicate: boolean;
  notifications: {
    telegram: Exclude<NotificationDelivery, 'pending'>;
  };
}
