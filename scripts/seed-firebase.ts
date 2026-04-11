// Script to seed Firebase with sample data
// Run: npm run seed

import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore } from 'firebase/firestore';

// Firebase configuration - hardcoded for script
const firebaseConfig = {
  apiKey: "AIzaSyDInHeTU4IWo4kVVsho62WcK6Vg9f83vfg",
  authDomain: "khmergo-ba0b0.firebaseapp.com",
  projectId: "khmergo-ba0b0",
  storageBucket: "khmergo-ba0b0.firebasestorage.app",
  messagingSenderId: "563133852511",
  appId: "1:563133852511:web:f5b7f2aebeab097a3064ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleTemples = [
  {
    name: 'Chùa Áng',
    rental: 'Vĩnh Long',
    location: 'Vĩnh Long',
    description: 'Chùa Khmer nổi tiếng với kiến trúc độc đáo',
    imageUrl: 'https://via.placeholder.com/400x300/4A7C59/FFFFFF?text=Chua+Ang',
    category: 'Chùa Khmer',
    isFavorite: true,
    latitude: 10.2397,
    longitude: 105.9722,
  },
  {
    name: 'Chùa Hang',
    rental: 'Vĩnh Long',
    location: 'Vĩnh Long',
    description: 'Chùa Khmer cổ kính với lịch sử lâu đời',
    imageUrl: 'https://via.placeholder.com/400x300/4A7C59/FFFFFF?text=Chua+Hang',
    category: 'Chùa Khmer',
    isFavorite: false,
    latitude: 10.2500,
    longitude: 105.9800,
  },
  {
    name: 'Chùa Dơi',
    rental: 'Sóc Trăng',
    location: 'Sóc Trăng',
    description: 'Ngôi chùa nổi tiếng với đàn dơi khổng lồ',
    imageUrl: 'https://via.placeholder.com/400x300/4A7C59/FFFFFF?text=Chua+Doi',
    category: 'Chùa Khmer',
    isFavorite: false,
    latitude: 9.6037,
    longitude: 105.9740,
  },
  {
    name: 'Chùa Đất Sét',
    rental: 'Sóc Trăng',
    location: 'Sóc Trăng',
    description: 'Chùa được xây dựng hoàn toàn bằng đất sét',
    imageUrl: 'https://via.placeholder.com/400x300/4A7C59/FFFFFF?text=Chua+Dat+Set',
    category: 'Chùa Khmer',
    isFavorite: false,
    latitude: 9.6100,
    longitude: 105.9650,
  },
  {
    name: 'Chùa Sơn',
    rental: 'Trà Vinh',
    location: 'Trà Vinh',
    description: 'Chùa Khmer đẹp nhất Trà Vinh',
    imageUrl: 'https://via.placeholder.com/400x300/4A7C59/FFFFFF?text=Chua+Son',
    category: 'Chùa Khmer',
    isFavorite: false,
    latitude: 9.9347,
    longitude: 106.3420,
  },
  {
    name: 'Chùa Kompong Chrây',
    rental: 'Trà Vinh',
    location: 'Trà Vinh',
    description: 'Chùa cổ với kiến trúc truyền thống Khmer',
    imageUrl: 'https://via.placeholder.com/400x300/4A7C59/FFFFFF?text=Kompong+Chray',
    category: 'Chùa Khmer',
    isFavorite: false,
    latitude: 9.9500,
    longitude: 106.3300,
  },
  {
    name: 'Chùa Chén Kiểu',
    rental: 'An Giang',
    location: 'An Giang',
    description: 'Chùa Khmer nổi tiếng ở An Giang',
    imageUrl: 'https://via.placeholder.com/400x300/4A7C59/FFFFFF?text=Chen+Kieu',
    category: 'Chùa Khmer',
    isFavorite: false,
    latitude: 10.5216,
    longitude: 105.1258,
  },
  {
    name: 'Chùa Xà Tón',
    rental: 'An Giang',
    location: 'An Giang',
    description: 'Chùa có kiến trúc độc đáo',
    imageUrl: 'https://via.placeholder.com/400x300/4A7C59/FFFFFF?text=Xa+Ton',
    category: 'Chùa Khmer',
    isFavorite: false,
    latitude: 10.5300,
    longitude: 105.1100,
  },
  {
    name: 'Chùa Pothivong',
    rental: 'Cần Thơ',
    location: 'Cần Thơ',
    description: 'Chùa Khmer tại trung tâm Cần Thơ',
    imageUrl: 'https://via.placeholder.com/400x300/4A7C59/FFFFFF?text=Pothivong',
    category: 'Chùa Khmer',
    isFavorite: false,
    latitude: 10.0452,
    longitude: 105.7469,
  },
  {
    name: 'Chùa Munirensay',
    rental: 'Cần Thơ',
    location: 'Cần Thơ',
    description: 'Ngôi chùa Khmer cổ kính',
    imageUrl: 'https://via.placeholder.com/400x300/4A7C59/FFFFFF?text=Munirensay',
    category: 'Chùa Khmer',
    isFavorite: false,
    latitude: 10.0300,
    longitude: 105.7600,
  },
];

async function seedDatabase() {
  console.log('🌱 Starting to seed Firebase database...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const temple of sampleTemples) {
    try {
      const docRef = await addDoc(collection(db, 'temples'), temple);
      console.log(`✅ Added: ${temple.name} (ID: ${docRef.id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to add ${temple.name}:`, error);
      errorCount++;
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error seeding database:', error);
    process.exit(1);
  });
