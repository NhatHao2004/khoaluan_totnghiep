import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDInHeTU4IWo4kVVsho62WcK6Vg9f83vfg",
  authDomain: "khmergo-ba0b0.firebaseapp.com",
  projectId: "khmergo-ba0b0",
  storageBucket: "khmergo-ba0b0.firebasestorage.app",
  messagingSenderId: "563133852511",
  appId: "1:563133852511:web:f5b7f2aebeab097a3064ea"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    icon: "business", // Biểu tượng tòa nhà/chùa
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

async function cleanupAndSeed() {
  try {
    console.log('🧹 Đang dọn dẹp danh mục cũ...');
    const querySnapshot = await getDocs(collection(db, 'quizCategories'));
    for (const document of querySnapshot.docs) {
      await deleteDoc(doc(db, 'quizCategories', document.id));
    }
    console.log('✅ Đã xóa sạch danh mục cũ.');

    console.log('🚀 Đang nạp danh mục chuẩn mới...');
    for (const cat of CATEGORIES) {
      await setDoc(doc(db, 'quizCategories', cat.id), cat);
      console.log(`✅ Đã nạp: ${cat.name} (ID: ${cat.id})`);
    }

    console.log('🎉 Xong! Bạn hãy khởi động lại App và kiểm tra nhé.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

cleanupAndSeed();
