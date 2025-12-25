const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:' + (process.env.PORT || 5000) + '/api';

async function checkHealth() {
  try {
    console.log(`Testing Health Endpoint at ${BASE_URL}/health...`);
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check Passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('Starting Connectivity Tests...');
  const health = await checkHealth();
  if (!health) process.exit(1);
  console.log('All connectivity tests passed.');
}

runTests();
