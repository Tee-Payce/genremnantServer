const axios = require('axios');

// Replace with your Railway URL or use localhost for local testing
const BASE_URL = process.env.API_URL || 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Database Tests...\n');
  
  const tests = [
    {
      name: 'Health Check',
      endpoint: '/health',
      method: 'GET'
    },
    {
      name: 'Database Persistence Test',
      endpoint: '/test-db-persistence',
      method: 'GET'
    },
    {
      name: 'CRUD Operations Test',
      endpoint: '/test-crud-operations',
      method: 'GET'
    },
    {
      name: 'Debug Users',
      endpoint: '/debug-users',
      method: 'GET'
    },
    {
      name: 'Create Admin User',
      endpoint: '/create-admin-now',
      method: 'POST'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      
      const response = test.method === 'GET' 
        ? await axios.get(`${BASE_URL}${test.endpoint}`)
        : await axios.post(`${BASE_URL}${test.endpoint}`);
      
      console.log(`✅ ${test.name}: PASSED`);
      console.log(`   Status: ${response.status}`);
      
      if (test.endpoint === '/test-db-persistence' || test.endpoint === '/test-crud-operations') {
        console.log(`   Success: ${response.data.success}`);
        console.log(`   DB Path: ${response.data.dbPath}`);
        console.log(`   Environment: ${response.data.environment}`);
      }
      
      if (test.endpoint === '/debug-users') {
        console.log(`   Users Count: ${response.data.count}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED`);
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      console.log('');
    }
  }
  
  console.log('🏁 Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };