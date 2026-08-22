import { BASE_URL, getHeaders } from './apiService';
import {
  TaskDefinition,
  TaskDefinitionListItem,
  CreateTaskDefinitionDto,
  UpdateTaskDefinitionDto,
  TaskDefinitionsListResponse,
} from '../types/taskDefinition.types';

const handleError = (error: unknown, fallbackMessage: string): never => {
  if (error instanceof Error) throw new Error(error.message || fallbackMessage);
  throw new Error(fallbackMessage);
};

// ─────────────────────────────────────────────
// 1️⃣ GET – List TaskDefinitions
// Endpoint: GET /private/business/{businessId}/taskdefinitions
// Response: { items: TaskDefinitionListItem[] }
// ─────────────────────────────────────────────
export const getTaskDefinitions = async (
  businessId: string
): Promise<TaskDefinitionListItem[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/taskdefinitions`,
      { method: 'GET', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to fetch task definitions');
    }

    const data: TaskDefinitionsListResponse = await response.json();
    console.log('📦 Task definitions list:', data);

    return data.items || [];
  } catch (error: unknown) {
    console.error('❌ Get task definitions error:', error);
    return handleError(error, 'Failed to fetch task definitions');
  }
};

// ─────────────────────────────────────────────
// 2️⃣ GET – Get TaskDefinition by ID
// Endpoint: GET /private/business/{businessId}/taskdefinition/{id}
// Response: TaskDefinition (full details)
// ─────────────────────────────────────────────
export const getTaskDefinitionById = async (
  businessId: string,
  id: string
): Promise<TaskDefinition> => {
  try {
    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/taskdefinition/${id}`,
      { method: 'GET', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to fetch task definition');
    }

    const data: TaskDefinition = await response.json();
    console.log('📦 Task definition details:', data);

    return data;
  } catch (error: unknown) {
    console.error('❌ Get task definition by ID error:', error);
    return handleError(error, 'Failed to fetch task definition');
  }
};

// ─────────────────────────────────────────────
// 3️⃣ POST – Create TaskDefinition
// Endpoint: POST /private/business/{businessId}/taskdefinitions
// Request: CreateTaskDefinitionDto
// Response: TaskDefinition (newly created)
// ─────────────────────────────────────────────
export const createTaskDefinition = async (
  businessId: string,
  dto: CreateTaskDefinitionDto
): Promise<TaskDefinition> => {
  try {
    console.log('📤 CREATE TASK DEFINITION REQUEST:');
    console.log('  Business ID:', businessId);
    console.log('  Payload:', JSON.stringify(dto, null, 2));

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/taskdefinitions`,
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
          `Failed to create task definition (${response.status} ${response.statusText})`
      );
    }

    console.log('✅ Task definition created successfully:', data.id);
    return data;
  } catch (error: unknown) {
    console.error('❌ CREATE TASK DEFINITION ERROR:', error);
    return handleError(error, 'Failed to create task definition');
  }
};

// ─────────────────────────────────────────────
// 4️⃣ PATCH – Update TaskDefinition
// Endpoint: PATCH /private/business/{businessId}/taskdefinition/{id}
// Request: UpdateTaskDefinitionDto (all fields optional)
// Response: TaskDefinition (updated)
// ─────────────────────────────────────────────
export const updateTaskDefinition = async (
  businessId: string,
  id: string,
  dto: UpdateTaskDefinitionDto
): Promise<TaskDefinition> => {
  try {
    console.log('📤 UPDATE TASK DEFINITION REQUEST:');
    console.log('  Task Definition ID:', id);
    console.log('  Payload:', JSON.stringify(dto, null, 2));

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/taskdefinition/${id}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to update task definition');
    }

    const data: TaskDefinition = await response.json();
    console.log('✅ Task definition updated successfully');

    return data;
  } catch (error: unknown) {
    console.error('❌ Update task definition error:', error);
    return handleError(error, 'Failed to update task definition');
  }
};

// ─────────────────────────────────────────────
// 5️⃣ DELETE – Delete TaskDefinition
// Endpoint: DELETE /private/business/{businessId}/taskdefinition/{id}
// Response: void
// ─────────────────────────────────────────────
export const deleteTaskDefinition = async (
  businessId: string,
  id: string
): Promise<void> => {
  try {
    console.log('🗑️ DELETE TASK DEFINITION REQUEST:', id);

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/taskdefinition/${id}`,
      { method: 'DELETE', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to delete task definition');
    }

    console.log('✅ Task definition deleted successfully');
  } catch (error: unknown) {
    console.error('❌ Delete task definition error:', error);
    return handleError(error, 'Failed to delete task definition');
  }
};