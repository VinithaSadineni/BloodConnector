const axios = require('axios');
(async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test Hospital',
      email: `testhospital${Date.now()}@example.com`,
      phone: '1234567890',
      password: 'Password1!',
      role: 'hospital',
      hospitalName: 'Test Hospital',
      licenseNumber: 'LIC12345'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
})();
