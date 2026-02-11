import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaHome, FaCamera, FaListAlt, FaUser, FaSignOutAlt } from 'react-icons/fa'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return null
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          Food Inventory
        </Link>
        
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            <FaHome /> หน้าหลัก
          </Link>
          <Link to="/scan" className="navbar-link">
            <FaCamera /> สแกนอาหาร
          </Link>
          <Link to="/foods" className="navbar-link">
            <FaListAlt /> รายการอาหาร
          </Link>
          <Link to="/profile" className="navbar-link">
            <FaUser /> โปรไฟล์
          </Link>
          <button onClick={handleLogout} className="navbar-link logout-btn">
            <FaSignOutAlt /> ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
