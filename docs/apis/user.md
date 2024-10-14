
# User API Documentation

Base URL:` http://localhost:9000/api/v1/`

---

## 1. User Registration

### **Endpoint**
```
POST /auth/register
```

### **Request Body**
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```

### **Response**
- **201 Created**
    ```json
    {
        "message": "註冊成功"
    }
    ```
- **400 Bad Request**
    ```json
    {
        "message": "所有欄位都是必填的"
    }
    ```

### **Example**
**cURL**
```bash
curl -X POST http://localhost:9000/api/v1/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "john_doe", "email": "john@example.com", "password": "mypassword"}'
```

**Python**
```python
import requests

url = "http://localhost:9000/api/v1/auth/register"
data = {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "mypassword"
}

response = requests.post(url, json=data)
print(response.json())
```

---

## 2. User Login

### **Endpoint**
```
POST /auth/login
```

### **Request Body**
```json
{
    "email": "string",
    "password": "string",
    "rememberMe": "boolean" // 可選
}
```

### **Response**
- **200 OK**
    ```json
    {
        "message": "登入成功",
        "token": "string" // JWT token
    }
    ```
- **400 Bad Request**
    ```json
    {
        "message": "電子郵件和密碼都是必填的"
    }
    ```
- **401 Unauthorized**
    ```json
    {
        "message": "使用者不存在或密碼錯誤"
    }
    ```

### **Example**
**cURL**
```bash
curl -X POST http://localhost:9000/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "john@example.com", "password": "mypassword", "rememberMe": true}'
```

**Python**
```python
import requests

url = "http://localhost:9000/api/v1/auth/login"
data = {
    "email": "john@example.com",
    "password": "mypassword",
    "rememberMe": True
}

response = requests.post(url, json=data)
print(response.json())
```

---

## 3. Upload Avatar

### **Endpoint**
```
POST /user/avatar
```

### **Headers**
- `Authorization`: `Bearer <token>`

### **Request**
- **Form Data**
    - `avatar`: (file) // 使用者上傳的圖片

### **Response**
- **200 OK**
    ```json
    {
        "message": "頭像更新成功",
        "avatarURL": "string" // 頭像的URL
    }
    ```
- **401 Unauthorized**
    ```json
    {
        "message": "未提供授權令牌"
    }
    ```
- **404 Not Found**
    ```json
    {
        "message": "使用者不存在"
    }
    ```

### **Example**
**cURL**
```bash
curl -X POST http://localhost:9000/api/v1/user/avatar \
-H "Authorization: Bearer <your_token>" \
-F "avatar=@/path/to/avatar.jpg"
```

**Python**
```python
import requests

url = "http://localhost:9000/api/v1/user/avatar"
headers = {
    "Authorization": "Bearer <your_token>"
}
files = {
    "avatar": open("/path/to/avatar.jpg", "rb")
}

response = requests.post(url, headers=headers, files=files)
print(response.json())
```

---

## 4. Get User Avatar

### **Endpoint**
```
GET /user/avatar/:id
```

### **Path Parameters**
- `id`: 使用者的 ID

### **Response**
- **200 OK**
    ```json
    {
        "status": 200,
        "message": "http://localhost:9000/upload/avatar/<avatar_filename>"
    }
    ```
- **400 Bad Request**
    ```json
    {
        "status": 400,
        "message": "userID is required for getting user avatar"
    }
    ```
- **404 Not Found**
    ```json
    {
        "status": 404,
        "message": "No User Found :<"
    }
    ```

### **Example**
**cURL**
```bash
curl -X GET http://localhost:9000/api/v1/user/avatar/<user_id>
```

**Python**
```python
import requests

user_id = "<user_id>"
url = f"http://localhost:9000/api/v1/user/avatar/{user_id}"

response = requests.get(url)
print(response.json())
```

---

這份文檔提供了關於 `User` API 的詳細資訊，包含各個端點的請求格式和範例，讓使用者能夠更方便地了解如何與這個 API 進行交互。