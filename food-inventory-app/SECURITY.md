# Security Features - Food Inventory System

เอกสารนี้อธิบายมาตรการรักษาความปลอดภัยที่ใช้ในระบบ

## 🔐 Authentication & Authorization

### 1. JWT (JSON Web Token)
- ใช้ JWT สำหรับการยืนยันตัวตน
- Token มีอายุ 7 วัน (ปรับได้ตาม environment)
- Token ถูกส่งผ่าน HTTP Header: `Authorization: Bearer <token>`
- Server ตรวจสอบ token ทุก request ที่ต้องการความปลอดภัย

**Implementation:**
```javascript
// Generate Token
const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
  expiresIn: '7d'
})

// Verify Token
const decoded = jwt.verify(token, process.env.JWT_SECRET)
```

### 2. Password Security
- **Hashing Algorithm:** bcrypt
- **Salt Rounds:** 10
- Password ไม่ถูกเก็บเป็น plain text
- Password minimum length: 6 characters

**Implementation:**
```javascript
// Hash password
const hashedPassword = await bcrypt.hash(password, 10)

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword)
```

---

## 🛡️ API Security

### 1. Rate Limiting
จำกัดจำนวนคำขอเพื่อป้องกัน DDoS และ Brute Force Attack

**Limits:**
- **Authentication:** 5 requests / 15 minutes
- **File Upload:** 20 uploads / 1 hour
- **General API:** 100 requests / 15 minutes

**Implementation:**
```javascript
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'พยายามเข้าสู่ระบบมากเกินไป'
})
```

### 2. Helmet.js
ตั้งค่า HTTP Headers เพื่อความปลอดภัย

**Headers ที่ถูกตั้งค่า:**
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- X-XSS-Protection

**Implementation:**
```javascript
import helmet from 'helmet'
app.use(helmet())
```

### 3. CORS (Cross-Origin Resource Sharing)
จำกัดการเข้าถึง API จาก domains ที่ไม่ได้รับอนุญาต

**Configuration:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
```

---

## 📝 Input Validation & Sanitization

### 1. Express Validator
ตรวจสอบและทำความสะอาดข้อมูลที่ส่งเข้ามา

**Example:**
```javascript
const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .isLength({ min: 2 }),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
]
```

### 2. File Upload Validation
- **ประเภทไฟล์:** รองรับเฉพาะรูปภาพ (image/*)
- **ขนาดไฟล์:** สูงสุด 5MB
- **ชื่อไฟล์:** ใช้ timestamp และ random string

**Implementation:**
```javascript
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('รองรับเฉพาะไฟล์รูปภาพ'), false)
  }
}
```

---

## 🗃️ Database Security

### 1. SQL Injection Prevention
- ใช้ Parameterized Queries (Prepared Statements)
- ไม่ต่อ string โดยตรงใน SQL query

**Safe Query:**
```javascript
// ✅ ปลอดภัย
const query = 'SELECT * FROM users WHERE email = $1'
const result = await pool.query(query, [email])

// ❌ ไม่ปลอดภัย
const query = `SELECT * FROM users WHERE email = '${email}'`
```

### 2. Database Credentials
- เก็บใน environment variables
- ไม่ commit .env file ไปใน git
- ใช้ connection pool แทน direct connection

### 3. Foreign Key Constraints
- ใช้ ON DELETE CASCADE เพื่อป้องกัน orphan records
- ตั้งค่า indexes สำหรับ performance และ security

---

## 🔒 Protected Routes

### Frontend Route Protection
```javascript
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}
```

### Backend Route Protection
```javascript
router.get('/food', protect, getAllFoods)
// protect middleware ตรวจสอบ JWT token
```

---

## 📁 File Storage Security

### 1. Upload Directory
- แยกโฟลเดอร์เก็บไฟล์ออกจาก source code
- ตั้งค่า permissions ให้เหมาะสม (755)
- ใช้ unique filename เพื่อป้องกัน collision

### 2. File Access
- ไฟล์ถูก serve ผ่าน Express static middleware
- ตรวจสอบสิทธิ์การเข้าถึง (ในอนาคต)

---

## 🚨 Error Handling

### 1. Safe Error Messages
- ไม่เปิดเผยข้อมูลระบบใน error message
- แสดง stack trace เฉพาะใน development mode

**Implementation:**
```javascript
export const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
```

### 2. Logging
- Log errors สำหรับ debugging
- ไม่ log sensitive information (passwords, tokens)

---

## 🔍 Security Best Practices

### Environment Variables
```bash
# ❌ อย่าใช้ค่าเหล่านี้ใน production
JWT_SECRET=secret123
DB_PASSWORD=password

# ✅ ใช้ค่าที่ปลอดภัย
JWT_SECRET=your_very_long_and_random_secret_key_at_least_32_characters
DB_PASSWORD=complex_Password_with_sp3c!al_ch@rs
```

### HTTPS
- ใช้ HTTPS ใน production
- ติดตั้ง SSL certificate (Let's Encrypt)
- Redirect HTTP to HTTPS

### Session Management
- Token expiration
- Logout invalidates token (client-side)
- Refresh token mechanism (ในอนาคต)

---

## 📋 Security Checklist

### Development
- [ ] ใช้ environment variables สำหรับ sensitive data
- [ ] Hash passwords ด้วย bcrypt
- [ ] ใช้ Parameterized Queries
- [ ] Validate และ sanitize input
- [ ] จำกัดขนาดและประเภทไฟล์
- [ ] ตั้งค่า rate limiting
- [ ] ใช้ helmet.js
- [ ] ตั้งค่า CORS

### Production
- [ ] ใช้ HTTPS
- [ ] เปลี่ยน JWT_SECRET
- [ ] ตั้งค่า strong database password
- [ ] จำกัด CORS origins
- [ ] Enable production logging
- [ ] ตั้งค่า firewall
- [ ] Regular security updates
- [ ] Backup database

---

## 🔄 Security Updates

### Regular Maintenance
```bash
# ตรวจสอบ vulnerabilities
npm audit

# แก้ไข vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Monitoring
- ติดตาม error logs
- ตรวจสอบ unusual activity
- Monitor rate limit hits

---

## 🐛 Reporting Security Issues

หากพบช่องโหว่ด้านความปลอดภัย:

1. **อย่า** เปิดเผยเป็น public issue
2. ส่ง email ไปที่: security@yourcompany.com
3. รอการตอบกลับจากทีมพัฒนา

---

## 📚 Security Resources

### การเรียนรู้เพิ่มเติม:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### Tools:
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP ZAP](https://www.zaproxy.org/)

---

## 🎓 Security Training

### สำหรับทีมพัฒนา:
1. OWASP Top 10 Training
2. Secure Coding Practices
3. SQL Injection Prevention
4. XSS Prevention
5. Authentication & Authorization

---

**Last Updated:** January 28, 2024
**Version:** 1.0.0
