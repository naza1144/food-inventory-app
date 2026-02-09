# ล้าง Token และ Session

## วิธีล้าง Token เพื่อทดสอบการ Login ใหม่

### 1. ล้าง Token ใน Browser
1. เปิด Developer Tools (F12)
2. ไปที่ **Application** tab
3. ไปที่ **Local Storage** → http://localhost:3000
4. คลิกขวาที่ `token` แล้วเลือก **Delete**
5. หรือพิมพ์ใน Console: `localStorage.clear()`

### 2. หรือใช้คำสั่งใน Console
เปิด Console (F12) แล้วพิมพ์:
```javascript
localStorage.removeItem('token')
location.reload()
```

### 3. หรือ Incognito Mode
เปิดเว็บใน **Incognito/Private Mode** จะไม่มี session เก่า

### 4. ตรวจสอบว่า Token ถูกล้างแล้ว
1. รีเฟรชหน้าเว็บ
2. ควรจะ redirect ไปหน้า `/login` แทน `/dashboard`

### 5. ทดสอบการ Login ใหม่
1. กรอก email และ password
2. Login ใหม่
3. ควรเข้าสู่ระบบได้ปกติ

## ปัญหาที่อาจเกิดขึ้น
- **Token ยังคงอยู่** → ระบบคิดว่ายัง login อยู่
- **Token หมดอายุ** → ควร redirect ไป login อัตโนมัติ
- **Backend restart** → token อาจ invalid

## วิธีแก้ถ้ายังไม่ได้
1. Restart backend server
2. ล้าง token ใน browser
3. ทดสอบ login ใหม่
