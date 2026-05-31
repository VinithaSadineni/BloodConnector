const axios = require('axios');

(async () => {
  try {
    const base = process.env.API_BASE_URL || 'http://localhost:5000/api';
    // Register a test user
    const email = `test${Date.now()}@example.com`;
    const reg = await axios.post(`${base}/auth/register`, {
      name: 'Test User',
      email,
      phone: '1234567890',
      password: 'Password1!',
      role: 'seeker'
    });
    console.log('Register status:', reg.status);
    // Login
    const login = await axios.post(`${base}/auth/login`, {
      email,
      password: 'Password1!'
    });
    console.log('Login status:', login.status);
    const token = login.data.token;
    // Get authenticated user info
    const me = await axios.get(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Authenticated user:', me.data);
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
})();
