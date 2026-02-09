# API Documentation - Food Inventory System

## Base URL
```
http://localhost:5000/api
```

## Authentication
ระบบใช้ JWT (JSON Web Token) สำหรับการยืนยันตัวตน

### รูปแบบ Header
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### 1. สมัครสมาชิก
**POST** `/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-28T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - ข้อมูลไม่ถูกต้องหรือไม่ครบ
- `400 Bad Request` - อีเมลนี้ถูกใช้งานแล้ว

---

### 2. เข้าสู่ระบบ
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-28T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - ข้อมูลไม่ถูกต้อง
- `401 Unauthorized` - อีเมลหรือรหัสผ่านไม่ถูกต้อง

---

### 3. ตรวจสอบ Token
**GET** `/auth/verify`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-28T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Token ไม่ถูกต้องหรือหมดอายุ

---

## 🥩 Food Management Endpoints

### 1. สแกนและวิเคราะห์อาหาร
**POST** `/food/scan`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (file) - ไฟล์รูปภาพ (JPG, PNG)
- `purchase_date` (string) - วันที่ซื้อ (YYYY-MM-DD)
- `storage_method` (string) - วิธีเก็บ ("ตู้เย็น" หรือ "ช่องแข็ง")

**Example:**
```javascript
const formData = new FormData()
formData.append('image', imageFile)
formData.append('purchase_date', '2024-01-28')
formData.append('storage_method', 'ตู้เย็น')
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "image_url": "/uploads/food-1706438400000-123456789-image.jpg",
    "meat_type": "หมู",
    "purchase_date": "2024-01-28",
    "storage_method": "ตู้เย็น",
    "freshness_score": 85,
    "confidence": 92
  }
}
```

**Error Responses:**
- `400 Bad Request` - ไม่มีไฟล์รูปภาพ
- `400 Bad Request` - ข้อมูลไม่ครบถ้วน
- `413 Payload Too Large` - ไฟล์ใหญ่เกินไป
- `429 Too Many Requests` - อัพโหลดมากเกินไป

---

### 2. บันทึกข้อมูลอาหาร
**POST** `/food`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "image_url": "/uploads/food-1706438400000-123456789-image.jpg",
  "meat_type": "หมู",
  "purchase_date": "2024-01-28",
  "storage_method": "ตู้เย็น",
  "freshness_score": 85
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "image_url": "/uploads/food-1706438400000-123456789-image.jpg",
    "meat_type": "หมู",
    "purchase_date": "2024-01-28",
    "storage_method": "ตู้เย็น",
    "freshness_score": 85,
    "created_at": "2024-01-28T10:00:00.000Z",
    "updated_at": "2024-01-28T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - ข้อมูลไม่ครบถ้วน
- `401 Unauthorized` - ไม่มีสิทธิ์เข้าถึง

---

### 3. ดูรายการอาหารทั้งหมด
**GET** `/food`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "image_url": "/uploads/food-1.jpg",
      "meat_type": "หมู",
      "purchase_date": "2024-01-28",
      "storage_method": "ตู้เย็น",
      "freshness_score": 85,
      "created_at": "2024-01-28T10:00:00.000Z",
      "updated_at": "2024-01-28T10:00:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "image_url": "/uploads/food-2.jpg",
      "meat_type": "ไก่",
      "purchase_date": "2024-01-27",
      "storage_method": "ช่องแข็ง",
      "freshness_score": 90,
      "created_at": "2024-01-27T10:00:00.000Z",
      "updated_at": "2024-01-27T10:00:00.000Z"
    }
  ]
}
```

---

### 4. ดูรายการอาหารล่าสุด
**GET** `/food/recent`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "user_id": 1,
      "image_url": "/uploads/food-5.jpg",
      "meat_type": "ปลา",
      "purchase_date": "2024-01-28",
      "storage_method": "ตู้เย็น",
      "freshness_score": 92,
      "created_at": "2024-01-28T12:00:00.000Z",
      "updated_at": "2024-01-28T12:00:00.000Z"
    }
  ]
}
```

---

### 5. ดูสถิติ
**GET** `/food/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "expiringSoon": 3,
    "fresh": 6,
    "spoiled": 1
  }
}
```

**คำอธิบาย:**
- `total` - จำนวนรายการทั้งหมด
- `expiringSoon` - ความสด 50-74% (ควรรีบใช้)
- `fresh` - ความสด 75-100% (สดมาก)
- `spoiled` - ความสด 0-49% (ไม่ควรบริโภค)

---

### 6. ลบรายการอาหาร
**DELETE** `/food/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (integer) - ID ของรายการอาหาร

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ลบข้อมูลสำเร็จ"
}
```

**Error Responses:**
- `404 Not Found` - ไม่พบข้อมูลอาหาร
- `401 Unauthorized` - ไม่มีสิทธิ์ลบข้อมูลนี้

---

## ⚠️ Error Responses

### รูปแบบ Error ทั่วไป
```json
{
  "success": false,
  "message": "คำอธิบายข้อผิดพลาด"
}
```

### HTTP Status Codes
- `200 OK` - สำเร็จ
- `201 Created` - สร้างข้อมูลสำเร็จ
- `400 Bad Request` - ข้อมูลไม่ถูกต้อง
- `401 Unauthorized` - ไม่มีสิทธิ์เข้าถึง
- `404 Not Found` - ไม่พบข้อมูล
- `413 Payload Too Large` - ไฟล์ใหญ่เกินไป
- `429 Too Many Requests` - คำขอมากเกินไป
- `500 Internal Server Error` - เกิดข้อผิดพลาดในเซิร์ฟเวอร์

---

## 🔒 Rate Limiting

### การจำกัดจำนวนคำขอ
- **Auth endpoints** - 5 requests / 15 minutes
- **Upload endpoints** - 20 uploads / 1 hour
- **General API** - 100 requests / 15 minutes

### Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706439600
```

---

## 📝 ตัวอย่างการใช้งาน

### JavaScript (Axios)
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
})

// เพิ่ม token ทุก request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  localStorage.setItem('token', response.data.token)
  return response.data
}

// Scan Food
const scanFood = async (formData) => {
  const response = await api.post('/food/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// Get All Foods
const getAllFoods = async () => {
  const response = await api.get('/food')
  return response.data
}
```

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Get Foods:**
```bash
curl -X GET http://localhost:5000/api/food \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Scan Food:**
```bash
curl -X POST http://localhost:5000/api/food/scan \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@/path/to/image.jpg" \
  -F "purchase_date=2024-01-28" \
  -F "storage_method=ตู้เย็น"
```

---

## 🛡️ Security Features

1. **JWT Authentication** - ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
2. **Password Hashing** - เข้ารหัสรหัสผ่านด้วย bcrypt
3. **Rate Limiting** - จำกัดจำนวนคำขอ
4. **Input Validation** - ตรวจสอบข้อมูลที่ส่งเข้ามา
5. **File Upload Security** - จำกัดประเภทและขนาดไฟล์
6. **CORS Protection** - จำกัดการเข้าถึง API
7. **Helmet.js** - ตั้งค่า Security Headers

---

## 📞 ติดต่อและสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- สร้าง GitHub Issue
- ติดต่อทีมพัฒนา

**Last Updated:** January 28, 2024
