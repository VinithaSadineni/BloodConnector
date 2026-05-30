const axios = require('axios');

(async () => {
  const base = 'http://localhost:5000/api';
  // Register a donor
  const email = `donor${Date.now()}@example.com`;
  const reg = await axios.post(`${base}/auth/register`, {
    name: 'Test Donor',
    email,
    phone: '1112223333',
    password: 'Password1!',
    role: 'donor',
    bloodGroup: 'A+', // extra field may be ignored by auth but needed for profile later
    city: 'TestCity'
  });
  console.log('Donor register status', reg.status);

  // Login donor
  const login = await axios.post(`${base}/auth/login`, { email, password: 'Password1!' });
  console.log('Donor login status', login.status);
  const token = login.data.token;

  // Create donor profile (required for nearby requests)
  await axios.post(`${base}/donor/profile`, {
    bloodGroup: 'A+',
    age: 30,
    gender: 'male',
    weight: 70,
    city: 'TestCity'
  }, { headers: { Authorization: `Bearer ${token}` } });
  console.log('Donor profile created');

  // Fetch nearby requests (should be empty unless a seeker created one)
  const nearby = await axios.get(`${base}/donor/nearby-requests`, { headers: { Authorization: `Bearer ${token}` } });
  console.log('Nearby requests count', nearby.data.count);
  if (nearby.data.count > 0) {
    const reqId = nearby.data.data[0]._id;
    const accept = await axios.post(`${base}/donor/requests/${reqId}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Accept status', accept.status);
  }
})();
