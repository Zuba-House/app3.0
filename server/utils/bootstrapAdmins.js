import { env } from '../config/env.js';

/** Emails that always receive ADMIN on sign-in (override mistaken USER role). */
const DEFAULT_BOOTSTRAP_ADMINS = ['olivier.niyo250@gmail.com'];

export function normalizeAdminEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function getBootstrapAdminEmails() {
  const emails = new Set(
    DEFAULT_BOOTSTRAP_ADMINS.map((e) => normalizeAdminEmail(e)).filter(Boolean)
  );
  if (env.adminEmail) {
    emails.add(normalizeAdminEmail(env.adminEmail));
  }
  for (const entry of env.adminEmails || []) {
    const normalized = normalizeAdminEmail(entry);
    if (normalized) emails.add(normalized);
  }
  return emails;
}

export function isBootstrapAdminEmail(email) {
  return getBootstrapAdminEmails().has(normalizeAdminEmail(email));
}
