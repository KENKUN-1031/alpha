package main

import (
	"context"
	"log"
	"strings"

	firebase "firebase.google.com/go/v4"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

// Firebaseアプリのインスタンスをグローバル変数として宣言
var firebaseApp *firebase.App

// Firebaseを初期化
func initFirebase() {
	opt := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase: %v", err)
	}
	firebaseApp = app
}

// JWTトークンの検証ミドルウェア
func verifyToken(app *firebase.App) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(401, gin.H{"error": "missing or invalid token"})
			c.Abort()
			return
		}

		idToken := strings.TrimPrefix(authHeader, "Bearer ")

		client, err := app.Auth(context.Background())
		if err != nil {
			log.Printf("Failed to get Firebase Auth client: %v", err)
			c.JSON(500, gin.H{"error": "internal server error"})
			c.Abort()
			return
		}

		token, err := client.VerifyIDToken(context.Background(), idToken)
		if err != nil {
			log.Printf("Invalid token: %v", err)
			c.JSON(401, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}

		// トークンが有効な場合、UIDを設定
		c.Set("firebaseUID", token.UID)
		c.Next()
	}
}

func main() {
	// Firebaseを初期化
	initFirebase()

	// Ginルータを作成
	r := gin.Default()

	// CORSの設定を追加
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Next.js のURL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// 公開エンドポイント
	r.GET("/public", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "This is a public endpoint"})
	})

	// 認証が必要なエンドポイント
	protected := r.Group("/protected")
	protected.Use(verifyToken(firebaseApp)) // verifyTokenにfirebaseAppを渡す
	{
		protected.GET("", func(c *gin.Context) {
			uid, exists := c.Get("firebaseUID")
			if !exists {
				c.JSON(500, gin.H{"error": "internal server error"})
				return
			}
			c.JSON(200, gin.H{"message": "This is a protected endpoint", "uid": uid})
		})
	}

	// サーバーを起動
	r.Run(":8080")
}
