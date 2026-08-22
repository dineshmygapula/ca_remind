// ─────────────────────────────────────────────
// Core Subscription Data (nested in User)
// ─────────────────────────────────────────────
export interface RazorpaySubscriptionData {
  subscriptionId: string;
  subscriptionStatus: string;
  subscriptionType: string;
  nextBillingDate: string;
  planName: string;
  paymentStatus: string;
  fcmToken: string;
}

// ─────────────────────────────────────────────
// 1️⃣ Core User Entity
// Used in: GET /private/user (single)
// ─────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  phone?: string;
  roles?: string;
  loginTimes?: Record<string, unknown>;
  account?: Record<string, unknown>;
  idpProfile?: Record<string, unknown>;
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
  razorpaySubscriptionData?: RazorpaySubscriptionData;
}

export type UserProfile = User;

// ─────────────────────────────────────────────
// 2️⃣ GET – List Users
// Endpoint: GET /private/users
// ─────────────────────────────────────────────
export type ListUsersResponse = User[];

// ─────────────────────────────────────────────
// 3️⃣ POST – Create User
// Endpoint: POST /private/users
// ─────────────────────────────────────────────
export interface CreateUserDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  roles?: string;
  loginTimes?: Record<string, unknown>;
  account?: Record<string, unknown>;
  idpProfile?: Record<string, unknown>;
  fcmToken?: string;
}

// ─────────────────────────────────────────────
// 4️⃣ PATCH – Update User (all fields optional)
// Endpoint: PATCH /private/user
// ─────────────────────────────────────────────
/* export interface User {
  userId: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profilePictureUrl?: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}
 */
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// ─────────────────────────────────────────────
// 5️⃣ DELETE – Delete User
// Endpoint: DELETE /private/user
// ─────────────────────────────────────────────
export interface DeleteUserResponse {
  message: string;
}