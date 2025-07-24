import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testApi() {
  try {
    const port = process.env.PORT || 3000;
    const url = `http://localhost:${port}/api/menu`;
    
    console.log(`Testing API: ${url}`);
    const response = await fetch(url);
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      console.log('Response:', data);
    } catch {
      console.log('Raw response (first 500 chars):\n', text.slice(0, 500));
    }
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testApi();