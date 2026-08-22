import { BASE_URL, getHeaders } from './apiService';
import {
  SubjectListItem,
  Subject,
  CreateSubjectDto,
  UpdateSubjectDto,
  UpcomingDeadlinesResponse,
} from '../types/subject';

const handleError = (error: unknown, fallbackMessage: string): never => {
  if (error instanceof Error) throw new Error(error.message || fallbackMessage);
  throw new Error(fallbackMessage);
};

// ─────────────────────────────────────────────
// 1️⃣ GET – List Subjects (Simplified View)
// Endpoint: GET /private/business/{businessId}/subjects
// Response: SubjectListItem[]
// ─────────────────────────────────────────────
export const getSubjects = async (businessId: string): Promise<SubjectListItem[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/subjects`,
      { method: 'GET', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to fetch subjects');
    }

    const data: SubjectListItem[] = await response.json();

    
console.log('📦 First subject assignedTeam:', data[0]?.assignedTeam); // ← add this
console.log('📦 Subjects list:', data); // this line already exists
    console.log('📦 Subjects list:', data);

    return data || [];
  } catch (error: unknown) {
    console.error('❌ Get subjects error:', error);
    return handleError(error, 'Failed to fetch subjects');
  }
};

// ─────────────────────────────────────────────
// 2️⃣ GET – Get Subject by ID (Full View)
// Endpoint: GET /private/business/{businessId}/subject/{id}
// Response: Subject
// ─────────────────────────────────────────────
export const getSubjectById = async (
  businessId: string,
  id: string
): Promise<Subject> => {
  try {
    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/subject/${id}`,
      { method: 'GET', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to fetch subject');
    }

    const data: Subject = await response.json();
    console.log('📦 Subject details:', data);

    return data;
  } catch (error: unknown) {
    console.error('❌ Get subject by ID error:', error);
    return handleError(error, 'Failed to fetch subject');
  }
};

// ─────────────────────────────────────────────
// 3️⃣ POST – Create Subject
// Endpoint: POST /private/business/{businessId}/subjects
// Request: CreateSubjectDto
// Response: Subject
// ─────────────────────────────────────────────
export const createSubject = async (
  businessId: string,
  dto: CreateSubjectDto
): Promise<Subject> => {
  try {
    console.log('📤 CREATE SUBJECT REQUEST:');
    console.log('  Business ID:', businessId);
    console.log('  Payload:', JSON.stringify(dto, null, 2));

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/subjects`,
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
          `Failed to create subject (${response.status} ${response.statusText})`
      );
    }

    console.log('✅ Subject created successfully:', data.id);
    return data;
  } catch (error: unknown) {
    console.error('❌ CREATE SUBJECT ERROR:', error);
    return handleError(error, 'Failed to create subject');
  }
};

// ─────────────────────────────────────────────
// 4️⃣ PATCH – Update Subject
// Endpoint: PATCH /private/business/{businessId}/subject/{id}
// Request: UpdateSubjectDto
// Response: Subject
// ─────────────────────────────────────────────
export const updateSubject = async (
  businessId: string,
  id: string,
  dto: UpdateSubjectDto
): Promise<Subject> => {
  try {
    console.log('📤 UPDATE SUBJECT REQUEST:');
    console.log('  Subject ID:', id);
    console.log('  Payload:', JSON.stringify(dto, null, 2));

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/subject/${id}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to update subject');
    }

    const data: Subject = await response.json();
    console.log('✅ Subject updated successfully');

    return data;
  } catch (error: unknown) {
    console.error('❌ Update subject error:', error);
    return handleError(error, 'Failed to update subject');
  }
};

// ─────────────────────────────────────────────
// 5️⃣ DELETE – Delete Subject
// Endpoint: DELETE /private/business/{businessId}/subject/{id}
// Response: void
// ─────────────────────────────────────────────
export const deleteSubject = async (
  businessId: string,
  id: string
): Promise<void> => {
  try {
    console.log('🗑️ DELETE SUBJECT REQUEST:', id);

    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/subject/${id}`,
      { method: 'DELETE', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to delete subject');
    }

    console.log('✅ Subject deleted successfully');
  } catch (error: unknown) {
    console.error('❌ Delete subject error:', error);
    return handleError(error, 'Failed to delete subject');
  }
};

// ─────────────────────────────────────────────
// 6️⃣ GET – Get Upcoming Deadlines for Subject
// Endpoint: GET /private/business/{businessId}/subject/{id}/upcoming-deadlines
// Response: UpcomingDeadlinesResponse
// ─────────────────────────────────────────────
export const getSubjectUpcomingDeadlines = async (
  businessId: string,
  subjectId: string
): Promise<UpcomingDeadlinesResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/private/business/${businessId}/subject/${subjectId}/upcoming-deadlines`,
      { method: 'GET', headers: getHeaders() }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Failed to fetch upcoming deadlines');
    }

    const data: UpcomingDeadlinesResponse = await response.json();
    console.log('📦 Upcoming deadlines:', data);

    return data;
  } catch (error: unknown) {
    console.error('❌ Get upcoming deadlines error:', error);
    return handleError(error, 'Failed to fetch upcoming deadlines');
  }
};