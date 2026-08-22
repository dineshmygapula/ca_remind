import { BASE_URL, getHeaders } from './apiService';
import {
  StaffMember,
  StaffDetails,
  CreateStaffDto,
  UpdateStaffDto,
  StaffDashboardResponse,
} from '@/types/staff.types';

// ─────────────────────────────────────────────
// 1️⃣ GET – List Staff
// ─────────────────────────────────────────────
// Get all staff
/* export const getStaff = async (businessId: string): Promise<StaffMember[]> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/staff`,
    { method: 'GET', headers: getHeaders() }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.message || 'Failed to fetch staff');
  }

  const data = await response.json();
  console.log('📦 Staff API Response:', data);

  // ✅ Return items array directly (flat structure)
  return Array.isArray(data.items) ? data.items : [];
}; */
/* export const getStaff = async (businessId: string): Promise<StaffMember[]> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/staff`,
    { method: 'GET', headers: getHeaders() }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.message || 'Failed to fetch staff');
  }

  const data = await response.json();
  console.log("📦 Staff API Response:", data);

  // ✅ Normalize here
  return Array.isArray(data.items)
    ? data.items.map((item: any): StaffMember => ({
        ...item,

        // 🔥 normalize roles → role
        role: item.roles?.[0] ?? "",

        // optional safety
        roles: item.roles ?? [],
      }))
    : [];
}; */



export const getStaff = async (businessId: string): Promise<StaffMember[]> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/staff`,
    { method: 'GET', headers: getHeaders() }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.message || 'Failed to fetch staff');
  }

  const data = await response.json();
  console.log("📦 Staff API Response:", data);

  return Array.isArray(data.items)
    ? data.items.map((item: any): StaffMember => ({
        ...item,
        role: item.roles?.[0] ?? "",
        roles: item.roles ?? [],
        // ✅ Explicitly map firstName & lastName
        // If API returns flat fields, `...item` covers it.
        // If API nests them under `user`, unwrap here:
        firstName: item.firstName ?? item.user?.firstName ?? "",
        lastName: item.lastName ?? item.user?.lastName ?? "",
      }))
    : [];
};
// ─────────────────────────────────────────────
// 2️⃣ GET – Get Staff by ID
// ─────────────────────────────────────────────
export const getStaffById = async (
  businessId: string,
  membershipId: string
): Promise<StaffDetails> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/staff/${membershipId}`,
    { method: "GET", headers: getHeaders() }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.message || "Failed to fetch staff member");
  }

  const data = await response.json();
  console.log("📦 Raw staff details response:", data);

  // ✅ Map nested API shape → StaffDetails
  const membership = data.membership;
  const user = data.user;

  return {
    id: membership.id,
    userId: membership.userId,
    userName:
      (user.userName ??
  `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()) ||
  "Unknown",
    status: membership.isActive ? "ACTIVE" : "INACTIVE",
    role: membership.roles?.[0] ?? "No Role",
    avatarUrl: user.avatarUrl ?? null,
    lastActiveAt: data.updatedAt ?? null,
    contact: {
      email: user.email,
      phone: user.phone,
      phoneMasked: user.phone
        ? `+${user.phone.slice(0, 2)} XXXXX ${user.phone.slice(-5)}`
        : undefined,
    },
  };
};

// ─────────────────────────────────────────────
// 3️⃣ POST – Create Staff
// ─────────────────────────────────────────────
export const createStaff = async (
  businessId: string,
  dto: CreateStaffDto
): Promise<StaffMember> => {
  console.log('📤 Creating staff with payload:', JSON.stringify(dto, null, 2));

  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/staff`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    }
  );

  const data = await response.json();
  console.log('📥 Create staff response:', data);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to create staff member');
  }

  return data;
};

// ─────────────────────────────────────────────
// 4️⃣ PATCH – Update Staff
// ─────────────────────────────────────────────
export const updateStaff = async (
  businessId: string,
  membershipId: string,
  dto: UpdateStaffDto
): Promise<UpdateStaffDto> => {
  console.log('📤 Updating staff with payload:', JSON.stringify(dto, null, 2));

  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/staff/${membershipId}`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    }
  );

  const data = await response.json();
  console.log('📥 Update staff response:', data);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to update staff member');
  }

  return data;
};

// ─────────────────────────────────────────────
// 5️⃣ DELETE – Remove Staff
// ─────────────────────────────────────────────
export const deleteStaff = async (
  businessId: string,
  membershipId: string
): Promise<void> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/staff/${membershipId}`,
    { method: 'DELETE', headers: getHeaders() }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.message || 'Failed to remove staff member');
  }
};

// ─────────────────────────────────────────────
// 6️⃣ GET – Staff Dashboard
// ─────────────────────────────────────────────
export const getStaffDashboard = async (
  businessId: string,
  membershipId: string
): Promise<StaffDashboardResponse> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/staff/${membershipId}/staffDashboard`,
    { method: 'GET', headers: getHeaders() }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.message || 'Failed to fetch staff dashboard');
  }

  return response.json();
};

//Tocreate reminder
export const getStaffList = async (
  businessId: string
): Promise<StaffMember[]> => {
  const response = await fetch(
    `${BASE_URL}/private/business/${businessId}/staff`,
    { method: 'GET', headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch staff');
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
};
