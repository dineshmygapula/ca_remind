import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  User
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { getBackendToken, clearToken } from './apiService';

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User Credential:", userCredential);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error("Please verify your email before logging in. Check your inbox.");
    }

    await getBackendToken(email, password);

    return { user };

  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error('Something went wrong');
  }
};

export const signupWithEmail = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: `${firstName} ${lastName}` });
    await sendEmailVerification(user);
    await signOut(auth);

    return { message: "Verification email sent. Please check your inbox." };

  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error('Something went wrong');
  }
};

export const resendVerificationEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (user.emailVerified) {
      throw new Error("This email is already verified. Please log in.");
    }

    await sendEmailVerification(user);
    await signOut(auth);

    return { message: "Verification email resent successfully." };

  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error('Something went wrong');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    clearToken();
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error('Something went wrong');
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};