// ─────────────────────────────────────────────
// NEW API Response Structure (Flat)
// ─────────────────────────────────────────────
export interface StaffMember {
  id: string;
  userId: string;
  userName?: string;
  firstName?: string;       // ✅ add
  lastName?: string;        // ✅ add
  email?: string;
  phone?: string;
  phoneMasked?: string;
  status: "ACTIVE" | "INACTIVE";
  role?: string;
  roles?: string[];         // ✅ add
  businessId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaffDto {
  userName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department?: string;
  roles: string[];
  sendInvite: boolean;
}

export interface StaffDetails {
  id: string;
  userId: string;
  userName?: string;
  status: "ACTIVE" | "INACTIVE";
  roles?: string[];          // ✅ array from API
  role?: string;             // ✅ derived first role (for display)
  avatarUrl?: string | null;
  lastActiveAt?: string | null;
  contact?: {
    email?: string;
    phone?: string;
    phoneMasked?: string;
    firstName?: string;      // ✅ add
    lastName?: string;       // ✅ add
  };
}

export interface ListStaffResponse {
  items: StaffMember[];
  nextCursor?: string | null;
}



/* export interface UpdateStaffDto {
  isActive?: boolean;
  roles?: string[];
  user?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    userName?: string;
  };
} */

  export interface UpdateStaffDto {
  membership?: {
    isActive?: boolean;
    roles?: string[];
  };
  user?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    userName?: string;
  };
}

export interface StaffDashboardClient {
  subject_id: string;
  display_name: string;
  city: string | null;
  next_due_hint: string;
}

export interface StaffDashboardTask {
  task_id: string;
  title: string;
  status: 'OPEN' | 'CLOSED' | string;
  due_date: string;
  subject: {
    id: string;
    name: string;
  };
}

export interface StaffDashboardResponse {
  clients: {
    items: StaffDashboardClient[];
    nextCursor: string | null;
  };
  tasks: {
    items: StaffDashboardTask[];
    nextCursor: string | null;
  };
}

// ✅ Computed summary derived from StaffDashboardResponse
export interface StaffWorkSummary {
  totalClients: number;
  pendingTasks: number;
  overdueTasks: number;
  completedTasks: number;
}

//to create Reminder
// Type:
/* export interface StaffMember {
  id: string;        // this is the userId
  firstName1: string;
  lastName1: string;
  email1: string;
} */