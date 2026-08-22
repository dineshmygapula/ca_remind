import { BASE_URL, getHeaders } from './apiService';
import {
  TaskResponse,
  TaskListItem,
  CreateTaskDto,
  UpdateTaskDto,
  TasksListResponse,
  TaskInstance
} from '../types/task.types';

const handleError = (error: unknown, fallbackMessage: string): never => {
  if (error instanceof Error) throw new Error(error.message || fallbackMessage);
  throw new Error(fallbackMessage);
};

// ─────────────────────────────────────────────
// 1️⃣ GET – List Tasks
// Endpoint: GET /private/business/{businessId}/tasks
// Response: { items: TaskListItem[] }
// ─────────────────────────────────────────────
export const getTasks = async (businessId: string, subjectId?: string ): Promise<TaskListItem[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/tasks`,
      { method: 'GET', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to fetch tasks');
    }

    const data: TasksListResponse = await response.json();
    console.log('📦 Tasks list:', data);

    return data.items || [];
  } catch (error: unknown) {
    console.error('❌ Get tasks error:', error);
    return handleError(error, 'Failed to fetch tasks');
  }
};

// ─────────────────────────────────────────────
// 2️⃣ GET – Get Task by ID
// Endpoint: GET /private/business/{businessId}/task/{id}
// Response: Task (full details)
// ─────────────────────────────────────────────
export const getTaskById = async (
  businessId: string,
  id: string
): Promise<TaskResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/task/${id}`,
      { method: 'GET', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to fetch task');
    }

    const data: TaskResponse = await response.json();
    console.log('📦 Task details:', data);

    return data;
  } catch (error: unknown) {
    console.error('❌ Get task by ID error:', error);
    return handleError(error, 'Failed to fetch task');
  }
};

// ─────────────────────────────────────────────
// 3️⃣ POST – Create Task
// Endpoint: POST /private/business/{businessId}/tasks
// Request: CreateTaskDto
// Response: Task (newly created)
// ─────────────────────────────────────────────
export const createTask = async (
  businessId: string,
  dto: CreateTaskDto
): Promise<TaskResponse> => {
  try {
    console.log('📤 CREATE TASK REQUEST:');
    console.log('  Business ID:', businessId);
    console.log('  Payload:', JSON.stringify(dto, null, 2));

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/tasks`,
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
        data?.message || `Failed to create task (${response.status} ${response.statusText})`
      );
    }

    console.log('✅ Task created successfully:', data.id);
    return data;
  } catch (error: unknown) {
    console.error('❌ CREATE TASK ERROR:', error);
    return handleError(error, 'Failed to create task');
  }
};

// ─────────────────────────────────────────────
// 4️⃣ PATCH – Update Task
// Endpoint: PATCH /private/business/{businessId}/task/{id}
// Request: UpdateTaskDto (all fields optional)
// Response: Task (updated)
// ─────────────────────────────────────────────
export const updateTask = async (
  businessId: string,
  id: string,
  dto: UpdateTaskDto
): Promise<TaskResponse> => {
  try {
    console.log('📤 UPDATE TASK REQUEST:');
    console.log('  Task ID:', id);
    console.log('  Payload:', JSON.stringify(dto, null, 2));

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/task/${id}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to update task');
    }

    const data: TaskResponse = await response.json();
    console.log('✅ Task updated successfully');

    return data;
  } catch (error: unknown) {
    console.error('❌ Update task error:', error);
    return handleError(error, 'Failed to update task');
  }
};

// ─────────────────────────────────────────────
// 5️⃣ DELETE – Delete Task
// Endpoint: DELETE /private/business/{businessId}/task/{id}
// Response: void
// ─────────────────────────────────────────────
export const deleteTask = async (
  businessId: string,
  id: string
): Promise<void> => {
  try {
    console.log('🗑️ DELETE TASK REQUEST:', id);

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/task/${id}`,
      { method: 'DELETE', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to delete task');
    }

    console.log('✅ Task deleted successfully');
  } catch (error: unknown) {
    console.error('❌ Delete task error:', error);
    return handleError(error, 'Failed to delete task');
  }
};

//To Cretate Reminder
export const getTaskInstances = async (
  businessId: string
): Promise<TaskInstance[]> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/tasks`,
    { method: 'GET', headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch tasks');
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
};