const axios = require('axios');

async function testRegistration() {
  const roles = ['seeker', 'donor', 'hospital', 'admin'];
  
  for (const role of roles) {
    try {
      const email = `test${role}${Date.now()}@example.com`;
      console.log(`Testing registration for ${role}...`);
      const payload = {
        name: `Test ${role}`,
        email: email,
        phone: '1234567890',
        password: 'Password1!',
        role: role,
      };
      
      if (role === 'hospital') {
        payload.hospitalName = 'Test Hospital';
        payload.licenseNumber = 'LIC123';
      }
      
      const response = await axios.post(process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/auth/register` : 'http://localhost:5000/api/auth/register', payload);
      console.log(`✅ ${role} registered successfully! Status: ${response.status}`);
    } catch (error) {
      console.error(`❌ ${role} registration failed!`);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
    }
  }
}

testRegistration();
