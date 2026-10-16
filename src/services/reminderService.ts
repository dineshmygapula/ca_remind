// services/reminderService.ts
import { api } from '@/lib/api';
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

const bizPath = (businessId: string) => `/private/business/${businessId}`;

// GET /private/business/{businessId}/reminders[?cursor=...]
export const getReminders = (
  businessId: string,
  cursor?: string
): Promise<ListRemindersResponse> =>
  api
    .get<ListRemindersResponse>(
      `${bizPath(businessId)}/${REMINDERS_PATH}`,
      cursor ? { params: { cursor } } : undefined
    )
    .then((r) =>
      r.data && Array.isArray(r.data.items)
        ? r.data
        : { items: [], next_cursor: null }
    );

// GET /private/business/{businessId}/reminders/fast
export const getRemindersFast = (businessId: string): Promise<ListRemindersResponse> =>
  api
    .get<ListRemindersResponse>(`${bizPath(businessId)}/${REMINDERS_FAST_PATH}`)
    .then((r) =>
      r.data && Array.isArray(r.data.items)
        ? r.data
        : { items: [], next_cursor: null }
    );

// GET /private/business/{businessId}/reminder/{reminderId}
export const getReminderById = (
  businessId: string,
  reminderId: string
): Promise<ReminderDetail> =>
  api
    .get<ReminderDetail>(`${bizPath(businessId)}/${REMINDER_PATH}/${reminderId}`)
    .then((r) => r.data);

// POST /private/business/{businessId}/reminders
export const createReminder = (
  businessId: string,
  payload: CreateReminderPayload
): Promise<ReminderDetail> =>
  api
    .post<ReminderDetail>(`${bizPath(businessId)}/${REMINDERS_PATH}`, payload)
    .then((r) => r.data);

// PATCH /private/business/{businessId}/reminder/{reminderId}
export const updateReminder = (
  businessId: string,
  reminderId: string,
  payload: UpdateReminderPayload
): Promise<ReminderDetail> =>
  api
    .patch<ReminderDetail>(
      `${bizPath(businessId)}/${REMINDER_PATH}/${reminderId}`,
      payload
    )
    .then((r) => r.data);

// DELETE /private/business/{businessId}/reminder/{reminderId}
export const deleteReminder = (businessId: string, reminderId: string): Promise<void> =>
  api
    .delete(`${bizPath(businessId)}/${REMINDER_PATH}/${reminderId}`)
    .then(() => undefined);