import { BASE_URL, getHeaders } from './apiService';
import {
  ReminderDetail,
  CreateReminderPayload,
  UpdateReminderPayload,
  ListRemindersResponse,
} from '../types/reminders.types';
import {
  REMINDERS_PATH,
  REMINDER_PATH,
  REMINDERS_FAST_PATH,
} from '../constants/reminderConstants';

// ─── List ─────────────────────────────────────────────────────────────────────

export const getReminders = async (
  businessId: string,
  cursor?: string
): Promise<ListRemindersResponse> => {
  const url = cursor
    ? `${BASE_URL}/private/business/${businessId}/${REMINDERS_PATH}?cursor=${cursor}`
    : `${BASE_URL}/private/business/${businessId}/${REMINDERS_PATH}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch reminders');
  }

  const data = await response.json();
  console.log('📦 Reminders API Response:', data);

  if (data && Array.isArray(data.items)) {
    return data as ListRemindersResponse;
  }

  console.error('Unexpected API response format:', data);
  return { items: [], next_cursor: null };
};

// ─── List (Fast / UI-friendly) ────────────────────────────────────────────────

export const getRemindersFast = async (
  businessId: string
): Promise<ListRemindersResponse> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/${REMINDERS_FAST_PATH}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch reminders (fast)');
  }

  const data = await response.json();
  console.log('📦 Reminders Fast API Response:', data);

  if (data && Array.isArray(data.items)) {
    return data as ListRemindersResponse;
  }

  console.error('Unexpected API response format:', data);
  return { items: [], next_cursor: null };
};

// ─── Get by ID ────────────────────────────────────────────────────────────────

export const getReminderById = async (
  businessId: string,
  reminderId: string
): Promise<ReminderDetail> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/${REMINDER_PATH}/${reminderId}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch reminder');
  }

  return response.json() as Promise<ReminderDetail>;
};

// ─── Create (with full debug logging) ────────────────────────────────────────

export const createReminder = async (
  businessId: string,
  payload: CreateReminderPayload
): Promise<ReminderDetail> => {

  // ── STEP 1: Log raw payload ───────────────────────────────────────────────
  console.group('🔍 createReminder DEBUG');
  console.log('📌 businessId:', businessId);
  console.log('📦 Full payload:', JSON.stringify(payload, null, 2));

  // ── STEP 2: Field-by-field check ─────────────────────────────────────────
  console.log('─── Field-by-field check ───');
  console.log('taskId:',               payload.taskId,               typeof payload.taskId,               payload.taskId               ? '✅' : '❌ EMPTY');
  console.log('reminderDefinitionId:', payload.reminderDefinitionId, typeof payload.reminderDefinitionId, payload.reminderDefinitionId ? '✅' : '❌ EMPTY');
  console.log('reminderSource:',       payload.reminderSource,       typeof payload.reminderSource,       payload.reminderSource       ? '✅' : '❌ EMPTY');
  console.log('channel:',              payload.channel,              typeof payload.channel,              payload.channel              ? '✅' : '❌ EMPTY');
  console.log('targetUserId:',         payload.targetUserId,         typeof payload.targetUserId,         payload.targetUserId         ? '✅' : '❌ EMPTY');
  console.log('messageTemplateId:',    payload.messageTemplateId,    typeof payload.messageTemplateId,    payload.messageTemplateId    ? '✅' : '❌ EMPTY');
  console.log('sendNow:',              payload.sendNow,              typeof payload.sendNow);
  console.log('scheduledAt:',          payload.scheduledAt ?? 'NOT INCLUDED IN PAYLOAD');

  // ── STEP 3: Enum validation ───────────────────────────────────────────────
  const validSources  = ['MANUAL', 'AUTOMATIC'];
  const validChannels = ['IN_APP', 'EMAIL', 'SMS'];
  console.log('─── Enum validation ───');
  console.log('reminderSource valid?', validSources.includes(payload.reminderSource)  ? '✅' : `❌ GOT: "${payload.reminderSource}"`);
  console.log('channel valid?',        validChannels.includes(payload.channel)        ? '✅' : `❌ GOT: "${payload.channel}"`);

  // ── STEP 4: scheduledAt format check ─────────────────────────────────────
  if (payload.scheduledAt) {
    const dateObj = new Date(payload.scheduledAt);
    const isValid = !isNaN(dateObj.getTime());
    console.log('─── scheduledAt check ───');
    console.log('scheduledAt raw:',    payload.scheduledAt);
    console.log('scheduledAt parsed:', isValid ? dateObj.toISOString() : 'PARSE FAILED');
    console.log('scheduledAt valid?',  isValid ? '✅' : '❌ INVALID DATE');
  }

  // ── STEP 5: URL check ─────────────────────────────────────────────────────
  const url = `${BASE_URL}/private/business/${businessId}/${REMINDERS_PATH}`;
  console.log('─── Request URL ───');
  console.log('POST →', url);
  console.groupEnd();

  // ── STEP 6: Make the request ──────────────────────────────────────────────
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  // ── STEP 7: Read response as text first (safe for any content-type) ───────
  const responseText = await response.text();

  console.group(`📥 API Response [${response.status}]`);
  console.log('Status:',   response.status, response.statusText);
  console.log('Raw body:', responseText);

  let data: unknown = null;
  try {
    data = JSON.parse(responseText);
    console.log('Parsed body:', data);
  } catch {
    console.log('⚠️ Response body is not JSON');
  }
  console.groupEnd();

  // ── STEP 8: Handle error with best available message ──────────────────────
  if (!response.ok) {
    const backendMessage =
      (data as { message?: string })?.message  ??
      (data as { error?: string })?.error       ??
      (data as { detail?: string })?.detail     ??
      `HTTP ${response.status}: ${response.statusText}`;

    console.error('❌ API Error:', backendMessage, '\nFull error data:', data);
    throw new Error(backendMessage);
  }

  return data as ReminderDetail;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateReminder = async (
  businessId: string,
  reminderId: string,
  payload: UpdateReminderPayload
): Promise<ReminderDetail> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/${REMINDER_PATH}/${reminderId}`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update reminder');
  }

  return response.json() as Promise<ReminderDetail>;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteReminder = async (
  businessId: string,
  reminderId: string
): Promise<void> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/${REMINDER_PATH}/${reminderId}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to delete reminder');
  }
};