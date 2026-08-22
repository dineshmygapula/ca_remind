import { BASE_URL, getHeaders } from './apiService';
import {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../types/organizations';

const handleError = (error: unknown, fallbackMessage: string): never => {
  if (error instanceof Error) throw new Error(error.message || fallbackMessage);
  throw new Error(fallbackMessage);
};

export const getOrganizations = async (): Promise<Organization[]> => {
  try {
    console.log(getHeaders(), "getHeaders()=====================")

    const response = await fetch(`${BASE_URL}/private/organizations`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch organizations');
    return await response.json();
  } catch (error: unknown) {
    console.error('Fetch error details:', error);  // Reveals TypeError: fetch failed + cause
    console.error('BASE_URL:', BASE_URL);          // Shows http://localhost:3001?
    console.error('Headers:', getHeaders());       // Check auth token
    return handleError(error, 'Failed to fetch organizations');
  }
};


export const getOrganizationById = async (id: string): Promise<Organization> => {
  try {
    const response = await fetch(`${BASE_URL}/private/organization/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch organization');
    return await response.json();
  } catch (error: unknown) {
    return handleError(error, 'Failed to fetch organization');
  }
};

export const createOrganization = async (dto: CreateOrganizationDto): Promise<Organization> => {
  try {
    const response = await fetch(`${BASE_URL}/private/organizations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...dto, billingMeta: dto.billingMeta || {} }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to create organization');
    }
    return await response.json();
  } catch (error: unknown) {
    return handleError(error, 'Failed to create organization');
  }
};

export const updateOrganization = async (id: string, dto: UpdateOrganizationDto): Promise<Organization> => {
  try {
    const response = await fetch(`${BASE_URL}/private/organization/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to update organization');
    }
    return await response.json();
  } catch (error: unknown) {
    return handleError(error, 'Failed to update organization');
  }
};

export const deleteOrganization = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/private/organization/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to delete organization');
    }
  } catch (error: unknown) {
    return handleError(error, 'Failed to delete organization');
  }
};