import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaCalendar, FaArrowLeft } from 'react-icons/fa'
import './Profile.css'

const Profile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft /> กลับ
        </button>
        <h1>โปรไฟล์</h1>
        <p>ข้อมูลบัญชีของคุณ</p>
      </div>

      <div className="profile-card card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <div className="info-icon">
              <FaUser />
            </div>
            <div className="info-content">
              <span className="info-label">ชื่อ</span>
              <span className="info-value">{user?.name}</span>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <FaEnvelope />
            </div>
            <div className="info-content">
              <span className="info-label">อีเมล</span>
              <span className="info-value">{user?.email}</span>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <FaCalendar />
            </div>
            <div className="info-content">
              <span className="info-label">สมัครสมาชิกเมื่อ</span>
              <span className="info-value">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('th-TH') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
