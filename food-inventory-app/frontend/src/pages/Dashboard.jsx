import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { foodService } from '../services/foodService'
import { 
  FaCamera, 
  FaListAlt, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaUtensils,
  FaClock,
  FaLeaf
} from 'react-icons/fa'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    expiringSoon: 0,
    fresh: 0,
    spoiled: 0
  })
  const [recentFoods, setRecentFoods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, foodsResponse] = await Promise.all([
        foodService.getStats(),
        foodService.getRecentFoods()
      ])
      
      // Extract data from responses
      const statsData = statsResponse.data || statsResponse
      const foodsData = foodsResponse.data || foodsResponse
      
      setStats(statsData)
      setRecentFoods(Array.isArray(foodsData) ? foodsData : [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setRecentFoods([])
    } finally {
      setLoading(false)
    }
  }

  const getFreshnessColor = (score) => {
    if (score >= 75) return 'high'
    if (score >= 50) return 'medium'
    return 'low'
  }

  const getFreshnessText = (score) => {
    if (score >= 75) return 'สดมาก'
    if (score >= 50) return 'ควรรีบใช้'
    return 'ไม่ควรบริโภค'
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>แดชบอร์ด</h1>
        <p>ภาพรวมสต็อกอาหารของคุณ</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FaListAlt />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>รายการทั้งหมด</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <FaExclamationTriangle />
          </div>
          <div className="stat-info">
            <h3>{stats.expiringSoon}</h3>
            <p>ใกล้หมดอายุ</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <h3>{stats.fresh}</h3>
            <p>สดใหม่</p>
          </div>
        </div>
      </div>

      <div className="action-grid">
        <Link to="/scan" className="action-card blue">
          <FaCamera size={40}/>
          <h3>สแกนอาหาร</h3>
          <p>ถ่ายรูปเพื่อวิเคราะห์ความสดใหม่</p>
        </Link>

        <Link to="/foods" className="action-card green">
          <FaListAlt size={48}/>
          <h3>รายการอาหาร</h3>
          <p>ดูและจัดการสต็อกอาหารทั้งหมด</p>
        </Link>
      </div>

      <div className="recent-foods-section">
        <div className="recent-foods-header">
          <h2>รายการล่าสุด</h2>
        </div>
        
        {recentFoods.length === 0 ? (
          <p className="no-data">ยังไม่มีรายการอาหาร เริ่มต้นด้วยการสแกนอาหารของคุณ!</p>
        ) : (
          <div className="food-list">
            {recentFoods.map((food) => (
              <div key={food.id} className="food-item">
                <img src={food.imageUrl} alt={food.meatType} className="food-image" />
                <div className="food-details">
                  <h3>{food.meatType}</h3>
                  <p className="food-info">วันที่ซื้อ: {new Date(food.purchaseDate).toLocaleDateString('th-TH')}</p>
                  <p className="food-info">การเก็บ: {food.storageMethod}</p>
                </div>
                <div className="freshness-info">
                  <div className={`freshness-score ${getFreshnessColor(food.freshnessScore)}`}>
                    {food.freshnessScore}%
                  </div>
                  <p className={`freshness-text ${getFreshnessColor(food.freshnessScore)}`}>
                    {getFreshnessText(food.freshnessScore)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
