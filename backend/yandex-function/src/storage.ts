import { MetadataCredentialsProvider } from '@ydbjs/auth/metadata';
import { Driver } from '@ydbjs/core';
import { query, QueryClient } from '@ydbjs/query';
import { LeadStorage, LeadSubmission, NotificationDelivery, StoredLead, StoreResult } from './types.js';

const TABLE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,62}$/;
const memoryLeads = new Map<string, StoredLead>();

function cloneLead(lead: StoredLead): StoredLead {
  return structuredClone(lead);
}

export class MemoryLeadStorage implements LeadStorage {
  async ensureSchema(): Promise<void> {}

  async insertOrGet(payload: LeadSubmission, storedAt: string): Promise<StoreResult> {
    const existing = memoryLeads.get(payload.leadId);
    if (existing) return { lead: cloneLead(existing), duplicate: true };
    const lead: StoredLead = {
      payload: structuredClone(payload),
      storedAt,
      telegramStatus: 'pending',
    };
    memoryLeads.set(payload.leadId, lead);
    return { lead: cloneLead(lead), duplicate: false };
  }

  async updateNotificationStatus(leadId: string, telegramStatus: NotificationDelivery): Promise<void> {
    const lead = memoryLeads.get(leadId);
    if (!lead) throw new Error('Stored lead not found');
    lead.telegramStatus = telegramStatus;
  }
}

interface ExistingLeadRow {
  payload_json: string;
  stored_at: string;
  telegram_status: string;
}

function normalizeStatus(value: string): NotificationDelivery {
  return value === 'sent' || value === 'skipped' || value === 'failed' ? value : 'pending';
}

export class YdbLeadStorage implements LeadStorage {
  private readonly table;

  constructor(private readonly sql: QueryClient, tableName: string) {
    if (!TABLE_NAME_PATTERN.test(tableName)) throw new Error('YDB_TABLE_NAME has an unsafe format');
    this.table = sql.identifier(tableName);
  }

  async ensureSchema(): Promise<void> {
    await this.sql`
      CREATE TABLE IF NOT EXISTS ${this.table} (
        lead_id Text NOT NULL,
        stored_at Text NOT NULL,
        created_at Text NOT NULL,
        source Text NOT NULL,
        parent_phone Text NOT NULL,
        result_id Text NOT NULL,
        result_name Text NOT NULL,
        result_archetype Text NOT NULL,
        result_skills_json Text NOT NULL,
        score_summary_json Text NOT NULL,
        consent_url Text NOT NULL,
        page_url Text NOT NULL,
        referrer Text NOT NULL,
        utm_json Text NOT NULL,
        payload_json Text NOT NULL,
        telegram_status Text NOT NULL,
        PRIMARY KEY (lead_id)
      )
    `;
  }

  async insertOrGet(payload: LeadSubmission, storedAt: string): Promise<StoreResult> {
    return this.sql.begin({ idempotent: true }, async (tx) => {
      const [rows] = await tx<[ExistingLeadRow]>`
        SELECT payload_json, stored_at, telegram_status
        FROM ${this.table}
        WHERE lead_id = ${payload.leadId}
      `;
      const existing = rows?.[0];
      if (existing) {
        return {
          duplicate: true,
          lead: {
            payload: JSON.parse(existing.payload_json) as LeadSubmission,
            storedAt: existing.stored_at,
            telegramStatus: normalizeStatus(existing.telegram_status),
          },
        };
      }

      const record = {
        lead_id: payload.leadId,
        stored_at: storedAt,
        created_at: payload.createdAt,
        source: payload.source,
        parent_phone: payload.contact.parentPhone,
        result_id: payload.result.entrepreneurId,
        result_name: payload.result.entrepreneurName,
        result_archetype: payload.result.archetype,
        result_skills_json: JSON.stringify(payload.result.skills),
        score_summary_json: JSON.stringify(payload.result.scoreSummary),
        consent_url: payload.consent.privacyUrl,
        page_url: payload.context.pageUrl,
        referrer: payload.context.referrer,
        utm_json: JSON.stringify(payload.context.utm),
        payload_json: JSON.stringify(payload),
        telegram_status: 'pending',
      };

      await tx`
        UPSERT INTO ${this.table} (
          lead_id, stored_at, created_at, source, parent_phone,
          result_id, result_name, result_archetype, result_skills_json, score_summary_json,
          consent_url, page_url, referrer, utm_json, payload_json, telegram_status
        )
        VALUES (
          ${record.lead_id}, ${record.stored_at}, ${record.created_at}, ${record.source}, ${record.parent_phone},
          ${record.result_id}, ${record.result_name}, ${record.result_archetype}, ${record.result_skills_json}, ${record.score_summary_json},
          ${record.consent_url}, ${record.page_url}, ${record.referrer}, ${record.utm_json}, ${record.payload_json}, ${record.telegram_status}
        )
      `;
      return {
        duplicate: false,
        lead: { payload, storedAt, telegramStatus: 'pending' },
      };
    });
  }

  async updateNotificationStatus(leadId: string, telegramStatus: NotificationDelivery): Promise<void> {
    await this.sql`
      UPDATE ${this.table}
      SET telegram_status = ${telegramStatus}
      WHERE lead_id = ${leadId}
    `;
  }
}

export async function withConfiguredStorage<T>(callback: (storage: LeadStorage) => Promise<T>): Promise<T> {
  if (process.env.LEAD_STORAGE_MODE === 'memory') {
    const storage = new MemoryLeadStorage();
    await storage.ensureSchema();
    return callback(storage);
  }

  const connectionString = process.env.YDB_CONNECTION_STRING?.trim();
  if (!connectionString) throw new Error('YDB_CONNECTION_STRING is required');

  const driver = new Driver(connectionString, {
    credentialsProvider: new MetadataCredentialsProvider({}),
  });
  const sql = query(driver, { poolOptions: { minSize: 0, maxSize: 2 } });

  try {
    await driver.ready();
    const storage = new YdbLeadStorage(sql, process.env.YDB_TABLE_NAME?.trim() || 'novatoria_quiz_leads');
    await storage.ensureSchema();
    return await callback(storage);
  } finally {
    await sql[Symbol.asyncDispose]();
    driver.close();
  }
}
