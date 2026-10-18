import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
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
    // Keep user signed in - session is captured by AuthContext and routes to organization creation

    return { user };
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error('Something went wrong');
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error('Something went wrong');
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};