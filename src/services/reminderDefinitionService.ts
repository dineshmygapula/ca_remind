import { BASE_URL, getHeaders } from './apiService';
import {
  V2ReminderDefinition,
  CreateV2ReminderDefinitionPayload,
  UpdateV2ReminderDefinitionPayload,
  ListV2ReminderDefinitionsResponse,
} from '@/types/v2ReminderDefinition.types';
import {
 REMINDERS_PATH
} from '../constants/reminderConstants';

// ─── List ─────────────────────────────────────────────────────────────────────

export const getV2ReminderDefinitions = async (
  businessId: string
): Promise<V2ReminderDefinition[]> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/${REMINDERS_PATH}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch V2 reminder definitions');
  }

  const data: ListV2ReminderDefinitionsResponse | V2ReminderDefinition[] = await response.json();
  console.log('📦 V2 Reminder Definitions API Response:', data);

  if (data && Array.isArray((data as ListV2ReminderDefinitionsResponse).items)) {
    return (data as ListV2ReminderDefinitionsResponse).items;
  }

  if (Array.isArray(data)) {
    return data as V2ReminderDefinition[];
  }

  console.error('Unexpected API response format:', data);
  return [];
};

// ─── Get by ID ────────────────────────────────────────────────────────────────

export const getV2ReminderDefinitionById = async (
  businessId: string,
  definitionId: string
): Promise<V2ReminderDefinition> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/${REMINDERS_PATH}/${definitionId}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch V2 reminder definition');
  }

  return response.json() as Promise<V2ReminderDefinition>;
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createV2ReminderDefinition = async (
  businessId: string,
  payload: CreateV2ReminderDefinitionPayload
): Promise<V2ReminderDefinition> => {
  console.log('📤 Creating V2 reminder definition:', JSON.stringify(payload, null, 2));

  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/${REMINDERS_PATH}`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();
  console.log('📥 Response:', data);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to create V2 reminder definition');
  }

  return data as V2ReminderDefinition;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateV2ReminderDefinition = async (
  businessId: string,
  definitionId: string,
  payload: UpdateV2ReminderDefinitionPayload
): Promise<V2ReminderDefinition> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/${REMINDERS_PATH}/${definitionId}`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update V2 reminder definition');
  }

  return response.json() as Promise<V2ReminderDefinition>;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteV2ReminderDefinition = async (
  businessId: string,
  definitionId: string
): Promise<void> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/${REMINDERS_PATH}/${definitionId}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete V2 reminder definition');
  }
};