require('@testing-library/jest-dom')

// Mock environment variables
process.env.NEXT_PUBLIC_RABBITMQ_API_URL = 'http://localhost:15672/api'
process.env.RABBITMQ_USERNAME = 'guest'
process.env.RABBITMQ_PASSWORD = 'guest'
process.env.RABBITMQ_VHOST = '/'