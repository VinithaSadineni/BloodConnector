const axios = require('axios');

(async () => {
  try {
    // Register hospital (unique email each run)
    const regResponse = await axios.post('http://localhost:5001/api/auth/register', {
      name: 'Test Hospital',
      email: `testhospital${Date.now()}@example.com`,
      phone: '1234567890',
      password: 'Password1!',
      role: 'hospital',
      hospitalName: 'Test Hospital',
      licenseNumber: 'LIC12345'
    }, { headers: { 'Content-Type': 'application/json' } });
    const token = regResponse.data.token;
    console.log('Registered, token obtained');

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const group of bloodGroups) {
      const stockResponse = await axios.post('http://localhost:5001/api/hospital/blood-stock', {
        bloodGroup: group,
        availableUnits: Math.floor(Math.random() * 10) + 1
      }, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      console.log(`Added/Updated ${group}:`, stockResponse.data.message);
    }
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
})();
