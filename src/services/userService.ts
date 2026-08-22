import { BASE_URL, getHeaders } from './apiService';
import { User, CreateUserDto, UpdateUserDto } from '../types/user';

// ─────────────────────────────────────────────
// 🔧 Utility – Centralized Error Handler
// ─────────────────────────────────────────────
const handleError = (error: unknown, fallbackMessage: string): never => {
  if (error instanceof Error) throw new Error(error.message || fallbackMessage);
  throw new Error(fallbackMessage);
};

// ─────────────────────────────────────────────
// 1️⃣ GET – Get Current User
// Endpoint: GET /private/user
// Response: User
// ─────────────────────────────────────────────
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/private/user`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return await response.json();
  } catch (error: unknown) {
    return handleError(error, 'Failed to fetch user');
  }
};

// ─────────────────────────────────────────────
// 2️⃣ GET – List Users
// Endpoint: GET /private/users
// Response: User[]
// ─────────────────────────────────────────────
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${BASE_URL}/private/users`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error: unknown) {
    return handleError(error, 'Failed to fetch users');
  }
};

// ─────────────────────────────────────────────
// 3️⃣ POST – Create User
// Endpoint: POST /private/users
// Request Body: CreateUserDto
// Response: User (newly created)
// ─────────────────────────────────────────────
export const createUser = async (dto: CreateUserDto): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/private/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to create user');
    }
    return await response.json();
  } catch (error: unknown) {
    return handleError(error, 'Failed to create user');
  }
};

// ─────────────────────────────────────────────
// 4️⃣ PATCH – Update Current User
// Endpoint: PATCH /private/user
// Request Body: UpdateUserDto (partial fields only)
// Response: User (updated)
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// PATCH – Update User Profile
// Endpoint: PATCH /private/user/me
// Request: UpdateUserDto
// Response: User (updated)
// ─────────────────────────────────────────────
/* export const updateUser = async (dto: UpdateUserDto): Promise<User> => {
  try {
    console.log('📤 UPDATE USER REQUEST:');
    console.log('  Payload:', JSON.stringify(dto, null, 2));

    const response = await fetch(`${BASE_URL}/private/user/me`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });

    console.log('📥 Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update user profile');
    }

    const data = await response.json();
    console.log('✅ User profile updated successfully');

    return data;
  } catch (error: unknown) {
    console.error('❌ Update user error:', error);
    return handleError(error, 'Failed to update user profile');
  }
}; */


export const updateUser = async (dto: UpdateUserDto): Promise<User> => {
  try {
    console.log("📤 Payload:", dto);

    const response = await fetch(`${BASE_URL}/private/user/me`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });

    console.log("📥 Response Status:", response.status);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update user");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Update error:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 5️⃣ DELETE – Delete Current User
// Endpoint: DELETE /private/user
// Response: void
// ─────────────────────────────────────────────
export const deleteUser = async (): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/private/user`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to delete user');
    }
    // No return needed — API gives { message } but we treat as void
  } catch (error: unknown) {
    return handleError(error, 'Failed to delete user');
  }
};