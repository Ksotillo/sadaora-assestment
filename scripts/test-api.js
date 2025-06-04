#!/usr/bin/env node

/**
 * API Test Script for Sadaora Assessment
 * Run this after completing the setup to verify all endpoints work
 * 
 * Usage: node scripts/test-api.js
 */

const BASE_URL = 'http://localhost:3000'

async function testEndpoint(method, url, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    const response = await fetch(`${BASE_URL}${url}`, options)
    const result = await response.json()
    
    console.log(`✅ ${method} ${url} - Status: ${response.status}`)
    console.log('Response:', JSON.stringify(result, null, 2))
    console.log('---')
    
    return { success: response.ok, data: result }
  } catch (error) {
    console.log(`❌ ${method} ${url} - Error: ${error.message}`)
    console.log('---')
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('🚀 Testing Sadaora API Endpoints...\n')
  
  // Test 1: Get all profiles (should return empty array initially)
  console.log('Test 1: Get all profiles')
  await testEndpoint('GET', '/api/profiles')
  
  // Test 2: Get profiles with pagination
  console.log('Test 2: Get profiles with pagination')
  await testEndpoint('GET', '/api/profiles?page=1&limit=5')
  
  // Test 3: Search profiles (should return empty)
  console.log('Test 3: Search profiles')
  await testEndpoint('GET', '/api/profiles?search=test')
  
  // Test 4: Try to get a non-existent profile
  console.log('Test 4: Get non-existent profile')
  await testEndpoint('GET', '/api/profiles/non-existent-user')
  
  console.log('✨ API tests completed!')
  console.log('\n📝 Notes:')
  console.log('- All GET endpoints should work without authentication')
  console.log('- POST/PUT/DELETE endpoints require authentication via Clerk')
  console.log('- To test authenticated endpoints, you\'ll need to use the UI once it\'s built')
  console.log('- Empty results are expected since no profiles exist yet')
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/profiles`)
    return response.ok || response.status === 401 // 401 is ok, means auth is working
  } catch (error) {
    console.log(`❌ Server check failed: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🔍 Checking if development server is running...')
  
  const isServerRunning = await checkServer()
  if (!isServerRunning) {
    console.log('❌ Development server is not running!')
    console.log('Please run: npm run dev')
    console.log('Then try this script again.')
    process.exit(1)
  }
  
  console.log('✅ Development server is running!\n')
  await runTests()
}

main().catch(console.error) 