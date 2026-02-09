# คู่มือการติดตั้งและใช้งาน Food Inventory System

## ขั้นตอนที่ 1: ติดตั้ง Node.js และ PostgreSQL

### ติดตั้ง Node.js (v18 หรือสูงกว่า)

**Windows:**
1. ดาวน์โหลดจาก https://nodejs.org/
2. ติดตั้งตามขั้นตอนปกติ

**macOS:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### ติดตั้ง PostgreSQL

**Windows:**
1. ดาวน์โหลดจาก https://www.postgresql.org/download/
2. ติดตั้งและจดจำรหัสผ่านที่ตั้งไว้

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## ขั้นตอนที่ 2: สร้าง Database

### เข้าสู่ PostgreSQL
```bash
# Linux/macOS
sudo -u postgres psql

# Windows (เปิด SQL Shell/psql)
psql -U postgres
```

### สร้าง Database และ Tables
```sql
-- สร้าง Database
CREATE DATABASE food_inventory;

-- เชื่อมต่อกับ Database
\c food_inventory;

-- สร้าง Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง Foods Table
CREATE TABLE IF NOT EXISTS foods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  meat_type VARCHAR(100) NOT NULL,
  purchase_date DATE NOT NULL,
  storage_method VARCHAR(50) NOT NULL,
  freshness_score INTEGER NOT NULL CHECK (freshness_score >= 0 AND freshness_score <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง Indexes
CREATE INDEX idx_foods_user_id ON foods(user_id);
CREATE INDEX idx_foods_created_at ON foods(created_at DESC);
CREATE INDEX idx_foods_freshness_score ON foods(freshness_score);
CREATE INDEX idx_users_email ON users(email);

-- Function สำหรับ auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### ตรวจสอบ Database
```sql
-- ดูรายการ Tables
\dt

-- ออกจาก psql
\q
```

## ขั้นตอนที่ 3: ตั้งค่า Backend

```bash
# เข้าไปที่โฟลเดอร์ backend
cd backend

# ติดตั้ง dependencies
npm install

# คัดลอกไฟล์ .env.example
cp .env.example .env

# แก้ไขไฟล์ .env ด้วย text editor
# ตั้งค่า database credentials ให้ถูกต้อง
```

### ตัวอย่างไฟล์ .env
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=food_inventory
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d

MAX_FILE_SIZE=5242880

FRONTEND_URL=http://localhost:3000
```

## ขั้นตอนที่ 4: ตั้งค่า Frontend

```bash
# เข้าไปที่โฟลเดอร์ frontend
cd frontend

# ติดตั้ง dependencies
npm install

# คัดลอกไฟล์ .env.example
cp .env.example .env
```

### ตัวอย่างไฟล์ .env
```
VITE_API_URL=http://localhost:5000/api
```

## ขั้นตอนที่ 5: เริ่มใช้งาน

### เริ่ม Backend Server
```bash
cd backend
npm run dev
```

ควรเห็นข้อความ:
```
✅ Database connected successfully
🚀 Server is running on port 5000
📝 Environment: development
```

### เริ่ม Frontend (เปิด terminal ใหม่)
```bash
cd frontend
npm run dev
```

ควรเห็นข้อความ:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

## ขั้นตอนที่ 6: ทดสอบระบบ

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
2. สมัครสมาชิกใหม่
3. เข้าสู่ระบบ
4. ทดลองถ่ายรูป/อัพโหลดรูปเนื้อสัตว์
5. ดูผลการวิเคราะห์

## การแก้ไขปัญหาที่พบบ่อย

### 1. Database Connection Error
```bash
# ตรวจสอบว่า PostgreSQL ทำงานอยู่หรือไม่
# Linux/macOS
sudo systemctl status postgresql

# Windows - เช็คใน Services
```

### 2. Port Already in Use
```bash
# หา process ที่ใช้ port 5000 หรือ 3000
# Linux/macOS
lsof -i :5000
lsof -i :3000

# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill process
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows
```

### 3. Permission Denied (uploads folder)
```bash
# Linux/macOS
chmod 755 backend/uploads

# Windows - คลิกขวาโฟลเดอร์ > Properties > Security
```

### 4. Module Not Found
```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

## การใช้งาน Production

### Build Frontend
```bash
cd frontend
npm run build
```

### เริ่ม Backend ใน Production Mode
```bash
cd backend
NODE_ENV=production npm start
```

### Deploy บน Server (ตัวอย่าง)
1. ใช้ PM2 สำหรับจัดการ Node.js process
2. ใช้ Nginx เป็น reverse proxy
3. ใช้ SSL certificate (Let's Encrypt)
4. ตั้งค่า environment variables บน server

## ข้อมูลเพิ่มเติม

- Backend API จะทำงานที่ `http://localhost:5000`
- Frontend จะทำงานที่ `http://localhost:3000`
- รูปภาพที่อัพโหลดจะถูกเก็บใน `backend/uploads/`
- Database schema อยู่ที่ `backend/config/schema.sql`

## การอัพเดทระบบ

```bash
# Pull code ใหม่
git pull origin main

# Backend
cd backend
npm install
npm run dev

# Frontend  
cd frontend
npm install
npm run dev
```

## ความช่วยเหลือ

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- ตรวจสอบ logs ใน console
- ดู README.md สำหรับข้อมูลเพิ่มเติม
- สร้าง GitHub Issue

---

**สนุกกับการใช้งาน! 🎉**
