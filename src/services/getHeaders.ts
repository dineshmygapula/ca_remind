import { auth } from "../config/firebase";

export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  const token = await user.getIdToken(); // ✅ Firebase auto-refreshes if expired
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};