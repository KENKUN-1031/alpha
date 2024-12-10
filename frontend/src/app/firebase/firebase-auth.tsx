import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase-config";

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken(); // JWTトークン
    const user = result.user; // ユーザー情報
    console.log("Token:", token);
    console.log("User:", user);
    return { token, user };
  } catch (error) {
    console.error("Error during Google login:", error);
    throw error;
  }
};
