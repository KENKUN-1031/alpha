# ベースイメージを指定
FROM node:22-alpine AS base

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package.json package-lock.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# ポート番号を指定
EXPOSE 3000

# アプリケーションを起動
CMD ["npm", "run", "dev"]
