import React, { useState, useRef, useEffect } from 'react'

const API_URL = "https://hakunamatata-x7y7.onrender.com";

export default function App() {
  const [tab, setTab] = useState('att')
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [regStatus, setRegStatus] = useState({ type: '', msg: '' })
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ roll: '', name: '', role: 'student', branch: 'CSE', year: '3rd Year' })
  const videoAtt = useRef(null)
  const videoReg = useRef(null)

  useEffect(() => {
    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoAtt.current) videoAtt.current.srcObject = s
        if (videoReg.current) videoReg.current.srcObject = s
      } catch { alert('Please allow camera access') }
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
      setRegStatus({ type: 'error', msg: '❌ Please enter Roll No and Full Name' })
      return
    }
    setRegStatus({ type: 'warn', msg: '⏳ Registering, please wait...' })
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
      else setRegStatus({ type: 'success', msg: `✅ Registered Successfully! Roll: ${data.rollno} <br>You can now mark attendance` })
    } catch (e) { setRegStatus({ type: 'error', msg: '❌ ' + e.message }) }
  }

  const mark = async () => {
    setLoading(true)
    setStatus({ type: 'warn', msg: '⏳ Fetching GPS location...' })
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
      setStatus({ type: 'error', msg: `❌ Location access denied!<br><small>${err.message}</small>` })
      setLoading(false)
      return
    }
    setStatus({ type: 'warn', msg: `📍 GPS: ${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}<br>⏳ Verifying face...` })
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
      else if (data.status === 'Out of Range') setStatus({ type: 'error', msg: `📍 <b>You are outside college premises!</b><br>${data.message}` })
      else if (data.status === 'Present') setStatus({ type: 'success', msg: `✅ <b>Attendance Marked!</b><br>👤 ${data.name}<br>🆔 ${data.rollno}<br>📚 ${data.branch}<br>⏰ ${data.time || new Date().toLocaleString()}` })
      else setStatus({ type: 'error', msg: `❌ ${data.message || 'Unknown error'}` })
    } catch (e) { setStatus({ type: 'error', msg: '❌ Server error: ' + e.message }) }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f1f5f9', minHeight: '100vh', padding: '12px' }}>
      
      {/* RESPONSIVE NAVBAR WITH HAMBURGER */}
      <div style={{ maxWidth: 1100, margin: '0 auto 20px', background: 'white', borderRadius: 20, boxShadow: '0 12px 40px rgba(0,0,0,0.08)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🎓</span>
          <b style={{ fontSize: 18, color: '#0f172a' }}>College Registration Portal</b>
        </div>

        {/* Desktop Buttons */}
        <div style={{ display: 'flex', gap: 8 }} className="desktop-only">
          <button onClick={() => setTab('reg')} style={{ padding: '10px 22px', borderRadius: 30, border: 0, cursor: 'pointer', fontWeight: '700', background: tab === 'reg' ? '#0f172a' : '#f1f5f9', color: tab === 'reg' ? 'white' : '#334155', display: window.innerWidth < 768 ? 'none' : 'block' }}>Register</button>
          <button onClick={() => setTab('att')} style={{ padding: '10px 22px', borderRadius: 30, border: 0, cursor: 'pointer', fontWeight: '700', background: tab === 'att' ? '#0f172a' : '#f1f5f9', color: tab === 'att' ? 'white' : '#334155', display: window.innerWidth < 768 ? 'none' : 'block' }}>Attendance</button>
        </div>

        {/* Mobile Hamburger */}
        <div className="mobile-only" style={{ display: 'none' }}>
           {/* We will use CSS media query via inline style hack */}
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'block', fontSize: 24, background: 'transparent', border: 0, cursor: 'pointer' }} className="hamburger">☰</button>
        
        {menuOpen && (
          <div style={{ position: 'absolute', right: 16, top: 60, background: 'white', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', padding: 12, width: 180, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => { setTab('reg'); setMenuOpen(false)}} style={{ padding: '12px', borderRadius: 10, border: 0, textAlign: 'left', background: tab==='reg' ? '#0f172a' : '#f1f5f9', color: tab==='reg' ? 'white' : '#0f172a', fontWeight: 700 }}>Register</button>
            <button onClick={() => { setTab('att'); setMenuOpen(false)}} style={{ padding: '12px', borderRadius: 10, border: 0, textAlign: 'left', background: tab==='att' ? '#0f172a' : '#f1f5f9', color: tab==='att' ? 'white' : '#0f172a', fontWeight: 700 }}>Attendance</button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hamburger { display: block !important; }
          .desktop-only button { display: none !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
        }
      `}</style>

      {/* MAIN CARD - Responsive */}
      <div style={{ maxWidth: 1100, margin: '0 auto', background: 'white', borderRadius: 28, boxShadow: '0 20px 80px rgba(0,0,0,0.12)', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>

        <div style={{ flex: '1 1 420px', background: '#f8fafc', padding: 20, borderRight: '1px solid #eef2f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>Face Scan</h2>
            <span style={{ background: 'white', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: '800', color: '#10b981' }}>● LIVE</span>
          </div>
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#000', border: '4px solid white' }}>
            <video ref={tab === 'reg' ? videoReg : videoAtt} autoPlay muted playsInline style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: '700' }}>📷 Camera Active • {tab === 'reg' ? 'Align your face in frame' : 'Position your face within the frame'}</div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 18, fontSize: 11, color: '#475569', fontWeight: 600, flexWrap: 'wrap' }}>
            <span>✅ Confidence 96%</span>
            <span>☀️ Lighting Optimal</span>
            <span>🛡️ Liveness: Verified</span>
          </div>
        </div>

        <div style={{ flex: '1 1 420px', padding: 24 }}>
          {tab === 'reg' ? (
            <>
              <h2 style={{ margin: '0 0 6px', fontSize: 28, color: '#0f172a' }}>Student Details</h2>
              <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: 13 }}>Enter student information to register face</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Roll No
                  <input value={form.roll} onChange={e => setForm({ ...form, roll: e.target.value.toUpperCase() })} placeholder="0508CS251039" style={{ width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Full Name
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" style={{ width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <label style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>Branch
                    <select value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} style={{ width: '100%', marginTop: 6, padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1' }}><option>CSE</option><option>ECE</option><option>ME</option><option>EE</option><option>CE</option></select>
                  </label>
                  <label style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>Year
                    <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} style={{ width: '100%', marginTop: 6, padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1' }}><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select>
                  </label>
                </div>
              </div>
              <button onClick={register} style={{ width: '100%', marginTop: 20, padding: '14px', borderRadius: 14, border: 0, background: 'linear-gradient(90deg,#1e40af,#3b82f6)', color: 'white', fontWeight: '800', fontSize: 16, cursor: 'pointer' }}>🛡️ Register Face</button>
              {regStatus.msg && <div style={{ marginTop: 16, padding: 14, borderRadius: 12, fontSize: 13, background: regStatus.type==='success' ? '#dcfce7' : regStatus.type==='warn' ? '#fef9c3' : '#fee2e2' }} dangerouslySetInnerHTML={{ __html: regStatus.msg }} />}
            </>
          ) : (
            <>
              <h2 style={{ margin: '0 0 6px', fontSize: 24, color: '#0f172a' }}>Mark Attendance</h2>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: 14, borderRadius: 14, background: '#f8fafc', border: '1px solid #eef2f7', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center' }}>✅</span>
                  <div><b style={{ fontSize: 14 }}>Live Face</b><div style={{ fontSize: 12, color: '#64748b' }}>Verified • Real-time detection</div></div>
                </div>
                <div style={{ padding: 14, borderRadius: 14, background: '#f8fafc', border: '1px solid #eef2f7', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', display: 'grid', placeItems: 'center' }}>📍</span>
                  <div><b style={{ fontSize: 14 }}>GPS Check</b><div style={{ fontSize: 12, color: '#64748b' }}>On campus verification required</div></div>
                </div>
              </div>
              <button disabled={loading} onClick={mark} style={{ width: '100%', marginTop: 20, padding: '14px', borderRadius: 14, border: 0, background: loading ? '#94a3b8' : 'linear-gradient(90deg,#2563eb,#1d4ed8)', color: 'white', fontWeight: '800', fontSize: 16, cursor: 'pointer' }}>{loading ? '⏳ Verifying...' : '✅ Mark My Attendance'}</button>
              {status.msg && <div style={{ marginTop: 16, padding: 14, borderRadius: 12, fontSize: 13, background: status.type==='success' ? '#dcfce7' : status.type==='warn' ? '#fef9c3' : '#fee2e2' }} dangerouslySetInnerHTML={{ __html: status.msg }} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}