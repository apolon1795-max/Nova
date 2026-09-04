import assert from 'node:assert/strict';
import test from 'node:test';
import { RequestValidationError, validateLeadSubmission } from './domain.js';
import { makeValidLead } from './test-fixture.js';

test('validates and normalizes a legitimate quiz lead', () => {
  const input = makeValidLead();
  const result = validateLeadSubmission(input);
  assert.equal(result.leadId, input.leadId);
  assert.equal(result.contact.parentPhone, '+7 999 111-22-33');
  assert.equal(result.result.entrepreneurId, 'gates');
});

test('rejects a result whose public name does not match its id', () => {
  const input = makeValidLead();
  input.result.entrepreneurName = 'Подменённое имя';
  assert.throws(() => validateLeadSubmission(input), RequestValidationError);
});

test('rejects a lead without confirmed adult permission', () => {
  const input = makeValidLead() as unknown as { consent: { parentPermissionConfirmed: boolean } };
  input.consent.parentPermissionConfirmed = false;
  assert.throws(() => validateLeadSubmission(input), /разрешение взрослого/);
});

test('rejects the honeypot field', () => {
  const input = makeValidLead();
  input.antiSpam.website = 'spam.example';
  assert.throws(() => validateLeadSubmission(input), /отклонена/);
});
