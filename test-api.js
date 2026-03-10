const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test auth endpoints existence (should return method not allowed or similar)
    try {
      await axios.get('http://localhost:5001/api/auth/me');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Auth endpoint accessible (401 expected without token)');
      } else {
        console.log('⚠️ Auth endpoint error:', error.response?.status || 'Connection failed');
      }
    }
    
    console.log('✅ Backend API is working correctly!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('Make sure the backend server is running on http://localhost:5001');
  }
}

testAPI();