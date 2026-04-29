# Food Inventory Management System

Web Application สำหรับจัดการสต็อกอาหารและแจ้งเตือนวันหมดอายุเพื่อลดการสูญเสียอาหารในครัวเรือน

## 🎯 คุณสมบัติหลัก

- 📸 **ถ่ายรูปและวิเคราะห์เนื้อสัตว์** - ใช้ AI วิเคราะห์ความสดของเนื้อสัตว์
- 🥩 **ระบุประเภทเนื้อ** - แยกประเภทเนื้อ (หมู/ไก่/ปลา)
- 📊 **Freshness Score** - คะแนนความสดแบบละเอียด (0-100%)
- 🗄️ **จัดการสต็อก** - เก็บข้อมูลวันที่ซื้อและวิธีเก็บ
- 📈 **Dashboard** - ภาพรวมสถิติและรายการอาหาร
- 🔔 **แจ้งเตือน** - แสดงอาหารที่ใกล้หมดอายุ
- 🔐 **ระบบความปลอดภัย** - Authentication, Authorization, Rate Limiting

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- React 18 + Vite
- React Router DOM
- Axios
- React Icons
- React Toastify

### Backend
- Node.js + Express
- PostgreSQL
- TensorFlow.js (สำหรับ AI)
- JWT Authentication
- Bcrypt.js
- Multer (File Upload)
- Helmet (Security)
- Express Rate Limit

## 📁 โครงสร้างโปรเจค

```
food-inventory-app/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # หน้าต่างๆ
│   │   ├── services/       # API services
│   │   ├── context/        # Context API
│   │   ├── styles/         # CSS files
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── vite.config.js
│
└── backend/                 # Node.js Backend
    ├── config/             # Configuration files
    ├── controllers/        # Route controllers
    ├── middleware/         # Express middleware
    ├── models/            # Database models
    ├── routes/            # API routes
    ├── utils/             # Utility functions
    ├── uploads/           # Uploaded images
    ├── package.json
    └── server.js
```

## 🚀 การติดตั้งและใช้งาน

### 1. ติดตั้ง PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
```

### 2. สร้าง Database

```bash
# เข้าสู่ PostgreSQL
sudo -u postgres psql

# รัน SQL จากไฟล์ schema.sql
\i backend/config/schema.sql
```

### 3. ติดตั้ง Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 4. ตั้งค่า Environment Variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# แก้ไขไฟล์ .env ตามการตั้งค่าของคุณ
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
# แก้ไขไฟล์ .env ตามการตั้งค่าของคุณ
```

### 5. เริ่มต้นใช้งาน

#### Backend
```bash
cd backend
npm run dev    # Development mode
# หรือ
npm start      # Production mode
```

#### Frontend
```bash
cd frontend
npm run dev    # Development mode
```

เปิดเบราว์เซอร์ที่: `http://localhost:3000`

## 🔒 ระบบความปลอดภัย

- **JWT Authentication** - ระบบยืนยันตัวตนด้วย JSON Web Token
- **Password Hashing** - เข้ารหัสรหัสผ่านด้วย bcrypt
- **Rate Limiting** - จำกัดจำนวนคำขอเพื่อป้องกัน DDoS
- **Helmet.js** - ตั้งค่า HTTP headers เพื่อความปลอดภัย
- **Input Validation** - ตรวจสอบข้อมูลที่ส่งเข้ามา
- **SQL Injection Protection** - ใช้ Parameterized Queries
- **Protected Routes** - ป้องกันหน้าที่ต้องเข้าสู่ระบบ
- **File Upload Security** - จำกัดประเภทและขนาดไฟล์

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/auth/verify` - ตรวจสอบ token

### Food Management
- `POST /api/food/scan` - สแกนและวิเคราะห์อาหาร
- `POST /api/food` - บันทึกข้อมูลอาหาร
- `GET /api/food` - ดูรายการอาหารทั้งหมด
- `GET /api/food/recent` - ดูรายการอาหารล่าสุด
- `GET /api/food/stats` - ดูสถิติ
- `DELETE /api/food/:id` - ลบรายการอาหาร

## 🤖 AI Model

ปัจจุบันระบบใช้ Mock AI Model เพื่อจำลองการวิเคราะห์ความสดของเนื้อสัตว์ 
สำหรับการใช้งานจริง แนะนำให้:

1. ฝึก Model ด้วย TensorFlow/PyTorch
2. Export เป็น TensorFlow.js format
3. โหลด Model ใน `backend/utils/meatAnalyzer.js`

### สูตรคำนวณความสด

- **ตู้เย็น**: ความสดลด 5% ต่อวัน
- **ช่องแข็ง**: ความสดลด 2% ต่อวัน

## 🎨 UI/UX Design

- โทนสีหลัก: น้ำเงิน (#1e40af)
- User-Friendly Interface
- Responsive Design
- รองรับทั้ง Desktop และ Mobile

## 📝 Database Schema

### Users Table
- id (Primary Key)
- name
- email (Unique)
- password (Hashed)
- created_at
- updated_at

### Foods Table
- id (Primary Key)
- user_id (Foreign Key)
- image_url
- meat_type
- purchase_date
- storage_method
- freshness_score
- created_at
- updated_at

## 🔧 การพัฒนาต่อ

### แนะนำสำหรับการพัฒนาเพิ่มเติม:

1. ใช้ AI Model จริงแทน Mock Model
2. เพิ่มระบบแจ้งเตือนผ่าน Email/SMS
3. เพิ่มฟีเจอร์ Barcode Scanner
4. รองรับอาหารประเภทอื่นๆ (ผัก, ผลไม้)
5. เพิ่มระบบแชร์ข้อมูลระหว่างสมาชิกในครอบครัว
6. Mobile App (React Native)
7. Dashboard แบบ Real-time

## 📄 License

MIT License

## 👨‍💻 ผู้พัฒนา

พัฒนาเพื่อการศึกษาและลดการสูญเสียอาหาร

## 📞 ติดต่อ

หากมีคำถามหรือข้อเสนอแนะ สามารถติดต่อได้ที่:
- GitHub Issues
- Email: [your-email@example.com]

---

**หมายเหตุ**: โปรเจคนี้พัฒนาเพื่อการศึกษา AI Model ที่ใช้เป็น Mock Data ควรพัฒนา Model จริงสำหรับการใช้งานจริง
