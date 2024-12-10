"use client";

import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebase/firebase-config";
import callProtectedAPI from "./utils/callProtectAPI";

export default function Page() {
  const [user, setUser] = useState<null | { displayName: string | null; email: string | null }>(null);
  const [apiResponse, setApiResponse] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);

  // Firebaseの認証状態を監視
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName,
          email: currentUser.email,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Googleログインを実行
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      setUser({
        displayName: loggedInUser.displayName,
        email: loggedInUser.email,
      });

      console.log("Logged in:", loggedInUser);
    } catch (error) {
      console.error("Google Login Failed:", error);
    }
  };

  // ログアウトを実行
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout Failed:", error);
    }
  };

  // API呼び出し
  const handleCallAPI = async () => {
    try {
      const response = await callProtectedAPI();
      setApiResponse(response.message);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Next.js Firebase Authentication Example</h1>

      {user ? (
        <div>
          <p>Welcome, {user.displayName || "User"}!</p>
          <p>Email: {user.email}</p>
          <button onClick={handleCallAPI}>Call Protected API</button>
          <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p>Please log in to access the protected API.</p>
          <button onClick={handleGoogleLogin}>Login with Google</button>
        </div>
      )}

      {apiResponse && (
        <div>
          <h2>API Response</h2>
          <p>{apiResponse}</p>
        </div>
      )}

      {error && (
        <div style={{ color: "red" }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
