import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDInHeTU4IWo4kVVsho62WcK6Vg9f83vfg",
  authDomain: "khmergo-ba0b0.firebaseapp.com",
  projectId: "khmergo-ba0b0",
  storageBucket: "khmergo-ba0b0.firebasestorage.app",
  messagingSenderId: "563133852511",
  appId: "1:563133852511:web:f5b7f2aebeab097a3064ea"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const CATEGORIES = [
  {
    id: "history",
    name: "Văn hóa",
    description: "Khám phá lịch sử và văn hóa Khmer",
    icon: "library",
    color: "#2196f3",
    displayOrder: 1
  },
  {
    id: "places",
    name: "Địa danh",
    description: "Các ngôi chùa và thắng cảnh nổi tiếng",
    icon: "map",
    color: "#4caf50",
    displayOrder: 2
  },
  {
    id: "food",
    name: "Ẩm thực",
    description: "Món ăn truyền thống đặc sắc",
    icon: "restaurant",
    color: "#ff9800",
    displayOrder: 3
  },
  {
    id: "festivals",
    name: "Lễ hội",
    description: "Các lễ hội truyền thống náo nhiệt",
    icon: "color-palette",
    color: "#9c27b0",
    displayOrder: 4
  }
];

async function seedCategories() {
  try {
    console.log('🚀 Đang nạp danh mục Quiz lên Firebase...');
    
    for (const cat of CATEGORIES) {
      await setDoc(doc(firestore, 'quizCategories', cat.id), cat);
      console.log(`✅ Đã nạp danh mục: ${cat.name}`);
    }
    
    console.log('🎉 Hoàn thành! Các chủ đề đã sẵn sàng hiển thị.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

seedCategories();
