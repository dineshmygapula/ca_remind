// services/subjectService.ts
import { api } from '@/lib/api';
import {
  SubjectListItem,
  Subject,
  CreateSubjectDto,
  UpdateSubjectDto,
  UpcomingDeadlinesResponse,
} from '../types/subject';

const bizPath = (businessId: string) => `/private/business/${businessId}`;

// GET /private/business/{businessId}/subjects
export const getSubjects = (businessId: string): Promise<SubjectListItem[]> =>
  api
    .get<SubjectListItem[]>(`${bizPath(businessId)}/subjects`)
    .then((r) => r.data ?? []);

// GET /private/business/{businessId}/subject/{id}
export const getSubjectById = (businessId: string, id: string): Promise<Subject> =>
  api
    .get<Subject>(`${bizPath(businessId)}/subject/${id}`)
    .then((r) => r.data);

// POST /private/business/{businessId}/subjects
export const createSubject = (businessId: string, dto: CreateSubjectDto): Promise<Subject> =>
  api
    .post<Subject>(`${bizPath(businessId)}/subjects`, dto)
    .then((r) => r.data);

// PATCH /private/business/{businessId}/subject/{id}
export const updateSubject = (
  businessId: string,
  id: string,
  dto: UpdateSubjectDto
): Promise<Subject> =>
  api
    .patch<Subject>(`${bizPath(businessId)}/subject/${id}`, dto)
    .then((r) => r.data);

// DELETE /private/business/{businessId}/subject/{id}
export const deleteSubject = (businessId: string, id: string): Promise<void> =>
  api
    .delete(`${bizPath(businessId)}/subject/${id}`)
    .then(() => undefined);

// GET /private/business/{businessId}/subject/{subjectId}/upcoming-deadlines
export const getSubjectUpcomingDeadlines = (
  businessId: string,
  subjectId: string
): Promise<UpcomingDeadlinesResponse> =>
  api
    .get<UpcomingDeadlinesResponse>(
      `${bizPath(businessId)}/subject/${subjectId}/upcoming-deadlines`
    )
    .then((r) => r.data);