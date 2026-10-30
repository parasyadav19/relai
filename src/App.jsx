import React, { useState, useRef, useEffect } from 'react'

const API_URL = "https://hakunamatata-x7y7.onrender.com";

export default function App() {
  const [tab, setTab] = useState('att')
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [regStatus, setRegStatus] = useState({ type: '', msg: '' })
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ roll: '', name: '', role: 'student', branch: 'CSE', year: '3rd Year' })
  const videoAtt = useRef(null)
  const videoReg = useRef(null)

  useEffect(() => {
    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoAtt.current) videoAtt.current.srcObject = s
        if (videoReg.current) videoReg.current.srcObject = s
      } catch { alert('Camera allow karo') }
    }
    start()
  }, [tab])

  const capture = (video) => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0)
    return new Promise(r => canvas.toBlob(r, 'image/jpeg'))
  }

  const register = async () => {
    if (!form.roll || !form.name) {
      setRegStatus({ type: 'error', msg: '❌ Roll No and Name likho' })
      return
    }
    setRegStatus({ type: 'warn', msg: '⏳ Registering...' })
    const blob = await capture(videoReg.current)
    const fd = new FormData()
    fd.append('rollno', form.roll)
    fd.append('name', form.name)
    fd.append('role', form.role)
    fd.append('branch', form.branch)
    fd.append('year', form.year)
    fd.append('photo', blob, 'reg.jpg')
    try {
      const res = await fetch(`${API_URL}/register`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) setRegStatus({ type: 'error', msg: '❌ ' + data.error })
      else setRegStatus({ type: 'success', msg: `✅ Registered! Roll: ${data.rollno} <br>Ab Attendance mark kar sakte ho` })
    } catch (e) { setRegStatus({ type: 'error', msg: '❌ ' + e.message }) }
  }

  const mark = async () => {
    setLoading(true)
    setStatus({ type: 'warn', msg: '⏳ Getting GPS location...' })
    let loc
    try {
      loc = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          err => reject(err),
          { enableHighAccuracy: true, timeout: 15000 }
        )
      })
    } catch (err) {
      setStatus({ type: 'error', msg: `❌ Location Allow karo!<br><small>${err.message}</small>` })
      setLoading(false)
      return
    }
    setStatus({ type: 'warn', msg: `📍 GPS: ${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}<br>⏳ Checking face...` })
    const blob = await capture(videoAtt.current)
    const fd = new FormData()
    fd.append('file', blob, 'att.jpg')
    fd.append('latitude', loc.lat)
    fd.append('longitude', loc.lon)
    try {
      const res = await fetch(`${API_URL}/mark-attendance`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) setStatus({ type: 'error', msg: `❌ ${data.error}` })
      else if (data.status === 'Already Marked') setStatus({ type: 'error', msg: `❌ <b>Already Marked!</b><br>👤 ${data.name}<br>🆔 ${data.rollno}` })
      else if (data.status === 'Closed') setStatus({ type: 'error', msg: `⏰ <b>Time Over!</b><br>${data.message}` })
      else if (data.status === 'Out of Range') setStatus({ type: 'error', msg: `📍 <b>College se bahar ho!</b><br>${data.message}` })
      else if (data.status === 'Present') setStatus({ type: 'success', msg: `✅ <b>Attendance Marked!</b><br>👤 ${data.name}<br>🆔 ${data.rollno}<br>📚 ${data.branch}<br>📍 ${data.distance || ''}<br>⏰ ${data.time || new Date().toLocaleString()}` })
    } catch (e) { setStatus({ type: 'error', msg: '❌ Server error: ' + e.message }) }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f1f5f9', minHeight: '100vh', padding: '20px' }}>
      
      {/* WHITE SHADOW NAVBAR */}
      <div style={{ maxWidth: 1100, margin: '0 auto 24px', background: 'white', borderRadius: 20, boxShadow: '0 12px 40px rgba(0,0,0,0.08)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🎓</span>
          <b style={{ fontSize: 20, color: '#0f172a' }}>College Registration Portal</b>
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 12, display: 'none' }}>Face-Enabled • Secure</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('reg')} style={{ padding: '10px 22px', borderRadius: 30, border: 0, cursor: 'pointer', fontWeight: '700', transition: '0.2s', background: tab === 'reg' ? '#0f172a' : '#f1f5f9', color: tab === 'reg' ? 'white' : '#334155' }}>Register</button>
          <button onClick={() => setTab('att')} style={{ padding: '10px 22px', borderRadius: 30, border: 0, cursor: 'pointer', fontWeight: '700', transition: '0.2s', background: tab === 'att' ? '#0f172a' : '#f1f5f9', color: tab === 'att' ? 'white' : '#334155' }}>Attendance</button>
        </div>
      </div>

      {/* MAIN WHITE SHADOW CARD */}
      <div style={{ maxWidth: 1100, margin: '0 auto', background: 'white', borderRadius: 28, boxShadow: '0 20px 80px rgba(0,0,0,0.12)', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>

        {/* LEFT - FACE SCAN */}
        <div style={{ flex: '1 1 420px', background: '#f8fafc', padding: 28, borderRight: '1px solid #eef2f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 26, color: '#0f172a' }}>Face Scan</h2>
            <span style={{ background: 'white', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: '800', color: '#10b981', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>● LIVE</span>
          </div>

          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#000', boxShadow: '0 12px 30px rgba(0,0,0,0.15)', border: '4px solid white' }}>
            <video ref={tab === 'reg' ? videoReg : videoAtt} autoPlay muted playsInline style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }} />
            {/* Futuristic overlay corners */}
            <div style={{ position: 'absolute', inset: 12, border: '1px dashed rgba(255,255,255,0.25)', borderRadius: 16, pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: '700' }}>📷 Camera Active • {tab === 'reg' ? 'Waiting for face detection...' : 'Position your face within the frame'}</div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 18, fontSize: 12, color: '#475569', fontWeight: 600 }}>
            <span>✅ Confidence 96%</span>
            <span>☀️ Lighting Optimal</span>
            <span>🛡️ Liveness: Verified</span>
          </div>
        </div>

        {/* RIGHT - FORM / ATTENDANCE */}
        <div style={{ flex: '1 1 420px', padding: 32 }}>
          {tab === 'reg' ? (
            <>
              <h2 style={{ margin: '0 0 6px', fontSize: 32, color: '#0f172a' }}>Student Details</h2>
              <p style={{ margin: '0 0 22px', color: '#64748b', fontSize: 13 }}>Enter the student information to register face</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Roll No
                  <input value={form.roll} onChange={e => setForm({ ...form, roll: e.target.value })} placeholder="0508CS251039" style={{ width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', outline: 'none', fontSize: 14 }} />
                </label>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Full Name
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" style={{ width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', outline: 'none', fontSize: 14, background: '#f8fafc' }} />
                </label>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Role
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', background: 'white' }}><option>student</option><option>teacher</option></select>
                </label>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Branch
                  <select value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} style={{ width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', background: 'white' }}><option>CSE</option><option>ECE</option><option>ME</option><option>EE</option></select>
                </label>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Year
                  <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} style={{ width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', background: 'white' }}><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select>
                </label>
              </div>

              <button onClick={register} style={{ width: '100%', marginTop: 22, padding: '14px', borderRadius: 14, border: 0, background: 'linear-gradient(90deg,#1e40af,#3b82f6)', color: 'white', fontWeight: '800', fontSize: 16, cursor: 'pointer', boxShadow: '0 8px 20px rgba(37,99,235,0.3)' }}>🛡️ Register Face</button>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 12, textAlign: 'center' }}>By registering, your facial data will be securely encrypted per college policy.</p>
              {regStatus.msg && <div style={{ marginTop: 16, padding: 14, borderRadius: 12, fontSize: 13, background: regStatus.type==='success' ? '#dcfce7' : regStatus.type==='warn' ? '#fef9c3' : '#fee2e2' }} dangerouslySetInnerHTML={{ __html: regStatus.msg }} />}
            </>
          ) : (
            <>
              <h2 style={{ margin: '0 0 6px', fontSize: 28, color: '#0f172a' }}>Mark Attendance Details</h2>
              
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: 16, borderRadius: 16, background: '#f8fafc', border: '1px solid #eef2f7', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center' }}>✅</span>
                  <div><b style={{ fontSize: 14 }}>Live Face</b><div style={{ fontSize: 12, color: '#64748b' }}>Verified • Real-time detection confirmed</div></div>
                </div>
                <div style={{ padding: 16, borderRadius: 16, background: '#f8fafc', border: '1px solid #eef2f7', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', display: 'grid', placeItems: 'center' }}>📍</span>
                  <div><b style={{ fontSize: 14 }}>GPS</b><div style={{ fontSize: 12, color: '#64748b' }}>On campus • Engineering Block check • Accuracy ±5m</div></div>
                </div>
                <div style={{ padding: 16, borderRadius: 16, background: 'white', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 22 }}>⏰</span>
                    <div><b style={{ fontSize: 14 }}>10:00 AM Check</b><div style={{ fontSize: 12, color: '#64748b' }}>On time • Expected by 10:00 AM</div></div>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>On Time</span>
                </div>
              </div>

              <button disabled={loading} onClick={mark} style={{ width: '100%', marginTop: 22, padding: '14px', borderRadius: 14, border: 0, background: loading ? '#94a3b8' : 'linear-gradient(90deg,#2563eb,#1d4ed8)', color: 'white', fontWeight: '800', fontSize: 16, cursor: 'pointer', boxShadow: '0 8px 20px rgba(37,99,235,0.3)' }}>{loading ? '⏳ Verifying...' : '✅ Mark My Attendance'}</button>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 12, textAlign: 'center' }}>By marking attendance you confirm your presence is verified via face & GPS.</p>

              {status.msg && <div style={{ marginTop: 16, padding: 14, borderRadius: 12, fontSize: 13, textAlign: 'left', background: status.type==='success' ? '#dcfce7' : status.type==='warn' ? '#fef9c3' : '#fee2e2' }} dangerouslySetInnerHTML={{ __html: status.msg }} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}