// Test Firebase connection
// Run: npx ts-node scripts/test-firebase.ts

import { getTemples } from '../services/firebase-service';

async function testFirebase() {
  console.log('🔥 Testing Firebase connection...\n');
  
  try {
    console.log('📡 Fetching temples from Firestore...');
    const temples = await getTemples();
    
    console.log(`✅ Success! Found ${temples.length} temples:\n`);
    temples.forEach((temple, index) => {
      console.log(`${index + 1}. ${temple.name} - ${temple.location}`);
    });
    
    console.log('\n🎉 Firebase is working correctly!');
  } catch (error) {
    console.error('❌ Error connecting to Firebase:');
    console.error(error);
    console.log('\n💡 Make sure you:');
    console.log('1. Created .env file with correct Firebase config');
    console.log('2. Enabled Firestore Database');
    console.log('3. Added sample data to "temples" collection');
  }
}

testFirebase();
