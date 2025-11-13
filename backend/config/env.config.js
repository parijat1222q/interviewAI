// Validates required environment variables
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'OPENAI_KEY'
];

module.exports = function validateEnv() {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ All environment variables validated');
};