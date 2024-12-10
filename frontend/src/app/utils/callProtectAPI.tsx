import { auth } from "../firebase/firebase-config"; // Firebaseの初期化

export default async function callProtectedAPI() {
  try {
    // Firebase Authenticationからトークンを取得
    const token = await auth.currentUser?.getIdToken();

    // Ginサーバーのエンドポイントにリクエスト
    const response = await fetch("http://localhost:8080/protected", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // トークンをヘッダーに含める
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response from Gin server:", data);
    return data;
  } catch (error) {
    console.error("Error calling protected API:", error);
  }
}
