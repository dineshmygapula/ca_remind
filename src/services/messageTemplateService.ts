import { BASE_URL, getHeaders } from './apiService';
import {
  MessageTemplate,
  MessageTemplateListItem,
  CreateMessageTemplateDto,
  UpdateMessageTemplateDto,
} from '../types/messageTemplate.types';

const handleError = (error: unknown, fallbackMessage: string): never => {
  if (error instanceof Error) throw new Error(error.message || fallbackMessage);
  throw new Error(fallbackMessage);
};

// ─────────────────────────────────────────────
// 1️⃣ GET – List Message Templates
// Endpoint: GET /private/business/{businessid}/v2messagetemplates
// Response: MessageTemplateListItem[]
// ─────────────────────────────────────────────
/* export const getMessageTemplates = async (
  businessId: string
): Promise<MessageTemplateListItem[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/v2messagetemplates`,
      { method: 'GET', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to fetch message templates');
    }

    const data = await response.json();
return (data || []).map((item: MessageTemplateListItem) => ({
  ...item,
  id: item.id ?? item.key,  // ← spreads item first, then overrides id
}));
    
   
  } catch (error: unknown) {
    console.error('❌ Get message templates error:', error);
    return handleError(error, 'Failed to fetch message templates');
  }
}; */


export const getMessageTemplates = async (
  businessId: string
): Promise<MessageTemplateListItem[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/v2messagetemplates`,
      { method: 'GET', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to fetch message templates');
    }

    const data = await response.json();

    // ✅ Explicitly map each field so nothing is accidentally dropped
    return (data || []).map((item: any) => ({
      id:               item.id ?? item.key,
      key:              item.key ?? '',
      name:             item.name ?? '',
      channels:         item.channels ?? [],
      reminder_type:    item.reminder_type,
      businessCategory: item.businessCategory ?? item.business_category ?? '',
      placeholders:     item.placeholders ?? [],
      isActive:         item.isActive ?? item.is_active ?? true,

      // ✅ THIS is what was missing — explicitly preserve nested templates
      templates: {
        email: item.templates?.email
          ? {
              subject: item.templates.email.subject ?? '',
              body:    item.templates.email.body ?? '',
            }
          : undefined,
        whatsapp: item.templates?.whatsapp
          ? {
              body: item.templates.whatsapp.body ?? '',
            }
          : undefined,
      },
    }));

  } catch (error: unknown) {
    console.error('❌ Get message templates error:', error);
    return handleError(error, 'Failed to fetch message templates');
  }
};
// ─────────────────────────────────────────────
// 2️⃣ GET – Get Message Template by ID
// Endpoint: GET /private/business/{businessid}/v2messagetemplate/{id}
// Response: MessageTemplate (full details)
// ─────────────────────────────────────────────
export const getMessageTemplateById = async (
  businessId: string,
  id: string
): Promise<MessageTemplate> => {
  try {
    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/v2messagetemplate/${id}`,
      { method: 'GET', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to fetch message template');
    }

    const data: MessageTemplate = await response.json();
    console.log('📦 Message template details:', data);

    return data;
  } catch (error: unknown) {
    console.error('❌ Get message template by ID error:', error);
    return handleError(error, 'Failed to fetch message template');
  }
};

// ─────────────────────────────────────────────
// 3️⃣ POST – Create Message Template
// Endpoint: POST /private/business/{businessid}/v2messagetemplates
// Request: CreateMessageTemplateDto
// Response: MessageTemplate (newly created)
// ─────────────────────────────────────────────
export const createMessageTemplate = async (
  businessId: string,
  dto: CreateMessageTemplateDto
): Promise<MessageTemplate> => {
  try {
    console.log('📤 CREATE MESSAGE TEMPLATE REQUEST:');
    console.log('  Business ID:', businessId);
    console.log('  Payload:', JSON.stringify(dto, null, 2));

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/v2messagetemplates`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      }
    );

    console.log('📥 Response Status:', response.status, response.statusText);

    const data = await response.json().catch(() => ({}));
    console.log('📥 Response Data:', data);

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Failed to create message template (${response.status} ${response.statusText})`
      );
    }

    console.log('✅ Message template created successfully:', data.id);
    return data;
  } catch (error: unknown) {
    console.error('❌ CREATE MESSAGE TEMPLATE ERROR:', error);
    return handleError(error, 'Failed to create message template');
  }
};

// ─────────────────────────────────────────────
// 4️⃣ PATCH – Update Message Template
// Endpoint: PATCH /private/business/{businessid}/v2messagetemplate/{id}
// Request: UpdateMessageTemplateDto
// Response: MessageTemplate (updated)
// ─────────────────────────────────────────────
export const updateMessageTemplate = async (
  businessId: string,
  id: string,
  dto: UpdateMessageTemplateDto
): Promise<MessageTemplate> => {
  try {
    console.log('📤 UPDATE MESSAGE TEMPLATE REQUEST:');
    console.log('  Template ID:', id);
    console.log('  Payload:', JSON.stringify(dto, null, 2));

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/v2messagetemplate/${id}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to update message template');
    }

    const data: MessageTemplate = await response.json();
    console.log('✅ Message template updated successfully');

    return data;
  } catch (error: unknown) {
    console.error('❌ Update message template error:', error);
    return handleError(error, 'Failed to update message template');
  }
};

// ─────────────────────────────────────────────
// 5️⃣ DELETE – Delete Message Template
// Endpoint: DELETE /private/business/{businessid}/v2messagetemplate/{id}
// Response: void
// ─────────────────────────────────────────────
export const deleteMessageTemplate = async (
  businessId: string,
  id: string
): Promise<void> => {
  try {
    console.log('🗑️ DELETE MESSAGE TEMPLATE REQUEST:', id);

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/v2messagetemplate/${id}`,
      { method: 'DELETE', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to delete message template');
    }

    console.log('✅ Message template deleted successfully');
  } catch (error: unknown) {
    console.error('❌ Delete message template error:', error);
    return handleError(error, 'Failed to delete message template');
  }
};