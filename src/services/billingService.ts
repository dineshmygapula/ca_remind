// import { BASE_URL, getHeaders } from './apiService';
// import {
//   Subscription,
//   Checkout,           // ← add this
//   StartSubscriptionDto,
//   CancelSubscriptionDto,
//   ReactivateSubscriptionResponse,
//   ConfirmPaymentDto,
//   AvailablePlans,
//   PaymentsList,
//   RefundPaymentDto,
// } from '../types/billing';

// const handleError = (error: unknown, fallbackMessage: string): never => {
//   if (error instanceof Error) throw new Error(error.message || fallbackMessage);
//   throw new Error(fallbackMessage);
// };

// // ─────────────────────────────────────────────
// // 1️⃣ GET – Get Subscription
// // Endpoint: GET /private/organizations/{organizationId}/subscription
// // Response: Subscription
// // ─────────────────────────────────────────────
// export const getSubscription = async (organizationId: string): Promise<Subscription> => {
//   try {
//     console.log('📤 Fetching subscription for organization:', organizationId);

//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/subscription`,
//       { method: 'GET', headers: getHeaders() }
//     );

//     if (!response.ok) {
//       const data = await response.json().catch(() => ({}));
//       throw new Error(data?.message || 'Failed to fetch subscription');
//     }

//     const data: Subscription = await response.json();
//     console.log('📦 Subscription data:', data);

//     return data;
//   } catch (error: unknown) {
//     console.error('❌ Get subscription error:', error);
//     return handleError(error, 'Failed to fetch subscription');
//   }
// };

// // ─────────────────────────────────────────────
// // 2️⃣ POST – Start Subscription
// // Endpoint: POST /private/organizations/{organizationId}/subscription
// // Request: StartSubscriptionDto
// // Response: Subscription
// // ─────────────────────────────────────────────
// export const startSubscription = async (
//   organizationId: string,
//   dto: StartSubscriptionDto
// ): Promise<Checkout> => {
//   try {
//     console.log('📤 START SUBSCRIPTION REQUEST:');
//     console.log('  Organization ID:', organizationId);
//     console.log('  Payload:', JSON.stringify(dto, null, 2));

//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/subscription`,
//       {
//         method: 'POST',
//         headers: getHeaders(),
//         body: JSON.stringify(dto),
//       }
//     );

//     console.log('📥 Response Status:', response.status, response.statusText);

//     const data = await response.json().catch(() => ({}));
//     console.log('📥 Response Data:', data);

//     if (!response.ok) {
//       throw new Error(
//         data?.message ||
//           `Failed to start subscription (${response.status} ${response.statusText})`
//       );
//     }

//     console.log('✅ Subscription started successfully');
//     return data;
//   } catch (error: unknown) {
//     console.error('❌ START SUBSCRIPTION ERROR:', error);
//     return handleError(error, 'Failed to start subscription');
//   }
// };

// // ─────────────────────────────────────────────
// // 3️⃣ GET – Get Available Plans
// // Endpoint: GET /private/organizations/{organizationId}/plans
// // Response: AvailablePlans
// // ─────────────────────────────────────────────
// export const getAvailablePlans = async (organizationId: string): Promise<AvailablePlans> => {
//   try {
//     console.log('📤 Fetching available plans for organization:', organizationId);

//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/plans`,
//       { method: 'GET', headers: getHeaders() }
//     );

//     if (!response.ok) {
//       const data = await response.json().catch(() => ({}));
//       throw new Error(data?.message || 'Failed to fetch plans');
//     }

//     const data: AvailablePlans = await response.json();
//     console.log('📦 Available plans:', data);

//     return data;
//   } catch (error: unknown) {
//     console.error('❌ Get available plans error:', error);
//     return handleError(error, 'Failed to fetch available plans');
//   }
// };

// // ─────────────────────────────────────────────
// // 4️⃣ POST – Cancel Subscription
// // Endpoint: POST /private/organizations/{organizationId}/subscription/cancel
// // Request: CancelSubscriptionDto
// // Response: void
// // ─────────────────────────────────────────────
// export const cancelSubscription = async (
//   organizationId: string,
//   dto: CancelSubscriptionDto
// ): Promise<void> => {
//   try {
//     console.log('📤 CANCEL SUBSCRIPTION REQUEST:');
//     console.log('  Organization ID:', organizationId);
//     console.log('  Payload:', JSON.stringify(dto, null, 2));

//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/subscription/cancel`,
//       {
//         method: 'POST',
//         headers: getHeaders(),
//         body: JSON.stringify(dto),
//       }
//     );

//     if (!response.ok) {
//       const data = await response.json().catch(() => ({}));
//       throw new Error(data?.message || 'Failed to cancel subscription');
//     }

//     console.log('✅ Subscription canceled successfully');
//   } catch (error: unknown) {
//     console.error('❌ Cancel subscription error:', error);
//     return handleError(error, 'Failed to cancel subscription');
//   }
// };

// // ─────────────────────────────────────────────
// // 5️⃣ POST – Reactivate Subscription
// // Endpoint: POST /private/organizations/{organizationId}/subscription/reactivate
// // Response: ReactivateSubscriptionResponse
// // ─────────────────────────────────────────────
// export const reactivateSubscription = async (
//   organizationId: string
// ): Promise<ReactivateSubscriptionResponse> => {
//   try {
//     console.log('📤 REACTIVATE SUBSCRIPTION REQUEST:', organizationId);

//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/subscription/reactivate`,
//       {
//         method: 'POST',
//         headers: getHeaders(),
//       }
//     );

//     if (!response.ok) {
//       const data = await response.json().catch(() => ({}));
//       throw new Error(data?.message || 'Failed to reactivate subscription');
//     }

//     const data: ReactivateSubscriptionResponse = await response.json();
//     console.log('✅ Subscription reactivated successfully:', data);

//     return data;
//   } catch (error: unknown) {
//     console.error('❌ Reactivate subscription error:', error);
//     return handleError(error, 'Failed to reactivate subscription');
//   }
// };

// // ─────────────────────────────────────────────
// // 6️⃣ POST – Confirm Payment
// // Endpoint: POST /private/organizations/{organizationId}/subscription/confirm-payment
// // Request: ConfirmPaymentDto
// // Response: void or success message
// // ─────────────────────────────────────────────
// export const confirmPayment = async (
//   organizationId: string,
//   dto: ConfirmPaymentDto
// ): Promise<void> => {
//   try {
//     console.log('📤 CONFIRM PAYMENT REQUEST:');
//     console.log('  Organization ID:', organizationId);
//     console.log('  Payload:', JSON.stringify(dto, null, 2));

//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/subscription/confirm-payment`,
//       {
//         method: 'POST',
//         headers: getHeaders(),
//         body: JSON.stringify(dto),
//       }
//     );

//     if (!response.ok) {
//       const data = await response.json().catch(() => ({}));
//       throw new Error(data?.message || 'Failed to confirm payment');
//     }

//     console.log('✅ Payment confirmed successfully');
//   } catch (error: unknown) {
//     console.error('❌ Confirm payment error:', error);
//     return handleError(error, 'Failed to confirm payment');
//   }
// };

// // ─────────────────────────────────────────────
// // 7️⃣ GET – List Payments
// // Endpoint: GET /private/organizations/{organizationId}/payments
// // Response: PaymentsList
// // ─────────────────────────────────────────────
// export const getPayments = async (organizationId: string): Promise<PaymentsList> => {
//   try {
//     console.log('📤 Fetching payments for organization:', organizationId);

//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/payments`,
//       { method: 'GET', headers: getHeaders() }
//     );

//     if (!response.ok) {
//       const data = await response.json().catch(() => ({}));
//       throw new Error(data?.message || 'Failed to fetch payments');
//     }

//     const data: PaymentsList = await response.json();
//     console.log('📦 Payments list:', data);

//     return data;
//   } catch (error: unknown) {
//     console.error('❌ Get payments error:', error);
//     return handleError(error, 'Failed to fetch payments');
//   }
// };

// // ─────────────────────────────────────────────
// // 8️⃣ POST – Refund Payment
// // Endpoint: POST /private/organizations/{organizationId}/payments/refund
// // Request: RefundPaymentDto
// // Response: void
// // ─────────────────────────────────────────────
// export const refundPayment = async (
//   organizationId: string,
//   dto: RefundPaymentDto
// ): Promise<void> => {
//   try {
//     console.log('📤 REFUND PAYMENT REQUEST:');
//     console.log('  Organization ID:', organizationId);
//     console.log('  Payload:', JSON.stringify(dto, null, 2));

//     const response = await fetch(
//       `${BASE_URL}/private/organizations/${organizationId}/payments/refund`,
//       {
//         method: 'POST',
//         headers: getHeaders(),
//         body: JSON.stringify(dto),
//       }
//     );

//     if (!response.ok) {
//       const data = await response.json().catch(() => ({}));
//       throw new Error(data?.message || 'Failed to refund payment');
//     }

//     console.log('✅ Payment refunded successfully');
//   } catch (error: unknown) {
//     console.error('❌ Refund payment error:', error);
//     return handleError(error, 'Failed to refund payment');
//   }
// };
import { api } from "@/lib/api";
import {
  Subscription,
  Checkout,
  StartSubscriptionDto,
  CancelSubscriptionDto,
  ReactivateSubscriptionResponse,
  ConfirmPaymentDto,
  AvailablePlans,
  PaymentsList,
  RefundPaymentDto,
} from "@/types/billing";

const orgPath = (orgId: string) => `/private/organizations/${orgId}`;

// GET /private/organizations/{orgId}/subscription
export const getSubscription = (orgId: string) =>
  api.get<Subscription>(`${orgPath(orgId)}/subscription`).then((r) => r.data);

// POST /private/organizations/{orgId}/subscription
export const startSubscription = (orgId: string, dto: StartSubscriptionDto) =>
  api.post<Checkout>(`${orgPath(orgId)}/subscription`, dto).then((r) => r.data);

// GET /private/organizations/{orgId}/plans
export const getAvailablePlans = (orgId: string) =>
  api.get<AvailablePlans>(`${orgPath(orgId)}/plans`).then((r) => r.data);

// POST /private/organizations/{orgId}/subscription/cancel
export const cancelSubscription = (orgId: string, dto: CancelSubscriptionDto) =>
  api.post(`${orgPath(orgId)}/subscription/cancel`, dto).then(() => undefined);

// POST /private/organizations/{orgId}/subscription/reactivate
export const reactivateSubscription = (orgId: string) =>
  api
    .post<ReactivateSubscriptionResponse>(`${orgPath(orgId)}/subscription/reactivate`)
    .then((r) => r.data);

// POST /private/organizations/{orgId}/subscription/confirm-payment
export const confirmPayment = (orgId: string, dto: ConfirmPaymentDto) =>
  api.post(`${orgPath(orgId)}/subscription/confirm-payment`, dto).then(() => undefined);

// GET /private/organizations/{orgId}/payments
export const getPayments = (orgId: string) =>
  api.get<PaymentsList>(`${orgPath(orgId)}/payments`).then((r) => r.data);

// POST /private/organizations/{orgId}/payments/refund
export const refundPayment = (orgId: string, dto: RefundPaymentDto) =>
  api.post(`${orgPath(orgId)}/payments/refund`, dto).then(() => undefined);