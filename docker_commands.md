# Docker 基本命令

本文檔包含年進度條專案的基本 Docker 命令。

## 構建 Docker 映像

```bash
# 在專案根目錄中構建映像
docker build -t yearprogress:latest .
```

## 登入 Docker Hub

```bash
# 登入您的 Docker Hub 帳號
docker login
```

## 標記映像為 Docker Hub 格式

```bash
# 將本地映像標記為 Docker Hub 格式
docker tag yearprogress:latest alien7666/yearprogress:latest
```

## 上傳映像到 Docker Hub

```bash
# 推送標記的映像到 Docker Hub
docker push alien7666/yearprogress:latest
```

## 從 Docker Hub 拉取映像

```bash
# 拉取映像從 Docker Hub
docker pull alien7666/yearprogress:latest
```

## 運行容器

```bash
# 運行容器並使用主機網路
docker run -d --network=host --name yp-app alien7666/yearprogress:latest
```

```bash
# 如果不想使用主機網路，也可以在bridge網路下使用主機的IP地址來連接
docker run -d -p 4001:3000 --add-host=host.docker.internal:host-gateway --name yp-app alien7666/yearprogress:latest
```

```bash
# 使用環境變數指定資料庫連接資訊
docker run -d -p 4001:3000 \
  -e DB_HOST="192.168.0.10" \
  -e DB_PORT="3306" \
  -e DB_USER="YearProgres" \
  -e DB_PASSWORD="5YSwPDW7wnBnbGai" \
  -e DB_NAME="YearProgres" \
  --name yp-app alien7666/yearprogress:latest
```

```bash
# 使用環境變數並指定主機網路，如果您的資料庫是在同一台主機上
docker run -d \
  -e DB_HOST="127.0.0.1" \
  --network=host \
  --name yearprogress-app alien7666/yearprogress:latest
```

## 使用Docker網路連接容器（推薦使用）

如果您的MySQL也是在Docker容器中運行，最好的方法是創建一個共用的Docker網路，來連接資料庫和應用程式。

```bash
# 1. 創建一個名為 MySql 的網路
docker network create MySql

# 2. 如果您的MySQL容器已存在，將它連接到新網路（假設容器名為 mysql-container）
docker network connect MySql mysql-container

# 3. 啟動應用程式容器，使用相同的網路並指定資料庫主機為容器名稱
docker run -d \
  -p 4001:3000 \
  -e DB_HOST="mysql" \
  -e DB_PORT="3306" \
  -e DB_USER="YearProgres" \
  -e DB_PASSWORD="5YSwPDW7wnBnbGai" \
  -e DB_NAME="YearProgres" \
  --network=MySql \
  --name yp-app alien7666/yearprogress:latest
```

這種方法的優勢：

1. 可以將MySQL容器的端口只暴露給內部網路，提高安全性
2. 可以直接使用容器名稱進行連接，像在同一台機器上一樣
3. 適用不同的網路拓樓
4. 如果您的應用需要暴露特定的端口，仍然可以使用 -p 參數

需要注意的是，您需要確保您的MySQL容器與應用容器使用的用戶名、密碼和資料庫名稱是匹配的。
