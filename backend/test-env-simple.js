// Quick test - Save as test-env.js in your BACKEND directory
// Run: node test-env.js

require('dotenv').config();

console.log('\n🧪 Environment Variable Test\n');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('PORT:', process.env.PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('\n');

if (process.env.FRONTEND_URL === undefined) {
    console.log('❌ FRONTEND_URL is undefined!');
    console.log('\n✅ Fix:');
    console.log('1. Make sure .env file is in the BACKEND root directory');
    console.log('2. Check .env has: FRONTEND_URL=http://localhost:5173');
    console.log('3. No spaces: FRONTEND_URL=value (not FRONTEND_URL = value)');
} else {
    console.log('✅ .env file is working!');
    console.log('Just restart your backend server.');
}
