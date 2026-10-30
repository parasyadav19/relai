const API_URL = "https://hakunamatata-x7y7.onrender.com";

export const registerStudentAPI = async (rollno, name, photo) => {
  const fd = new FormData();
  fd.append('rollno', rollno);
  fd.append('name', name);
  fd.append('role', 'student');
  fd.append('branch', 'CSE');
  fd.append('year', '3rd Year');
  fd.append('photo', photo);
  const res = await fetch(`${API_URL}/register`, { method: 'POST', body: fd });
  return res.json();
};

export const markAttendanceAPI = async (photo) => {
  const loc = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
  const fd = new FormData();
  fd.append('file', photo, 'att.jpg');
  fd.append('latitude', loc.lat);
  fd.append('longitude', loc.lon);
  const res = await fetch(`${API_URL}/mark-attendance`, { method: 'POST', body: fd });
  return res.json();
};