import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { foodService } from '../services/foodService'
import { toast } from 'react-toastify'
import { FaCamera, FaUpload, FaArrowLeft } from 'react-icons/fa'
import './ScanFood.css'

const ScanFood = () => {
  const navigate = useNavigate()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState({
    purchase_date: new Date().toISOString().split('T')[0],
    storage_method: 'ตู้เย็น'
  })
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setResult(null)
    }
  }

  const handleScan = async () => {
    if (!image) {
      toast.error('กรุณาอัพโหลดรูปภาพก่อน')
      return
    }

    setScanning(true)
    const scanFormData = new FormData()
    scanFormData.append('image', image)
    scanFormData.append('purchase_date', formData.purchase_date)
    scanFormData.append('storage_method', formData.storage_method)

    try {
      const response = await foodService.scanFood(scanFormData)
      setResult(response.data)
      toast.success('วิเคราะห์เสร็จสิ้น!')
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการวิเคราะห์')
      console.error('Scan error:', error)
    } finally {
      setScanning(false)
    }
  }

  const handleSave = async () => {
    if (!result) {
      toast.error('กรุณาสแกนอาหารก่อน')
      return
    }

    try {
      const foodData = {
        image_url: result.image_url,
        meat_type: result.meat_type,
        purchase_date: result.purchase_date,
        storage_method: result.storage_method,
        freshness_score: result.freshness_score
      }
      
      await foodService.saveFood(foodData)
      toast.success('บันทึกข้อมูลสำเร็จ!')
      // Reset form
      setImage(null)
      setPreview(null)
      setResult(null)
      setFormData({
        purchase_date: new Date().toISOString().split('T')[0],
        storage_method: 'ตู้เย็น'
      })
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
      console.error('Save error:', error)
    }
  }

  const handleSaveImageOnly = async () => {
    if (!image) {
      toast.error('กรุณาเลือกรูปภาพ')
      return
    }

    try {
      const saveFormData = new FormData()
      saveFormData.append('image', image)
      saveFormData.append('purchase_date', formData.purchase_date || new Date().toISOString().split('T')[0])
      saveFormData.append('storage_method', formData.storage_method || 'ตู้เย็น')

      await foodService.saveImageOnly(saveFormData)
      toast.success('บันทึกรูปภาพสำเร็จ!')
      // Reset form
      setImage(null)
      setPreview(null)
      setResult(null)
      setFormData({
        purchase_date: new Date().toISOString().split('T')[0],
        storage_method: 'ตู้เย็น'
      })
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
      console.error('Save image error:', error)
    }
  }

  const getFreshnessColor = (score) => {
    if (score >= 75) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const getFreshnessText = (score) => {
    if (score >= 75) return 'สดมาก'
    if (score >= 50) return 'ควรรีบใช้'
    return 'ไม่ควรบริโภค'
  }

  return (
    <div className="scan-container">
      <div className="scan-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> กลับ
          </button>
          <div className="header-text">
            <h1>สแกนอาหาร</h1>
            <p>ถ่ายหรืออัพโหลดรูปเนื้อสัตว์เพื่อวิเคราะห์ความสด</p>
          </div>
        </div>
      </div>

      <div className="scan-content">
        <div className="upload-section card">
          <div className="upload-area" onClick={() => fileInputRef.current.click()}>
            {preview ? (
              <img src={preview} alt="Preview" className="preview-image" />
            ) : (
              <div className="upload-placeholder">
                <FaCamera size={64} color="#3b82f6" />
                <p>คลิกเพื่ออัพโหลดรูปภาพ</p>
                <span>รองรับไฟล์ JPG, PNG</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">วันที่ซื้อ</label>
              <input
                type="date"
                className="form-control"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">วิธีเก็บ</label>
              <select
                className="form-control"
                value={formData.storage_method}
                onChange={(e) => setFormData({ ...formData, storage_method: e.target.value })}
              >
                <option value="ตู้เย็น">ตู้เย็น</option>
                <option value="ช่องแข็ง">ช่องแข็ง</option>
              </select>
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={handleScan}
              disabled={scanning}
            >
              {scanning ? (
                <>
                  <div className="spinner"></div>
                  กำลังวิเคราะห์...
                </>
              ) : (
                'วิเคราะห์ความสด'
              )}
            </button>

            {preview && !result && (
              <button
                className="btn btn-success btn-block"
                onClick={handleSaveImageOnly}
              >
                บันทึกรูปภาพอย่างเดียว
              </button>
            )}
          </div>
        </div>

        {result && (
          <div className="result-section card">
            <h2>ผลการวิเคราะห์</h2>
            
            <div className="result-content">
              <div className="result-image">
                <img src={preview} alt="Scanned food" />
              </div>

              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-label">ประเภทเนื้อ:</span>
                  <span className="detail-value">{result.meat_type}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">วันที่ซื้อ:</span>
                  <span className="detail-value">
                    {new Date(result.purchase_date).toLocaleDateString('th-TH')}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">วิธีเก็บ:</span>
                  <span className="detail-value">{result.storage_method}</span>
                </div>

                <div className="freshness-result">
                  <h3>ระดับความสด</h3>
                  <div
                    className="freshness-circle"
                    style={{ borderColor: getFreshnessColor(result.freshness_score) }}
                  >
                    <span style={{ color: getFreshnessColor(result.freshness_score) }}>
                      {result.freshness_score}%
                    </span>
                  </div>
                  <p
                    className="freshness-label"
                    style={{ color: getFreshnessColor(result.freshness_score) }}
                  >
                    {getFreshnessText(result.freshness_score)}
                  </p>
                </div>

                <button className="btn btn-success btn-block" onClick={handleSave}>
                  บันทึกข้อมูล
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScanFood
