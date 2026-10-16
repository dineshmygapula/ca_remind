// services/staffService.ts
import { api } from '@/lib/api';
import {
  StaffMember,
  StaffDetails,
  CreateStaffDto,
  UpdateStaffDto,
  StaffDashboardResponse,
} from '@/types/staff.types';

const bizPath = (businessId: string) => `/private/business/${businessId}`;

// GET /private/business/{businessId}/staff → { items: [...] }
// Maps firstName/lastName from nested user object if present, and normalises roles → role.
export const getStaff = (businessId: string): Promise<StaffMember[]> =>
  api
    .get<{ items?: any[] }>(`${bizPath(businessId)}/staff`)
    .then((r) =>
      (r.data?.items ?? []).map((item: any): StaffMember => ({
        ...item,
        role:      item.roles?.[0] ?? '',
        roles:     item.roles ?? [],
        firstName: item.firstName ?? item.user?.firstName ?? '',
        lastName:  item.lastName  ?? item.user?.lastName  ?? '',
      }))
    );

// Alias used when creating reminders — same endpoint, no mapping needed.
export const getStaffList = (businessId: string): Promise<StaffMember[]> =>
  api
    .get<{ items?: StaffMember[] }>(`${bizPath(businessId)}/staff`)
    .then((r) => r.data?.items ?? []);

// GET /private/business/{businessId}/staff/{membershipId}
// Maps nested { membership, user } shape → StaffDetails.
export const getStaffById = (businessId: string, membershipId: string): Promise<StaffDetails> =>
  api
    .get<{ membership: any; user: any; updatedAt?: string }>(
      `${bizPath(businessId)}/staff/${membershipId}`
    )
    .then(({ data }) => {
      const { membership, user } = data;
      return {
        id:          membership.id,
        userId:      membership.userId,
     userName:
  user.userName ??
  (`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
    'Unknown'),

        status:      membership.isActive ? 'ACTIVE' : 'INACTIVE',
        role:        membership.roles?.[0] ?? 'No Role',
        avatarUrl:   user.avatarUrl ?? null,
        lastActiveAt: data.updatedAt ?? null,
        contact: {
          email:       user.email,
          phone:       user.phone,
          phoneMasked: user.phone
            ? `+${user.phone.slice(0, 2)} XXXXX ${user.phone.slice(-5)}`
            : undefined,
        },
      } satisfies StaffDetails;
    });

// POST /private/business/{businessId}/staff
export const createStaff = (businessId: string, dto: CreateStaffDto): Promise<StaffMember> =>
  api
    .post<StaffMember>(`${bizPath(businessId)}/staff`, dto)
    .then((r) => r.data);

// PATCH /private/business/{businessId}/staff/{membershipId}
export const updateStaff = (
  businessId: string,
  membershipId: string,
  dto: UpdateStaffDto
): Promise<UpdateStaffDto> =>
  api
    .patch<UpdateStaffDto>(`${bizPath(businessId)}/staff/${membershipId}`, dto)
    .then((r) => r.data);

// DELETE /private/business/{businessId}/staff/{membershipId}
export const deleteStaff = (businessId: string, membershipId: string): Promise<void> =>
  api
    .delete(`${bizPath(businessId)}/staff/${membershipId}`)
    .then(() => undefined);

// GET /private/business/{businessId}/staff/{membershipId}/staffDashboard
export const getStaffDashboard = (
  businessId: string,
  membershipId: string
): Promise<StaffDashboardResponse> =>
  api
    .get<StaffDashboardResponse>(`${bizPath(businessId)}/staff/${membershipId}/staffDashboard`)
    .then((r) => r.data);
