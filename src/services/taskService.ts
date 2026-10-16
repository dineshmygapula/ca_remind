// services/taskService.ts
import { api } from "@/lib/api";
import {
  TaskResponse,
  TaskListItem,
  CreateTaskDto,
  UpdateTaskDto,
  TasksListResponse,
  TaskInstance,
} from "../types/task.types";

const businessPath = (businessId: string) => `/private/business/${businessId}`;

// GET /private/business/{businessId}/tasks  ->  { items: [...] }
export const getTasks = (businessId: string) =>
  api
    .get<TasksListResponse>(`${businessPath(businessId)}/tasks`)
    .then((r) => r.data.items ?? []);

// GET /private/business/{businessId}/task/{id}
export const getTaskById = (businessId: string, id: string) =>
  api.get<TaskResponse>(`${businessPath(businessId)}/task/${id}`).then((r) => r.data);

// POST /private/business/{businessId}/tasks
export const createTask = (businessId: string, dto: CreateTaskDto) =>
  api.post<TaskResponse>(`${businessPath(businessId)}/tasks`, dto).then((r) => r.data);

// PATCH /private/business/{businessId}/task/{id}
export const updateTask = (businessId: string, id: string, dto: UpdateTaskDto) =>
  api.patch<TaskResponse>(`${businessPath(businessId)}/task/${id}`, dto).then((r) => r.data);

// DELETE /private/business/{businessId}/task/{id}
export const deleteTask = (businessId: string, id: string) =>
  api.delete(`${businessPath(businessId)}/task/${id}`).then(() => undefined);

// Same endpoint as getTasks, typed as TaskInstance (used when creating reminders)
export const getTaskInstances = (businessId: string) =>
  api
    .get<{ items?: TaskInstance[] }>(`${businessPath(businessId)}/tasks`)
    .then((r) => (Array.isArray(r.data.items) ? r.data.items : []));