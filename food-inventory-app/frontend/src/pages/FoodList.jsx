import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { foodService } from '../services/foodService'
import { toast } from 'react-toastify'
import { FaTrash, FaFilter, FaArrowLeft } from 'react-icons/fa'
import '../styles/FoodList.css'

const FoodList = () => {
  const navigate = useNavigate()
  const [foods, setFoods] = useState([])
  const [filteredFoods, setFilteredFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchFoods()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [foods, filter])

  const fetchFoods = async () => {
    try {
      const data = await foodService.getAllFoods()
      setFoods(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลได้')
      console.error('Error fetching foods:', error)
      setFoods([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = () => {
    let filtered = Array.isArray(foods) ? [...foods] : []
    
    if (filter === 'fresh') {
      filtered = filtered.filter(food => food.freshness_score >= 75)
    } else if (filter === 'expiring') {
      filtered = filtered.filter(food => food.freshness_score >= 50 && food.freshness_score < 75)
    } else if (filter === 'spoiled') {
      filtered = filtered.filter(food => food.freshness_score < 50)
    }
    
    setFilteredFoods(filtered)
  }

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
      try {
        await foodService.deleteFood(id)
        toast.success('ลบข้อมูลสำเร็จ')
        fetchFoods()
      } catch (error) {
        toast.error('ไม่สามารถลบข้อมูลได้')
        console.error('Error deleting food:', error)
      }
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
    <div className="foodlist-container">
      <div className="foodlist-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> กลับ
          </button>
          <div className="header-text">
            <h1>รายการอาหาร</h1>
            <p>จัดการสต็อกอาหารทั้งหมดของคุณ</p>
          </div>
        </div>
        
        <div className="filter-section">
          <FaFilter />
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            <option value="fresh">สดมาก (75%+)</option>
            <option value="expiring">ควรรีบใช้ (50-75%)</option>
            <option value="spoiled">ไม่ควรบริโภค (&lt;50%)</option>
          </select>
        </div>
      </div>

      {filteredFoods.length === 0 ? (
        <div className="card">
          <p className="no-data">ไม่พบรายการอาหาร</p>
        </div>
      ) : (
        <div className="foods-grid">
          {filteredFoods.map((food) => (
            <div key={food.id} className="food-card">
              <div className="food-card-image">
                <img src={food.imageUrl} alt={food.meatType} />
                <div
                  className={`freshness-badge ${getFreshnessColor(food.freshnessScore)}`}
                >
                  {food.freshnessScore}%
                </div>
              </div>
              
              <div className="food-card-body">
                <h3>{food.meatType}</h3>
                
                <div className="food-info">
                  <div className="info-row">
                    <span className="info-label">วันที่ซื้อ:</span>
                    <span className="info-value">
                      {new Date(food.purchaseDate).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">การเก็บ:</span>
                    <span className="info-value">{food.storageMethod}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">สถานะ:</span>
                    <span className="info-value">
                      {getFreshnessText(food.freshnessScore)}
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">เพิ่มเมื่อ:</span>
                    <span className="info-value">
                      {new Date(food.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>
                
                <button
                  className="btn btn-danger btn-block"
                  onClick={() => handleDelete(food.id)}
                >
                  <FaTrash /> ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FoodList
