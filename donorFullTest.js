const axios = require('axios');

const base = process.env.API_BASE_URL || 'http://localhost:5000/api';

(async () => {
  try {
    // Register seeker
    const seekerEmail = `seeker${Date.now()}@example.com`;
    const seekerReg = await axios.post(`${base}/auth/register`, {
      name: 'Test Seeker',
      email: seekerEmail,
      phone: '2223334444',
      password: 'Password1!',
      role: 'seeker',
    });
    console.log('Seeker registered');
    const seekerLogin = await axios.post(`${base}/auth/login`, { email: seekerEmail, password: 'Password1!' });
    const seekerToken = seekerLogin.data.token;
    // Create a blood request (with location coordinates)
    const requestRes = await axios.post(`${base}/seeker/requests`, {
      patientName: 'John Doe',
      bloodGroup: 'A+',
      unitsRequired: 2,
      urgencyLevel: 'critical',
      hospitalName: 'City Hospital',
      contactNumber: '555-1234',
      city: 'TestCity',
      state: 'TestState',
      lat: 12.9716,
      lng: 77.5946,
    }, { headers: { Authorization: `Bearer ${seekerToken}` } });
    console.log('Created request ID', requestRes.data.data._id);
    const requestId = requestRes.data.data._id;

    // Register donor
    const donorEmail = `donor${Date.now()}@example.com`;
    await axios.post(`${base}/auth/register`, {
      name: 'Test Donor',
      email: donorEmail,
      phone: '1112223333',
      password: 'Password1!',
      role: 'donor',
    });
    const donorLogin = await axios.post(`${base}/auth/login`, { email: donorEmail, password: 'Password1!' });
    const donorToken = donorLogin.data.token;

    // Ensure donor profile exists (ignore if already exists)
  await axios.post(`${base}/donor/profile`, {
    bloodGroup: 'A+',
    age: 30,
    gender: 'male',
    weight: 70,
    city: 'TestCity',
  }, { headers: { Authorization: `Bearer ${donorToken}` } }).catch(err => {
    if (err.response && err.response.status === 400 && err.response.data.message.includes('already exists')) {
      console.log('Donor profile already exists, continuing');
    } else {
      throw err;
    }
  });
  // Fetch nearby requests as donor
    const nearby = await axios.get(`${base}/donor/nearby-requests`, { headers: { Authorization: `Bearer ${donorToken}` } });
    console.log('Nearby requests count', nearby.data.count);

    if (nearby.data.count === 0) {
      console.error('No nearby requests found');
      return;
    }
    // Accept the first request
    const acceptRes = await axios.post(`${base}/donor/requests/${requestId}/accept`, {}, { headers: { Authorization: `Bearer ${donorToken}` } });
    console.log('Accept response status', acceptRes.status);
    console.log('Accept response data', acceptRes.data);
  } catch (err) {
    console.error('Test failed', err.response ? err.response.data : err.message);
  }
})();
