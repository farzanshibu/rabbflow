const axios = require('axios');

const RABBITMQ_API_BASE = 'http://localhost:15672/api';
const RABBITMQ_USERNAME = 'guest';
const RABBITMQ_PASSWORD = 'guest';

const rabbitmqApi = axios.create({
  baseURL: RABBITMQ_API_BASE,
  auth: {
    username: RABBITMQ_USERNAME,
    password: RABBITMQ_PASSWORD,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testConnection() {
  try {
    console.log('Testing RabbitMQ API connection...');
    
    // Test overview endpoint
    const overview = await rabbitmqApi.get('/overview');
    console.log('✅ Overview endpoint working');
    
    // Test exchanges endpoint
    const exchanges = await rabbitmqApi.get('/exchanges');
    console.log('✅ Exchanges endpoint working, found', exchanges.data.length, 'exchanges');
    
    // Test queues endpoint
    const queues = await rabbitmqApi.get('/queues');
    console.log('✅ Queues endpoint working, found', queues.data.length, 'queues');
    
    // Test bindings endpoint
    const bindings = await rabbitmqApi.get('/bindings');
    console.log('✅ Bindings endpoint working, found', bindings.data.length, 'bindings');
    
    console.log('\n🎉 All RabbitMQ API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing RabbitMQ connection:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testConnection();