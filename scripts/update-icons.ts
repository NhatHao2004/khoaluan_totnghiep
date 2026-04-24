import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';

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
    id: "places",
    name: "Chùa Khmer",
    description: "Tìm hiểu về các ngôi chùa Khmer nổi tiếng",
    icon: "trail-sign-outline", // Biểu tượng khám phá
    color: "#4caf50",
    displayOrder: 1
  },
  {
    id: "history",
    name: "Văn hóa",
    description: "Khám phá lịch sử và văn hóa truyền thống",
    icon: "color-palette-outline", // Biểu tượng nghệ thuật/văn hóa
    color: "#2196f3",
    displayOrder: 2
  },
  {
    id: "food",
    name: "Ẩm thực",
    description: "Món ăn truyền thống đặc sắc",
    icon: "cafe-outline", // Biểu tượng ẩm thực hiện đại
    color: "#ff9800",
    displayOrder: 3
  }
];

async function updateSystem() {
  try {
    // 1. Dọn dẹp danh mục
    console.log('🧹 Đang dọn dẹp danh mục cũ...');
    const catSnapshot = await getDocs(collection(db, 'quizCategories'));
    for (const d of catSnapshot.docs) {
      await deleteDoc(doc(db, 'quizCategories', d.id));
    }

    // 2. Nạp danh mục mới với Icon đẹp hơn
    console.log('🚀 Đang nạp danh mục với Icon mới: trail-sign, color-palette, cafe...');
    for (const cat of CATEGORIES) {
      await setDoc(doc(db, 'quizCategories', cat.id), cat);
      console.log(`✅ Đã nạp: ${cat.name}`);
    }

    // 3. Đảm bảo Quiz Chùa Âng vẫn ở đúng mục
    const quizSnapshot = await getDocs(collection(db, 'quizzes'));
    for (const d of quizSnapshot.docs) {
      if (d.data().title.includes('Chùa Âng')) {
        await updateDoc(doc(db, 'quizzes', d.id), {
          categoryId: "places",
          category: "Chùa Khmer"
        });
      }
    }

    console.log('🎉 Hoàn thành! Icon mới đã được cập nhật.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

updateSystem();
