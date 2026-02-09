import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'
import '../styles/Auth.css'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const { signup } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน')
      return
    }

    if (formData.password.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setLoading(true)

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      toast.success('สมัครสมาชิกสำเร็จ!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'สมัครสมาชิกล้มเหลว')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>สมัครสมาชิก</h1>
          <p>เริ่มต้นจัดการสต็อกอาหารของคุณ! 🥩</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">ชื่อ</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="ชื่อของคุณ"
            />
          </div>

          <div className="form-group">
            <label className="form-label">อีเมล</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>

          <div className="form-group">
            <label className="form-label">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                กำลังสมัครสมาชิก...
              </>
            ) : (
              'สมัครสมาชิก'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>มีบัญชีอยู่แล้ว? 
            <Link to="/login"> เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
