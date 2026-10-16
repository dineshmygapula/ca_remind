// import { BASE_URL, getHeaders } from './apiService';
// import {
//   Business,
//   CreateBusinessDto,
//   UpdateBusinessDto,
// } from '@/types/business';

// // ─────────────────────────────────────────────
// // 🔧 Utility – Centralized Error Handler
// // ─────────────────────────────────────────────

// const handleError = (error: unknown, fallbackMessage: string): never => {
//   if (error instanceof Error) {
//     throw new Error(error.message || fallbackMessage);
//   }
//   throw new Error(fallbackMessage);
// };

// // ─────────────────────────────────────────────
// // 1️⃣ GET – List Businesses
// // Endpoint: GET /private/organizations/{organizationId}/businesses
// // Response: Business[]
// // ─────────────────────────────────────────────

// export const getBusinesses = async (organizationId: string): Promise<Business[]> => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/businesses`,
//       { method: 'GET', headers: getHeaders() }
//     );
//     if (!response.ok) throw new Error('Failed to fetch businesses');
//     return await response.json();
//   } catch (error: unknown) {
//     return handleError(error, 'Failed to fetch businesses');
//   }
// };

// // ─────────────────────────────────────────────
// // 2️⃣ GET – Get Business by ID
// // Endpoint: GET /private/organizations/{organizationId}/business/{id}
// // Response: Business
// // ─────────────────────────────────────────────

// export const getBusinessById = async (
//   organizationId: string,
//   id: string
// ): Promise<Business> => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/business/${id}`,
//       {
//         method: 'GET',
//         headers: getHeaders(),
//       }
//     );
//     if (!response.ok) throw new Error('Failed to fetch business');
//     return await response.json();
//   } catch (error: unknown) {
//     return handleError(error, 'Failed to fetch business');
//   }
// };


// // ─────────────────────────────────────────────
// // 3️⃣ POST – Create Business
// // Endpoint: POST /private/organizations/{organizationId}/businesses
// // Request Body: CreateBusinessDto
// // Response: Business (newly created)
// // ─────────────────────────────────────────────

// export const createBusiness = async (
//   organizationId: string,
//   dto: CreateBusinessDto
// ): Promise<Business> => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/businesses`,
//       {
//         method: 'POST',
//         headers: getHeaders(),
//         body: JSON.stringify({ ...dto, uiConfig: dto.uiConfig || {} }), // fallback to empty object
//       }
//     );
//     if (!response.ok) {
//       const err = await response.json();
//       throw new Error(err.message || 'Failed to create business');
//     }
//     return await response.json();
//   } catch (error: unknown) {
//     return handleError(error, 'Failed to create business');
//   }
// };

// // ─────────────────────────────────────────────
// // 4️⃣ PATCH – Update Business
// // Endpoint: PATCH /private/organizations/{organizationId}/business/{id}
// // Request Body: UpdateBusinessDto (partial fields only)
// // Response: Business (updated)
// // ─────────────────────────────────────────────

// export const updateBusiness = async (
//   organizationId: string,
//   id: string,
//   dto: UpdateBusinessDto
// ): Promise<Business> => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/business/${id}`,
//       {
//         method: 'PATCH',
//         headers: getHeaders(),
//         body: JSON.stringify(dto), // only send fields that need updating
//       }
//     );
//     if (!response.ok) {
//       const err = await response.json();
//       throw new Error(err.message || 'Failed to update business');
//     }
//     return await response.json();
//   } catch (error: unknown) {
//     return handleError(error, 'Failed to update business');
//   }
// };


// // ─────────────────────────────────────────────
// // 5️⃣ DELETE – Delete Business
// // Endpoint: DELETE /private/organizations/{organizationId}/business/{id}
// // Response: void
// // ─────────────────────────────────────────────

// export const deleteBusiness = async (
//   organizationId: string,
//   id: string
// ): Promise<void> => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/business/${id}`,
//       {
//         method: 'DELETE',
//         headers: getHeaders(),
//       }
//     );
//     if (!response.ok) {
//       const err = await response.json();
//       throw new Error(err.message || 'Failed to delete business');
//     }
//     // No return needed — API gives { message } but we treat this as void
//   } catch (error: unknown) {
//     return handleError(error, 'Failed to delete business');
//   }
// };


// services/businessService.ts
import { api } from "@/lib/api";
import { Business, CreateBusinessDto, UpdateBusinessDto } from "@/types/business";

const orgPath = (orgId: string) => `/private/organizations/${orgId}`;

export const getBusinesses = (orgId: string) =>
  api.get<Business[]>(`${orgPath(orgId)}/businesses`).then((r) => r.data);

export const getBusinessById = (orgId: string, id: string) =>
  api.get<Business>(`${orgPath(orgId)}/business/${id}`).then((r) => r.data);

export const createBusiness = (orgId: string, dto: CreateBusinessDto) =>
  api
    .post<Business>(`${orgPath(orgId)}/businesses`, { ...dto, uiConfig: dto.uiConfig ?? {} })
    .then((r) => r.data);

export const updateBusiness = (orgId: string, id: string, dto: UpdateBusinessDto) =>
  api.patch<Business>(`${orgPath(orgId)}/business/${id}`, dto).then((r) => r.data);

export const deleteBusiness = (orgId: string, id: string) =>
  api.delete(`${orgPath(orgId)}/business/${id}`).then(() => undefined);