FROM golang:1.23.2-alpine

# Airのインストール
RUN apk add --no-cache git curl && \
  curl -sSfL https://raw.githubusercontent.com/cosmtrek/air/master/install.sh | sh -s

WORKDIR /app

COPY . .

RUN go mod tidy


CMD ["air", "./main"]
