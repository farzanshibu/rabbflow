const axios = require('axios');

// Test the Next.js API routes integration
const API_BASE = 'http://localhost:3000/api/rabbitmq';

async function testApiIntegration() {
  try {
    console.log('🧪 Testing Next.js API integration...\n');
    
    // Start the Next.js server (this would need to be done separately)
    console.log('⚠️  Make sure Next.js dev server is running on port 3000');
    console.log('   Run: npm run dev\n');
    
    // Test overview endpoint
    try {
      const overview = await axios.get(`${API_BASE}/overview`);
      console.log('✅ Overview API endpoint working');
      console.log('   Response structure:', Object.keys(overview.data));
    } catch (error) {
      console.log('❌ Overview API endpoint failed:', error.message);
    }
    
    // Test exchanges endpoint
    try {
      const exchanges = await axios.get(`${API_BASE}/exchanges`);
      console.log('✅ Exchanges API endpoint working');
      console.log('   Found exchanges:', exchanges.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Exchanges API endpoint failed:', error.message);
    }
    
    // Test queues endpoint
    try {
      const queues = await axios.get(`${API_BASE}/queues`);
      console.log('✅ Queues API endpoint working');
      console.log('   Found queues:', queues.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Queues API endpoint failed:', error.message);
    }
    
    // Test bindings endpoint
    try {
      const bindings = await axios.get(`${API_BASE}/bindings`);
      console.log('✅ Bindings API endpoint working');
      console.log('   Found bindings:', bindings.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Bindings API endpoint failed:', error.message);
    }
    
    console.log('\n🎉 API integration test completed!');
    console.log('📝 Note: Some endpoints may fail if Next.js server is not running');
    
  } catch (error) {
    console.error('❌ Error during API integration test:', error.message);
  }
}

// Export for potential use in other tests
module.exports = { testApiIntegration };

// Run if called directly
if (require.main === module) {
  testApiIntegration();
}