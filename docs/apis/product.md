這裡是更新後的 API 文件，包含了使用 `cURL` 和 `Python` (使用 `requests` 模組) 的範例請求。

---

# Product API Documentation

## Base URL

```
http://localhost:9000/api/v1/product
```

---

## 1. 創建商品

**Path**: `/create`  
**Method**: `POST`  
**Description**: 用於創建一個新的商品。

### Request

- **Headers**:
  - Content-Type: `application/json`
  
- **Body Parameters**:
  - `name` (string, required): 商品名稱
  - `description` (string, required): 商品描述
  - `price` (number, required): 商品價格
  - `category` (string, required): 商品類別
  - `stock` (number, required): 庫存數量
  - `tags` (array of strings, optional): 商品標籤

### Example

#### cURL

```bash
curl -X POST http://localhost:9000/api/v1/product/create \
-H "Content-Type: application/json" \
-d '{
    "name": "商品名稱",
    "description": "商品描述",
    "price": 1000,
    "category": "電子產品",
    "stock": 50,
    "tags": ["tag1", "tag2"]
}'
```

#### Python (requests)

```python
import requests

url = 'http://localhost:9000/api/v1/product/create'
data = {
    "name": "商品名稱",
    "description": "商品描述",
    "price": 1000,
    "category": "電子產品",
    "stock": 50,
    "tags": ["tag1", "tag2"]
}
headers = {'Content-Type': 'application/json'}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

### Response

- **201 Created**:
  - 成功返回創建的商品信息

```json
{
  "status": 201,
  "message": {
    "_id": "商品ID",
    "name": "商品名稱",
    "description": "商品描述",
    "price": 1000,
    "category": "電子產品",
    "stock": 50,
    "tags": ["tag1", "tag2"],
    "createdAt": "時間戳"
  }
}
```

---

## 2. 刪除商品

**Path**: `/delete`  
**Method**: `DELETE`  
**Description**: 刪除指定的商品，只有具有 `admin` 權限的用戶可以刪除。

### Request

- **Headers**:
  - Authorization: `Bearer {token}` (需要攜帶 JWT token)
  - Content-Type: `application/json`
  
- **Body Parameters**:
  - `productId` (string, required): 商品的 ID

### Example

#### cURL

```bash
curl -X DELETE http://localhost:9000/api/v1/product/delete \
-H "Authorization: Bearer your_token_here" \
-H "Content-Type: application/json" \
-d '{
    "productId": "商品ID"
}'
```

#### Python (requests)

```python
import requests

url = 'http://localhost:9000/api/v1/product/delete'
headers = {
    'Authorization': 'Bearer your_token_here',
    'Content-Type': 'application/json'
}
data = {
    'productId': '商品ID'
}

response = requests.delete(url, json=data, headers=headers)
print(response.json())
```

### Response

- **200 OK**:
  - 成功刪除商品

```json
{
  "message": "成功刪除"
}
```

---

## 3. 創建評論

**Path**: `/:productId/commets`  
**Method**: `POST`  
**Description**: 為指定商品創建一條新的評論。

### Request

- **Headers**:
  - Content-Type: `application/json`
  
- **Body Parameters**:
  - `username` (string, required): 用戶名
  - `content` (string, required): 評論內容
  - `tags` (array of strings, optional): 評論標籤

- **Path Parameters**:
  - `productId` (string, required): 商品 ID

### Example

#### cURL

```bash
curl -X POST http://localhost:9000/api/v1/product/商品ID/commets \
-H "Content-Type: application/json" \
-d '{
    "username": "JohnDoe",
    "content": "這是一個非常好的商品！",
    "tags": ["好評", "高品質"]
}'
```

#### Python (requests)

```python
import requests

url = 'http://localhost:9000/api/v1/product/商品ID/commets'
data = {
    "username": "JohnDoe",
    "content": "這是一個非常好的商品！",
    "tags": ["好評", "高品質"]
}
headers = {'Content-Type': 'application/json'}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

### Response

- **201 Created**:
  - 成功創建評論並返回評論信息

```json
{
  "newComment": {
    "username": "JohnDoe",
    "content": "這是一個非常好的商品！",
    "tags": ["好評", "高品質"],
    "createdAt": "時間戳"
  }
}
```

---

## 4. 創建回覆

**Path**: `/:productId/commets/:commentId/replies`  
**Method**: `POST`  
**Description**: 為指定評論創建一條回覆。

### Request

- **Headers**:
  - Content-Type: `application/json`
  
- **Body Parameters**:
  - `username` (string, required): 用戶名
  - `content` (string, required): 回覆內容

- **Path Parameters**:
  - `productId` (string, required): 商品 ID
  - `commentId` (string, required): 評論 ID

### Example

#### cURL

```bash
curl -X POST http://localhost:9000/api/v1/product/商品ID/commets/評論ID/replies \
-H "Content-Type: application/json" \
-d '{
    "username": "JaneDoe",
    "content": "我同意你的看法！"
}'
```

#### Python (requests)

```python
import requests

url = 'http://localhost:9000/api/v1/product/商品ID/commets/評論ID/replies'
data = {
    "username": "JaneDoe",
    "content": "我同意你的看法！"
}
headers = {'Content-Type': 'application/json'}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

### Response

- **201 Created**:
  - 成功創建回覆並返回回覆信息

```json
{
  "username": "JaneDoe",
  "content": "我同意你的看法！",
  "createdAt": "時間戳"
}
```

---

## 5. 獲取評論

**Path**: `/:productId/commets`  
**Method**: `GET`  
**Description**: 獲取指定商品的評論，支持分頁。

### Request

- **Headers**:
  - Content-Type: `application/json`
  
- **Path Parameters**:
  - `productId` (string, required): 商品 ID

- **Query Parameters**:
  - `page` (number, optional): 分頁參數，默認為 `1`

### Example

#### cURL

```bash
curl -X GET "http://localhost:9000/api/v1/product/商品ID/commets?page=1" \
-H "Content-Type: application/json"
```

#### Python (requests)

```python
import requests

url = 'http://localhost:9000/api/v1/product/商品ID/commets'
params = {'page': 1}
headers = {'Content-Type': 'application/json'}

response = requests.get(url, params=params, headers=headers)
print(response.json())
```

### Response

- **200 OK**:
  - 成功返回商品的評論

```json
{
  "comments": [
    {
      "_id": "評論ID",
      "username": "JohnDoe",
      "content": "這是一個非常好的商品！",
      "tags": ["好評", "高品質"],
      "createdAt": "時間戳",
      "replies": [
        {
          "_id": "回覆ID",
          "username": "JaneDoe",
          "content": "我同意你的看法！",
          "createdAt": "時間戳"
        }
      ]
    }
  ]
}
```

---

這些範例應該可以幫助你快速開始與 `product` 相關的 API 的集成，無論你是使用 `cURL` 還是 `Python`。