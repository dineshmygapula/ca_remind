// services/taskDefinitionService.ts
import { api } from '@/lib/api';
import {
  TaskDefinition,
  TaskDefinitionListItem,
  CreateTaskDefinitionDto,
  UpdateTaskDefinitionDto,
  TaskDefinitionsListResponse,
} from '../types/taskDefinition.types';

const bizPath = (businessId: string) => `/private/business/${businessId}`;

// GET /private/business/{businessId}/taskdefinitions → { items: [...] }
export const getTaskDefinitions = (businessId: string): Promise<TaskDefinitionListItem[]> =>
  api
    .get<TaskDefinitionsListResponse>(`${bizPath(businessId)}/taskdefinitions`)
    .then((r) => r.data.items ?? []);

// GET /private/business/{businessId}/taskdefinition/{id}
export const getTaskDefinitionById = (businessId: string, id: string): Promise<TaskDefinition> =>
  api
    .get<TaskDefinition>(`${bizPath(businessId)}/taskdefinition/${id}`)
    .then((r) => r.data);

// POST /private/business/{businessId}/taskdefinitions
export const createTaskDefinition = (
  businessId: string,
  dto: CreateTaskDefinitionDto
): Promise<TaskDefinition> =>
  api
    .post<TaskDefinition>(`${bizPath(businessId)}/taskdefinitions`, dto)
    .then((r) => r.data);

// PATCH /private/business/{businessId}/taskdefinition/{id}
export const updateTaskDefinition = (
  businessId: string,
  id: string,
  dto: UpdateTaskDefinitionDto
): Promise<TaskDefinition> =>
  api
    .patch<TaskDefinition>(`${bizPath(businessId)}/taskdefinition/${id}`, dto)
    .then((r) => r.data);

// DELETE /private/business/{businessId}/taskdefinition/{id}
export const deleteTaskDefinition = (businessId: string, id: string): Promise<void> =>
  api
    .delete(`${bizPath(businessId)}/taskdefinition/${id}`)
    .then(() => undefined);